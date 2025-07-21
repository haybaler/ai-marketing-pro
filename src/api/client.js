// API client to replace Base44 functionality
const API_BASE = '/api'

export const apiClient = {
  // Enhanced AI Context Analysis
  async analyzeContext({ url, userId }) {
    const endpoint = `${API_BASE}/ai/analyze-context`
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, userId }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to analyze context')
    }

    return response.json()
  },

  // Enhanced AI Chat with Context
  async chatWithContext({ contextId, question, model = 'openai', modelName }) {
    const response = await fetch(`${API_BASE}/ai/chat-with-context`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contextId, question, model, modelName }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to generate response')
    }

    return response.json()
  },

  // Original AI Marketing Content Generation (Legacy)
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

  async updateCaseStudy(id, caseStudyData) {
    const response = await fetch(`${API_BASE}/case-studies/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(caseStudyData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update case study')
    }

    return response.json()
  },

  async deleteCaseStudy(id) {
    const response = await fetch(`${API_BASE}/case-studies/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete case study')
    }

    return response.json()
  },

  // Lead Collection API
  async createLead(website, email, conversationId = null) {
    const response = await fetch(`${API_BASE}/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'create',
        website,
        email,
        conversationId
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create lead');
    }

    return response.json();
  },

  async getLeads(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        params.append(key, value);
      }
    });

    const response = await fetch(`${API_BASE}/leads?${params}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch leads');
    }

    return response.json();
  },

  async updateLeadStatus(leadId, status) {
    const response = await fetch(`${API_BASE}/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'update_status',
        leadId,
        status
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update lead status');
    }

    return response.json();
  },

  // Website Scraping API
  async scrapeWebsite(url) {
    const response = await fetch(`${API_BASE}/scrape-website`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to scrape website');
    }

    return response.json();
  }
} 