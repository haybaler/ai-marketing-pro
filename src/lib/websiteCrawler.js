/**
 * Website Crawler Service using Puppeteer
 * Replaces Firecrawl with Puppeteer-based web scraping
 */

/**
 * Validates and normalizes a URL
 * @param {string} url - The URL to validate
 * @returns {string} - Normalized URL
 * @throws {Error} - If URL is invalid
 */
function validateAndNormalizeUrl(url) {
  if (!url || typeof url !== 'string') {
    throw new Error('URL is required and must be a string');
  }

  // Remove whitespace
  url = url.trim();

  // Add protocol if missing
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
 * Extracts domain from URL
 * @param {string} url - The URL to extract domain from
 * @returns {string} - Domain name
 */
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, '');
  } catch (error) {
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  }
}

/**
 * Scrapes website content using Puppeteer
 * @param {string} url - The URL to scrape
 * @returns {Promise<Object>} - Scraped content and metadata
 */
async function scrapeWithPuppeteer(url) {
  try {
    // Try to use Puppeteer MCP server if available
    if (typeof mcp3_puppeteer_navigate === 'function') {
      console.log('Using Puppeteer MCP server for scraping');
      
      await mcp3_puppeteer_navigate({
        url,
        launchOptions: { headless: true }
      });

      // Get page content
      const content = await mcp3_puppeteer_evaluate({
        script: `
          ({
            title: document.title,
            description: document.querySelector('meta[name="description"]')?.content || '',
            content: document.body.innerText,
            html: document.documentElement.outerHTML,
            url: window.location.href
          })
        `
      });

      return {
        success: true,
        data: {
          title: content.title || '',
          description: content.description || '',
          content: content.content || '',
          html: content.html || '',
          url: content.url || url,
          metadata: {
            scrapedAt: new Date().toISOString(),
            method: 'puppeteer_mcp'
          }
        }
      };
    }
  } catch (error) {
    console.warn('Puppeteer MCP server not available, falling back to fetch:', error.message);
  }

  // Fallback to basic fetch
  return await scrapeWithFetch(url);
}

/**
 * Fallback scraping using fetch
 * @param {string} url - The URL to scrape
 * @returns {Promise<Object>} - Scraped content and metadata
 */
async function scrapeWithFetch(url) {
  try {
    console.log('Using fetch fallback for scraping');
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AI-Marketing-Pro/1.0)'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    
    // Basic HTML parsing
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    
    // Extract text content (basic approach)
    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return {
      success: true,
      data: {
        title: titleMatch ? titleMatch[1].trim() : '',
        description: descMatch ? descMatch[1].trim() : '',
        content: textContent.substring(0, 5000), // Limit content length
        html: html,
        url: url,
        metadata: {
          scrapedAt: new Date().toISOString(),
          method: 'fetch_fallback'
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

/**
 * Main website crawling function
 * @param {string} url - The URL to crawl
 * @returns {Promise<Object>} - Crawling results
 */
export async function crawlWebsite(url) {
  try {
    // Validate and normalize URL
    const normalizedUrl = validateAndNormalizeUrl(url);
    const domain = extractDomain(normalizedUrl);

    console.log(`Crawling website: ${normalizedUrl}`);

    // Scrape the website
    const scrapingResult = await scrapeWithPuppeteer(normalizedUrl);

    if (!scrapingResult.success) {
      throw new Error(scrapingResult.error || 'Failed to scrape website');
    }

    return {
      success: true,
      data: {
        ...scrapingResult.data,
        domain,
        normalizedUrl
      }
    };

  } catch (error) {
    console.error('Website crawling failed:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}

export default {
  crawlWebsite,
  validateAndNormalizeUrl,
  extractDomain
};
