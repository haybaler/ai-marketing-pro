import { NextResponse } from 'next/server';
import { 
  createLead, 
  getLeads, 
  updateLeadStatus, 
  getLeadStats,
  extractMetadata 
} from '@/lib/leadCollection';

/**
 * Leads API Endpoint
 * Handles lead creation, retrieval, and management
 */

/**
 * POST /api/leads - Create or update a lead
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { action, website, email, conversationId, leadId, status } = body;

    // Extract metadata from request
    const metadata = extractMetadata(request);

    switch (action) {
      case 'create':
        return await handleCreateLead({ website, email, conversationId }, metadata);
      
      case 'update_status':
        return await handleUpdateStatus(leadId, status);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use "create" or "update_status"' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Leads API error:', error);
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}

/**
 * GET /api/leads - Retrieve leads
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filters = {
      email: searchParams.get('email'),
      domain: searchParams.get('domain'),
      status: searchParams.get('status'),
      conversationId: searchParams.get('conversationId'),
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')) : undefined
    };

    // Remove null/undefined filters
    Object.keys(filters).forEach(key => {
      if (filters[key] === null || filters[key] === undefined) {
        delete filters[key];
      }
    });

    // Handle special stats request
    if (searchParams.get('stats') === 'true') {
      const result = await getLeadStats();
      
      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        stats: result.data
      });
    }

    // Regular leads query
    const result = await getLeads(filters);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      leads: result.data,
      count: result.data.length
    });

  } catch (error) {
    console.error('Get leads API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Handle lead creation
 */
async function handleCreateLead(leadData, metadata) {
  const { website, email, conversationId } = leadData;

  // Validate required fields
  if (!website || !email) {
    return NextResponse.json(
      { error: 'Website and email are required' },
      { status: 400 }
    );
  }

  // Create the lead
  const result = await createLead(
    { website, email, conversationId },
    metadata
  );

  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    lead: result.data,
    isUpdate: result.isUpdate,
    message: result.isUpdate 
      ? 'Lead updated successfully' 
      : 'Lead created successfully'
  });
}

/**
 * Handle lead status update
 */
async function handleUpdateStatus(leadId, status) {
  if (!leadId || !status) {
    return NextResponse.json(
      { error: 'Lead ID and status are required' },
      { status: 400 }
    );
  }

  const result = await updateLeadStatus(leadId, status);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    lead: result.data,
    message: 'Lead status updated successfully'
  });
}

/**
 * PUT /api/leads - Update lead (alias for POST with update action)
 */
export async function PUT(request) {
  try {
    const body = await request.json();
    body.action = 'update_status';
    
    // Create new request with modified body
    const modifiedRequest = new Request(request.url, {
      method: 'POST',
      headers: request.headers,
      body: JSON.stringify(body)
    });

    return await POST(modifiedRequest);

  } catch (error) {
    console.error('PUT leads API error:', error);
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}

/**
 * DELETE /api/leads - Not implemented for security
 */
export async function DELETE() {
  return NextResponse.json(
    { error: 'Delete operation not allowed for security reasons' },
    { status: 405 }
  );
}
