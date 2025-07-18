import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  try {
    const formData = await req.json()
    
    // Validate required fields
    const requiredFields = ['company_name', 'contact_person', 'email', 'consultation_type']
    for (const field of requiredFields) {
      if (!formData[field]) {
        return new Response(JSON.stringify({ error: `${field} is required` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    }

    // Insert consultation request
    const { data, error } = await supabase
      .from('consultation_requests')
      .insert([
        {
          company_name: formData.company_name,
          contact_person: formData.contact_person,
          email: formData.email,
          phone: formData.phone || null,
          company_size: formData.company_size || null,
          industry: formData.industry || null,
          current_marketing_stack: formData.current_marketing_stack || null,
          ai_experience: formData.ai_experience || null,
          consultation_type: formData.consultation_type,
          budget_range: formData.budget_range || null,
          timeline: formData.timeline || null,
          specific_goals: formData.specific_goals || null,
          status: 'pending',
          created_at: new Date().toISOString(),
        }
      ])
      .select()

    if (error) {
      console.error('Supabase Error:', error)
      return new Response(JSON.stringify({ error: 'Failed to submit request' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ 
      success: true, 
      data: data[0],
      message: 'Consultation request submitted successfully' 
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

export async function GET(req) {
  try {
    const { data, error } = await supabase
      .from('consultation_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase Error:', error)
      return new Response(JSON.stringify({ error: 'Failed to fetch requests' }), {
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