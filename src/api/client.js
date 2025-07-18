// API client to replace Base44 functionality
const API_BASE = '/api'

export const apiClient = {
  // AI Marketing Content Generation
  async generateMarketingContent({ url, prompt }) {
    const response = await fetch(`${API_BASE}/ai/marketing-content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, prompt }),
    })

    if (!response.ok) {
      throw new Error('Failed to generate content')
    }

    return response
  },

  // Consultation Requests
  async submitConsultationRequest(formData) {
    const response = await fetch(`${API_BASE}/consultation-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to submit request')
    }

    return response.json()
  },

  async getConsultationRequests() {
    const response = await fetch(`${API_BASE}/consultation-requests`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch requests')
    }

    return response.json()
  },

  // Case Studies
  async getCaseStudies() {
    const response = await fetch(`${API_BASE}/case-studies`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch case studies')
    }

    return response.json()
  },

  async getCaseStudy(id) {
    const response = await fetch(`${API_BASE}/case-studies/${id}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch case study')
    }

    return response.json()
  },

  async createCaseStudy(caseStudyData) {
    const response = await fetch(`${API_BASE}/case-studies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(caseStudyData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create case study')
    }

    return response.json()
  },
} 