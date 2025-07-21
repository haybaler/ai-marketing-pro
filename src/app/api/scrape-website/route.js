import { NextResponse } from 'next/server';

/**
 * Website Scraping API using Puppeteer
 * POST /api/scrape-website
 */

/**
 * Validates and normalizes a URL
 */
function validateAndNormalizeUrl(url) {
  if (!url || typeof url !== 'string') {
    throw new Error('URL is required and must be a string');
  }

  url = url.trim();
  if (!url.match(/^https?:\/\//)) {
    url = 'https://' + url;
  }

  try {
    const urlObj = new URL(url);
    return urlObj.href;
  } catch (error) {
    throw new Error('Invalid URL format');
  }
}

/**
 * Scrapes website using Puppeteer MCP server with fallback
 */
async function scrapeWebsite(url) {
  try {
    // Try Puppeteer MCP server first
    const puppeteerResult = await scrapeWithPuppeteerMCP(url);
    if (puppeteerResult.success) {
      return puppeteerResult;
    }
  } catch (error) {
    console.warn('Puppeteer MCP failed, using fallback:', error.message);
  }

  // Fallback to fetch
  return await scrapeWithFetch(url);
}

/**
 * Scrape using Puppeteer MCP server
 */
async function scrapeWithPuppeteerMCP(url) {
  try {
    // This would use the MCP server if available
    // For now, we'll simulate the structure
    console.log('Attempting Puppeteer MCP scraping for:', url);
    
    // In a real implementation, this would call the MCP server
    // For now, we'll throw an error to trigger fallback
    throw new Error('MCP server not available in this context');
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Fallback scraping using fetch
 */
async function scrapeWithFetch(url) {
  try {
    console.log('Using fetch fallback for:', url);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AI-Marketing-Pro/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Cache-Control': 'no-cache'
      },
      timeout: 10000
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    
    // Parse HTML content
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    const keywordsMatch = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']+)["']/i);
    
    // Extract text content
    let textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Limit content length
    if (textContent.length > 8000) {
      textContent = textContent.substring(0, 8000) + '...';
    }

    // Extract domain
    const domain = new URL(url).hostname.replace(/^www\./, '');

    return {
      success: true,
      data: {
        url,
        domain,
        title: titleMatch ? titleMatch[1].trim() : '',
        description: descMatch ? descMatch[1].trim() : '',
        keywords: keywordsMatch ? keywordsMatch[1].trim() : '',
        content: textContent,
        html: html.length > 50000 ? html.substring(0, 50000) + '...' : html,
        metadata: {
          scrapedAt: new Date().toISOString(),
          method: 'fetch_fallback',
          contentLength: textContent.length,
          htmlLength: html.length
        }
      }
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}

export async function POST(request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate and normalize URL
    let normalizedUrl;
    try {
      normalizedUrl = validateAndNormalizeUrl(url);
    } catch (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Scrape the website
    const result = await scrapeWebsite(normalizedUrl);

    if (!result.success) {
      return NextResponse.json(
        { 
          error: result.error || 'Failed to scrape website',
          url: normalizedUrl 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('Scrape website API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  );
}
