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
        num: 5
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
          pagesAnalyzed: 1,
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
        onlyMainContent: true
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
      url: crawlResult.data.metadata?.url || url,
      title: crawlResult.data.metadata?.title || '',
      description: crawlResult.data.metadata?.description || '',
      content: crawlResult.data.markdown || '',
      keywords: crawlResult.data.metadata?.keywords || []
    }

    // Step 3: Generate simple search terms (no AI parsing)
    const searchTerms = generateSimpleSearchTerms(pageContent)

    // Step 4: Use Serper to get competitive data (only if we have search terms)
    const searchResults = []
    if (searchTerms.length > 0) {
      // Only search for top 3 terms to avoid API limits
      const topSearchTerms = searchTerms.slice(0, 3)
      for (const term of topSearchTerms) {
        const result = await searchWithSerper(term)
        if (result) {
          searchResults.push({
            query: term,
            ...result
          })
        }
      }
    }

    // Step 5: Generate simple analysis summary (no JSON parsing)
    const analysisSummary = await generateSimpleAnalysisSummary(pageContent, searchResults)

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

function generateSimpleSearchTerms(pageContent) {
  const searchTerms = []
  
  // Add title words
  if (pageContent.title) {
    const titleWords = pageContent.title.toLowerCase().split(/\s+/)
    titleWords.forEach(word => {
      if (word.length > 3 && !searchTerms.includes(word)) {
        searchTerms.push(word)
      }
    })
  }
  
  // Add description words
  if (pageContent.description) {
    const descWords = pageContent.description.toLowerCase().split(/\s+/)
    descWords.forEach(word => {
      if (word.length > 3 && !searchTerms.includes(word)) {
        searchTerms.push(word)
      }
    })
  }
  
  // Add keywords if available
  if (pageContent.keywords && pageContent.keywords.length > 0) {
    pageContent.keywords.forEach(keyword => {
      if (!searchTerms.includes(keyword.toLowerCase())) {
        searchTerms.push(keyword.toLowerCase())
      }
    })
  }
  
  // Extract from content if we don't have enough terms
  if (searchTerms.length < 5 && pageContent.content) {
    const words = pageContent.content.toLowerCase().match(/\b\w+\b/g) || []
    const wordCount = {}
    words.forEach(word => {
      if (word.length > 4) {
        wordCount[word] = (wordCount[word] || 0) + 1
      }
    })
    
    const topWords = Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word)
    
    topWords.forEach(word => {
      if (!searchTerms.includes(word) && searchTerms.length < 8) {
        searchTerms.push(word)
      }
    })
  }
  
  return searchTerms.slice(0, 6) // Limit to 6 terms
}

async function generateSimpleAnalysisSummary(pageContent, searchResults) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a marketing analyst. Analyze the website content and provide a brief business overview. Keep it simple and actionable.`
        },
        {
          role: 'user',
          content: `Website: ${pageContent.title}\nDescription: ${pageContent.description}\nContent: ${pageContent.content.slice(0, 1000)}\n\nProvide a brief business overview in 2-3 sentences.`
        }
      ],
      temperature: 0.7,
      max_tokens: 200
    })

    const businessOverview = response.choices[0].message.content.trim()
    
    return {
      business_overview: businessOverview,
      key_strengths: ["Website analysis completed"],
      market_opportunities: ["Competitive research available"],
      competitive_landscape: `Found ${searchResults.length} search results for competitive analysis`,
      recommended_focus_areas: ["Content optimization", "SEO improvement"]
    }
  } catch (error) {
    console.error('Analysis summary generation failed:', error)
    return {
      business_overview: `Website analysis for ${pageContent.title || 'the provided URL'}`,
      key_strengths: ["Website crawled successfully"],
      market_opportunities: ["Market research completed"],
      competitive_landscape: `Analyzed ${searchResults.length} competitive data points`,
      recommended_focus_areas: ["Marketing strategy", "Content improvement"]
    }
  }
} 