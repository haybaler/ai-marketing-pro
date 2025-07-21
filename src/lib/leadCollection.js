/**
 * Lead Collection Service
 * Manages lead data collection and storage in Supabase
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase configuration. Please check your environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates and normalizes website URL
 * @param {string} website - Website URL to validate
 * @returns {Object} - Validation result with normalized URL and domain
 */
export function validateWebsite(website) {
  if (!website || typeof website !== 'string') {
    return {
      isValid: false,
      error: 'Website is required'
    };
  }

  let url = website.trim();
  
  // Add protocol if missing
  if (!url.match(/^https?:\/\//)) {
    url = 'https://' + url;
  }

  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace(/^www\./, '');
    
    return {
      isValid: true,
      normalizedUrl: urlObj.href,
      domain: domain
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid website URL format'
    };
  }
}

/**
 * Extracts metadata from request
 * @param {Request} request - HTTP request object
 * @returns {Object} - Extracted metadata
 */
export function extractMetadata(request) {
  const headers = request.headers;
  
  return {
    userAgent: headers.get('user-agent') || '',
    ip: headers.get('x-forwarded-for') || headers.get('x-real-ip') || '',
    referer: headers.get('referer') || '',
    acceptLanguage: headers.get('accept-language') || '',
    timestamp: new Date().toISOString()
  };
}

/**
 * Creates a new lead in the database
 * @param {Object} leadData - Lead information
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<Object>} - Created lead data
 */
export async function createLead(leadData, metadata = {}) {
  try {
    const { website, email, conversationId } = leadData;

    // Validate email
    if (!validateEmail(email)) {
      throw new Error('Invalid email format');
    }

    // Validate website
    const websiteValidation = validateWebsite(website);
    if (!websiteValidation.isValid) {
      throw new Error(websiteValidation.error);
    }

    // Prepare lead data
    const leadRecord = {
      website_domain: websiteValidation.domain,
      website_url: websiteValidation.normalizedUrl,
      email: email.toLowerCase().trim(),
      conversation_id: conversationId || null,
      source: 'chat_widget',
      status: 'new',
      metadata: {
        ...metadata,
        createdAt: new Date().toISOString()
      }
    };

    // Insert into database
    const { data, error } = await supabase
      .from('leads')
      .insert([leadRecord])
      .select()
      .single();

    if (error) {
      console.error('Supabase error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        constraint: error.constraint
      });
      
      // Handle unique constraint violation
      if (error.code === '23505' && error.constraint === 'leads_email_unique') {
        // Update existing lead
        const { data: updatedData, error: updateError } = await supabase
          .from('leads')
          .update({
            website_domain: websiteValidation.domain,
            website_url: websiteValidation.normalizedUrl,
            conversation_id: conversationId || null,
            updated_at: new Date().toISOString(),
            metadata: {
              ...metadata,
              updatedAt: new Date().toISOString()
            }
          })
          .eq('email', email.toLowerCase().trim())
          .select()
          .single();

        if (updateError) {
          console.error('Update error details:', updateError);
          throw new Error(`Failed to update existing lead: ${updateError.message || updateError.details || 'Unknown error'}`);
        }

        return {
          success: true,
          data: updatedData,
          isUpdate: true
        };
      }
      
      throw new Error(`Failed to create lead: ${error.message || error.details || error.hint || 'Unknown Supabase error'}`);
    }

    return {
      success: true,
      data: data,
      isUpdate: false
    };

  } catch (error) {
    console.error('Create lead error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Retrieves leads from the database
 * @param {Object} filters - Query filters
 * @returns {Promise<Object>} - Query results
 */
export async function getLeads(filters = {}) {
  try {
    let query = supabase.from('leads').select('*');

    // Apply filters
    if (filters.email) {
      query = query.eq('email', filters.email.toLowerCase().trim());
    }
    
    if (filters.domain) {
      query = query.eq('website_domain', filters.domain);
    }
    
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters.conversationId) {
      query = query.eq('conversation_id', filters.conversationId);
    }

    // Apply ordering
    query = query.order('collected_at', { ascending: false });

    // Apply limit
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch leads: ${error.message}`);
    }

    return {
      success: true,
      data: data || []
    };

  } catch (error) {
    console.error('Get leads error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Updates lead status
 * @param {string} leadId - Lead ID
 * @param {string} status - New status
 * @returns {Promise<Object>} - Update result
 */
export async function updateLeadStatus(leadId, status) {
  try {
    const validStatuses = ['new', 'contacted', 'qualified', 'converted', 'closed'];
    
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status');
    }

    const { data, error } = await supabase
      .from('leads')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', leadId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update lead status: ${error.message}`);
    }

    return {
      success: true,
      data: data
    };

  } catch (error) {
    console.error('Update lead status error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Gets lead statistics
 * @returns {Promise<Object>} - Statistics data
 */
export async function getLeadStats() {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('status, collected_at')
      .order('collected_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch lead stats: ${error.message}`);
    }

    const stats = {
      total: data.length,
      new: data.filter(lead => lead.status === 'new').length,
      contacted: data.filter(lead => lead.status === 'contacted').length,
      qualified: data.filter(lead => lead.status === 'qualified').length,
      converted: data.filter(lead => lead.status === 'converted').length,
      closed: data.filter(lead => lead.status === 'closed').length,
      recentLeads: data.slice(0, 10)
    };

    return {
      success: true,
      data: stats
    };

  } catch (error) {
    console.error('Get lead stats error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export default {
  createLead,
  getLeads,
  updateLeadStatus,
  getLeadStats,
  validateEmail,
  validateWebsite,
  extractMetadata
};
