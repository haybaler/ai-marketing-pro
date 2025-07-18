// Development/fallback endpoint for URL analysis
// This endpoint provides mock data when external APIs are not available

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

    // Generate a mock context ID
    const contextId = `dev-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Return mock analysis data
    const mockData = {
      success: true,
      contextId,
      cached: false,
      summary: {
        pagesAnalyzed: 1,
        searchTerms: 5,
        competitorData: 3
      },
      analysis: {
        url,
        title: `Analysis of ${new URL(url).hostname}`,
        description: 'This is a development mode analysis. In production, this would contain real data from Firecrawl and Serper APIs.',
        mainContent: `
          # Development Mode Analysis
          
          This is a mock analysis for development purposes. 
          
          ## Key Features Detected:
          - Modern web design
          - Responsive layout
          - SEO optimized content
          - User-friendly navigation
          
          ## Market Position:
          - Competitive pricing
          - Strong brand presence
          - Active social media
          
          ## Recommendations:
          1. Enhance content marketing strategy
          2. Improve mobile experience
          3. Implement A/B testing
          4. Increase social proof elements
        `,
        competitors: [
          { name: 'Competitor A', url: 'https://example.com', strength: 'Market leader' },
          { name: 'Competitor B', url: 'https://example.com', strength: 'Innovation focus' },
          { name: 'Competitor C', url: 'https://example.com', strength: 'Price competitive' }
        ],
        searchInsights: {
          trends: ['AI marketing', 'automation', 'personalization'],
          keywords: ['marketing AI', 'content generation', 'SEO tools'],
          volume: 'High search volume detected'
        }
      }
    }

    return new Response(JSON.stringify(mockData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Dev analyze-context error:', error)
    return new Response(JSON.stringify({ 
      error: 'Analysis failed',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}