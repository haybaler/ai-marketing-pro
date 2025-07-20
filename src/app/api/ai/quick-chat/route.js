import OpenAI from 'openai'

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null

async function searchWithSerper(query) {
  try {
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': process.env.SERPER_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ q: query, num: 5 })
    })

    if (!response.ok) throw new Error('Serper API error')
    return await response.json()
  } catch (error) {
    console.error('Serper search error:', error)
    return null
  }
}

export async function POST(req) {
  if (!openai || !process.env.SERPER_API_KEY) {
    return new Response(JSON.stringify({ error: 'Service configuration error' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const { question } = await req.json()
    if (!question) {
      return new Response(JSON.stringify({ error: 'Question is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Get Serper results
    const searchResults = await searchWithSerper(question)
    const topSnippets = searchResults?.organic?.slice(0, 3) || []
    const snippetsText = topSnippets.map((r, idx) => `${idx + 1}. ${r.snippet}`).join('\n')

    const prompt = `You are a senior marketing strategist. Use the following Google search snippets to inform your answer.\n\nSearch snippets:\n${snippetsText}\n\nQuestion: ${question}\n\nProvide a concise (4-6 sentence) marketing-focused answer.`

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful marketing assistant.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 300
    })

    const content = response.choices[0].message.content.trim()
    return new Response(JSON.stringify({ content }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Quick chat error:', error)
    return new Response(JSON.stringify({ error: 'Failed to generate answer' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
} 