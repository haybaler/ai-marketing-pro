import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Initialize services
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Scrapes website using our internal API
 */
async function scrapeWebsite(url) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/scrape-website`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      throw new Error(`Scraping failed: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Website scraping failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * SERP API integration for competitor insights
 */
async function searchWithSerper(query, num = 5) {
  if (!process.env.SERPER_API_KEY) {
    console.warn('SERPER_API_KEY not configured, skipping SERP analysis');
    return null;
  }

  try {
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': process.env.SERPER_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: query,
        num: num,
        gl: 'us',
        hl: 'en'
      })
    });
    
    if (!response.ok) {
      throw new Error(`Serper API error: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Serper search failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate search terms for competitor analysis
 */
async function generateSearchTerms(websiteContent, domain) {
  try {
    const prompt = `Based on this website content from ${domain}, generate 3-5 relevant search terms that would help find competitors and market insights. Focus on the main business/industry keywords.

Website content: ${websiteContent.substring(0, 2000)}...

Return only a JSON array of search terms, like: ["term1", "term2", "term3"]`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
      temperature: 0.3
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) return [];

    try {
      return JSON.parse(content);
    } catch {
      // Fallback: extract terms from content
      return [
        `${domain} competitors`,
        `${domain} industry`,
        `${domain} alternatives`
      ];
    }
  } catch (error) {
    console.error('Failed to generate search terms:', error);
    return [`${domain} competitors`];
  }
}

/**
 * Generate comprehensive analysis
 */
async function generateAnalysis(websiteData, serpResults) {
  try {
    const { title, description, content, domain } = websiteData;
    
    let competitorInfo = '';
    if (serpResults && serpResults.length > 0) {
      competitorInfo = serpResults.map(result => 
        `Search: "${result.query}"\nTop Results: ${result.data?.organic?.slice(0, 3).map(r => `${r.title} (${r.link})`).join(', ') || 'No results'}`
      ).join('\n\n');
    }

    const prompt = `As a marketing expert, analyze this website and provide comprehensive marketing insights:

WEBSITE ANALYSIS:
Domain: ${domain}
Title: ${title}
Description: ${description}
Content: ${content.substring(0, 3000)}...

COMPETITOR RESEARCH:
${competitorInfo || 'No competitor data available'}

Please provide a detailed analysis including:
1. Business Overview & Value Proposition
2. Target Audience Analysis
3. Competitive Landscape
4. Marketing Strengths & Opportunities
5. Recommended Marketing Strategies
6. SEO & Content Recommendations

Format your response as structured insights that would be valuable for marketing strategy discussions.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2000,
      temperature: 0.7
    });

    return response.choices[0]?.message?.content || 'Analysis could not be generated.';
  } catch (error) {
    console.error('Failed to generate analysis:', error);
    return 'Failed to generate comprehensive analysis. Please try again.';
  }
}

export async function POST(request) {
  try {
    const { url, userId } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Check for required services
    if (!openai || !supabase) {
      console.error('Missing required services - check environment variables');
      return NextResponse.json(
        { 
          error: 'Service configuration error',
          details: 'Required services not configured'
        },
        { status: 503 }
      );
    }

    // Check if context already exists and is recent (within 24 hours)
    const { data: existingContext } = await supabase
      .from('website_contexts')
      .select('*')
      .eq('url', url)
      .eq('status', 'completed')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .single();

    if (existingContext) {
      return NextResponse.json({
        success: true,
        contextId: existingContext.id,
        cached: true,
        summary: {
          pagesAnalyzed: 1,
          searchTerms: existingContext.search_terms?.length || 0,
          competitorData: existingContext.search_results?.length || 0
        }
      });
    }

    // Create initial context record
    const { data: contextRecord, error: contextError } = await supabase
      .from('website_contexts')
      .insert([{
        url: url,
        user_id: userId,
        status: 'processing',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (contextError) {
      console.error('Failed to create context record:', contextError);
      return NextResponse.json(
        { error: 'Failed to initialize analysis' },
        { status: 500 }
      );
    }

    // Start async processing
    processWebsiteAnalysis(contextRecord.id, url);

    return NextResponse.json({
      success: true,
      contextId: contextRecord.id,
      status: 'processing',
      message: 'Analysis started. This may take a few moments.'
    });

  } catch (error) {
    console.error('Analyze context API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Async processing function
 */
async function processWebsiteAnalysis(contextId, url) {
  try {
    console.log(`Starting analysis for context ${contextId}: ${url}`);

    // Step 1: Scrape website
    const scrapingResult = await scrapeWebsite(url);
    if (!scrapingResult.success) {
      throw new Error(`Website scraping failed: ${scrapingResult.error}`);
    }

    const websiteData = scrapingResult.data;
    console.log(`Scraped website: ${websiteData.title}`);

    // Step 2: Generate search terms
    const searchTerms = await generateSearchTerms(websiteData.content, websiteData.domain);
    console.log(`Generated search terms:`, searchTerms);

    // Step 3: Perform SERP searches
    const serpResults = [];
    for (const term of searchTerms.slice(0, 3)) { // Limit to 3 searches
      const result = await searchWithSerper(term);
      if (result?.success) {
        serpResults.push({
          query: term,
          data: result.data
        });
      }
      // Small delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`Completed ${serpResults.length} SERP searches`);

    // Step 4: Generate comprehensive analysis
    const analysis = await generateAnalysis(websiteData, serpResults);
    console.log(`Generated analysis (${analysis.length} characters)`);

    // Step 5: Update context record with results
    const { error: updateError } = await supabase
      .from('website_contexts')
      .update({
        title: websiteData.title,
        description: websiteData.description,
        content: websiteData.content,
        domain: websiteData.domain,
        search_terms: searchTerms,
        search_results: serpResults,
        analysis: analysis,
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', contextId);

    if (updateError) {
      console.error('Failed to update context:', updateError);
      throw updateError;
    }

    console.log(`Analysis completed for context ${contextId}`);

  } catch (error) {
    console.error(`Analysis failed for context ${contextId}:`, error);
    
    // Update context with error status
    await supabase
      .from('website_contexts')
      .update({
        status: 'failed',
        error_message: error.message,
        updated_at: new Date().toISOString()
      })
      .eq('id', contextId);
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  );
}
