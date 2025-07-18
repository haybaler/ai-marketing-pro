import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

// Initialize services
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1'
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  try {
    const { contextId, question, model = 'openai', modelName } = await req.json()

    if (!contextId || !question) {
      return new Response(JSON.stringify({ error: 'Context ID and question are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Fetch context from database
    const { data: context, error: fetchError } = await supabase
      .from('website_contexts')
      .select('*')
      .eq('id', contextId)
      .single()

    if (fetchError || !context) {
      return new Response(JSON.stringify({ error: 'Context not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (context.status !== 'completed') {
      return new Response(JSON.stringify({ error: 'Context analysis not completed' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Build comprehensive system prompt with context
    const systemPrompt = buildSystemPrompt(context)

    // Generate response based on selected model
    let response
    let usedModel = model

    switch (model) {
      case 'anthropic':
        response = await generateAnthropicResponse(systemPrompt, question)
        usedModel = 'Claude 3.5 Sonnet'
        break
      
      case 'openrouter':
        response = await generateOpenRouterResponse(systemPrompt, question, modelName)
        usedModel = modelName || 'OpenRouter Model'
        break
      
      case 'openai':
      default:
        response = await generateOpenAIResponse(systemPrompt, question)
        usedModel = 'GPT-4'
        break
    }

    return new Response(JSON.stringify({ 
      content: response.content,
      model: usedModel,
      contextUrl: context.url,
      analysisDate: context.analyzed_at
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Chat with context error:', error)
    return new Response(JSON.stringify({ 
      error: 'Failed to generate response',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

function buildSystemPrompt(context) {
  const pageContent = context.page_content?.[0] || {}
  const searchTerms = context.search_terms || []
  const searchResults = context.search_results || []
  const analysisSummary = context.analysis_summary || {}

  return `You are an expert marketing AI assistant with comprehensive knowledge of the following website and its competitive landscape:

WEBSITE ANALYSIS:
URL: ${context.url}
Title: ${pageContent.title || 'Unknown'}
Description: ${pageContent.description || 'No description'}

BUSINESS OVERVIEW:
${analysisSummary.business_overview || 'Business analysis in progress'}

WEBSITE CONTENT (First 2000 characters):
${pageContent.content?.slice(0, 2000) || 'Content unavailable'}...

KEY STRENGTHS:
${analysisSummary.key_strengths?.map(strength => `• ${strength}`).join('\n') || 'Analysis in progress'}

MARKET OPPORTUNITIES:
${analysisSummary.market_opportunities?.map(opp => `• ${opp}`).join('\n') || 'Analysis in progress'}

COMPETITIVE LANDSCAPE:
${analysisSummary.competitive_landscape || 'Competitive analysis pending'}

SEARCH TERMS FOR MARKET RESEARCH:
${searchTerms.slice(0, 8).join(', ')}

COMPETITIVE DATA:
${searchResults.slice(0, 3).map(result => `
Query: ${result.query}
Top Results: ${result.organic?.slice(0, 3).map(r => `${r.title} (${r.link})`).join(', ') || 'No results'}
`).join('\n')}

RECOMMENDED FOCUS AREAS:
${analysisSummary.recommended_focus_areas?.map(area => `• ${area}`).join('\n') || 'Analysis in progress'}

Based on this comprehensive analysis, provide detailed, actionable marketing insights. Use specific data points from the analysis to support your recommendations. Focus on practical strategies that align with the business's strengths and market opportunities.`
}

async function generateOpenAIResponse(systemPrompt, question) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })

    return {
      content: response.choices[0].message.content,
      model: 'GPT-4'
    }
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw new Error('OpenAI API request failed')
  }
}

async function generateAnthropicResponse(systemPrompt, question) {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [
        { role: 'user', content: `${systemPrompt}\n\nQuestion: ${question}` }
      ],
      temperature: 0.7
    })

    return {
      content: response.content[0].text,
      model: 'Claude 3.5 Sonnet'
    }
  } catch (error) {
    console.error('Anthropic API error:', error)
    throw new Error('Anthropic API request failed')
  }
}

async function generateOpenRouterResponse(systemPrompt, question, modelName) {
  try {
    const model = modelName || 'anthropic/claude-3.5-sonnet'
    
    const response = await openrouter.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })

    return {
      content: response.choices[0].message.content,
      model: model
    }
  } catch (error) {
    console.error('OpenRouter API error:', error)
    throw new Error('OpenRouter API request failed')
  }
} 