import { createClient } from '@supabase/supabase-js'
import { FirecrawlApp } from '@mendable/firecrawl-js'
import OpenAI from 'openai'

// Initialize services
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const firecrawl = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY
})

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Serper API integration (manual implementation)
async function searchWithSerper(query) {
  try {
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': process.env.SERPER_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: query,
        num: 10
      })
    })
    
    if (!response.ok) {
      throw new Error('Serper API request failed')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Serper search failed:', error)
    return null
  }
}

export async function POST(req) {
  try {
    const { url, userId } = await req.json()

    if (!url) {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid URL format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Check if context already exists and is recent (within 24 hours)
    const { data: existingContext } = await supabase
      .from('website_contexts')
      .select('*')
      .eq('url', url)
      .eq('status', 'completed')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .single()

    if (existingContext) {
      return new Response(JSON.stringify({ 
        success: true,
        contextId: existingContext.id,
        cached: true,
        summary: {
          pagesAnalyzed: existingContext.page_content?.length || 0,
          searchTerms: existingContext.search_terms?.length || 0,
          competitorData: existingContext.search_results?.length || 0
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Create initial context record
    const { data: initialContext, error: insertError } = await supabase
      .from('website_contexts')
      .insert([{
        url,
        user_id: userId,
        status: 'analyzing'
      }])
      .select()
      .single()

    if (insertError) {
      console.error('Database insert error:', insertError)
      throw new Error('Failed to create context record')
    }

    // Step 1: Crawl the website with Firecrawl
    let crawlResult
    try {
      crawlResult = await firecrawl.scrapeUrl(url, {
        formats: ['markdown'],
        onlyMainContent: true,
        timeout: 30000
      })
    } catch (error) {
      console.error('Firecrawl error:', error)
      await supabase
        .from('website_contexts')
        .update({ status: 'failed', analysis_summary: { error: 'Failed to crawl website' } })
        .eq('id', initialContext.id)
      
      return new Response(JSON.stringify({ 
        error: 'Failed to crawl website',
        details: error.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (!crawlResult.success) {
      await supabase
        .from('website_contexts')
        .update({ status: 'failed', analysis_summary: { error: 'Website crawl unsuccessful' } })
        .eq('id', initialContext.id)

      return new Response(JSON.stringify({ 
        error: 'Website crawl unsuccessful',
        details: crawlResult.error || 'Unknown crawl error'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Step 2: Extract key content and metadata
    const pageContent = {
      url: crawlResult.data.metadata.url || url,
      title: crawlResult.data.metadata.title || '',
      description: crawlResult.data.metadata.description || '',
      content: crawlResult.data.markdown || '',
      keywords: crawlResult.data.metadata.keywords || []
    }

    // Step 3: Generate search terms using AI
    const searchTerms = await generateSearchTerms(pageContent)

    // Step 4: Use Serper to get competitive and market data
    const searchResults = []
    if (searchTerms.length > 0) {
      const searchPromises = searchTerms.slice(0, 5).map(term => searchWithSerper(term))
      const results = await Promise.all(searchPromises)
      
      for (let i = 0; i < results.length; i++) {
        if (results[i]) {
          searchResults.push({
            query: searchTerms[i],
            ...results[i]
          })
        }
      }
    }

    // Step 5: Generate analysis summary
    const analysisSummary = await generateAnalysisSummary(pageContent, searchResults)

    // Step 6: Store completed context in database
    const { data: completedContext, error: updateError } = await supabase
      .from('website_contexts')
      .update({
        page_content: [pageContent],
        search_terms: searchTerms,
        search_results: searchResults,
        analysis_summary: analysisSummary,
        analyzed_at: new Date().toISOString(),
        status: 'completed'
      })
      .eq('id', initialContext.id)
      .select()
      .single()

    if (updateError) {
      console.error('Database update error:', updateError)
      throw new Error('Failed to update context')
    }

    return new Response(JSON.stringify({ 
      success: true,
      contextId: completedContext.id,
      cached: false,
      summary: {
        pagesAnalyzed: 1,
        searchTerms: searchTerms.length,
        competitorData: searchResults.length
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Context analysis error:', error)
    return new Response(JSON.stringify({ 
      error: 'Failed to analyze context',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

async function generateSearchTerms(pageContent) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a marketing analyst. Given website content, generate relevant search terms for competitive analysis. Focus on:
          1. Main business/product keywords
          2. Industry terms
          3. Competitor research terms
          4. Target audience keywords
          
          Return ONLY a JSON array of 8-12 search terms, nothing else.`
        },
        {
          role: 'user',
          content: `Website: ${pageContent.title}\nDescription: ${pageContent.description}\nContent: ${pageContent.content.slice(0, 2000)}...`
        }
      ],
      temperature: 0.7,
      max_tokens: 200
    })

    const searchTermsText = response.choices[0].message.content.trim()
    return JSON.parse(searchTermsText)
  } catch (error) {
    console.error('Search terms generation failed:', error)
    // Fallback to basic keyword extraction
    const words = pageContent.content.toLowerCase().match(/\b\w+\b/g) || []
    const wordCount = {}
    words.forEach(word => {
      if (word.length > 4) {
        wordCount[word] = (wordCount[word] || 0) + 1
      }
    })
    
    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .map(([word]) => word)
  }
}

async function generateAnalysisSummary(pageContent, searchResults) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a marketing strategist. Analyze the website content and competitive landscape to provide actionable insights. Return a JSON object with:
          {
            "business_overview": "Brief description of the business",
            "key_strengths": ["strength1", "strength2"],
            "market_opportunities": ["opportunity1", "opportunity2"],
            "competitive_landscape": "Brief competitive analysis",
            "recommended_focus_areas": ["area1", "area2"]
          }`
        },
        {
          role: 'user',
          content: `Website: ${pageContent.title}\nDescription: ${pageContent.description}\nContent: ${pageContent.content.slice(0, 1500)}\n\nCompetitive Data: ${JSON.stringify(searchResults.slice(0, 2))}`
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    })

    return JSON.parse(response.choices[0].message.content.trim())
  } catch (error) {
    console.error('Analysis summary generation failed:', error)
    return {
      business_overview: "Analysis in progress",
      key_strengths: [],
      market_opportunities: [],
      competitive_landscape: "Competitive analysis pending",
      recommended_focus_areas: []
    }
  }
} 