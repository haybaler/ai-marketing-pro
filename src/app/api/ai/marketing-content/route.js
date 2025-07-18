import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req) {
  try {
    const { url, prompt } = await req.json()

    if (!url || !prompt) {
      return new Response(JSON.stringify({ error: 'URL and prompt are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const systemPrompt = `You are an expert marketing AI assistant. Analyze the provided URL and create marketing content based on the user's prompt. Focus on creating compelling, conversion-focused content that aligns with modern marketing best practices.`

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: `URL: ${url}\n\nUser Request: ${prompt}\n\nPlease provide detailed marketing content and recommendations.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    return new Response(JSON.stringify({ 
      content: response.choices[0].message.content 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('AI API Error:', error)
    return new Response(JSON.stringify({ error: 'Failed to generate content' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
} 