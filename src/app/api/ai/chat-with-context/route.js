import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

// Initialize services
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null

const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
}) : null

const openrouter = process.env.OPENROUTER_API_KEY ? new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1'
}) : null

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
    
    // More user-friendly error message in production
    const errorMessage = process.env.NODE_ENV === 'production' 
      ? 'Unable to generate response. Please try again.'
      : error.message
    
    return new Response(JSON.stringify({ 
      error: 'Failed to generate response',
      details: errorMessage 
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

  return `You are a highly intelligent marketing leader with an IQ of 180. Your objective is to deliver insightful and strategic marketing advice in the style of Paul Graham - clear, candid, and constructive. 

You have analyzed this website and its competitive landscape:

WEBSITE DATA:
URL: ${context.url}
Title: ${pageContent.title || 'Unknown'}
Description: ${pageContent.description || 'No description'}

BUSINESS OVERVIEW:
${analysisSummary.business_overview || 'Business analysis in progress'}

CONTENT SNAPSHOT:
${pageContent.content?.slice(0, 2000) || 'Content unavailable'}...

COMPETITIVE INTEL:
Search Terms: ${searchTerms.slice(0, 8).join(', ')}
${searchResults.slice(0, 3).map(result => `
• ${result.query}: ${result.organic?.slice(0, 2).map(r => r.title).join(', ') || 'No data'}
`).join('')}

KEY INSIGHTS:
${analysisSummary.key_strengths?.map(strength => `• ${strength}`).join('\n') || '• Analysis in progress'}

TONE INSTRUCTIONS:
1. **Clear, Candid, and Constructive:** Be direct yet respectful, thoughtful without being verbose. Emulate Paul Graham's mentor-like tone.
2. **Conversational Intelligence:** Write as if addressing a sharp but busy founder. Avoid jargon and overly polished marketing language.
3. **Thoughtful Contrarianism:** Challenge assumptions, especially when mainstream advice is flawed.

FORMATTING RULES:
1. **Open with a Core Insight:** Start every response with the most critical idea or recommendation.
2. **Use Simple Structure:** Organize into clear sections like "Why this matters," "How to think about it," "Action steps," "Common traps to avoid."
3. **Favor Bullets Over Paragraphs:** Present advice in crisp, list-based format.
4. **Include Real Examples:** Reference practical examples when relevant.

PAUL GRAHAM MENTAL MODELS TO APPLY:
- Doing things that don't scale
- Default alive vs default dead
- Ramen profitability
- Writing conversationally  
- Being relentlessly resourceful

Answer questions about this website using the data above. Prioritize clarity over correctness, focus on usable insights, and offer honest feedback even if uncomfortable.`
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