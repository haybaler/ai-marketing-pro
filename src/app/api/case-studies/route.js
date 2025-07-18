import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(req) {
  try {
    const { data, error } = await supabase
      .from('case_studies')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase Error:', error)
      return new Response(JSON.stringify({ error: 'Failed to fetch case studies' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('API Error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export async function POST(req) {
  try {
    const caseStudyData = await req.json()
    
    // Validate required fields
    const requiredFields = ['title', 'industry', 'challenge', 'solution', 'results']
    for (const field of requiredFields) {
      if (!caseStudyData[field]) {
        return new Response(JSON.stringify({ error: `${field} is required` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    }

    // Insert case study
    const { data, error } = await supabase
      .from('case_studies')
      .insert([
        {
          title: caseStudyData.title,
          industry: caseStudyData.industry,
          challenge: caseStudyData.challenge,
          solution: caseStudyData.solution,
          results: caseStudyData.results,
          image_url: caseStudyData.image_url || null,
          client_name: caseStudyData.client_name || null,
          project_duration: caseStudyData.project_duration || null,
          technologies_used: caseStudyData.technologies_used || null,
          created_at: new Date().toISOString(),
        }
      ])
      .select()

    if (error) {
      console.error('Supabase Error:', error)
      return new Response(JSON.stringify({ error: 'Failed to create case study' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ 
      success: true, 
      data: data[0],
      message: 'Case study created successfully' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('API Error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
} 