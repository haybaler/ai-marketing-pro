# URL Analysis Troubleshooting Guide

## Common Issues and Solutions

### 1. "Service configuration error" Message

**Problem**: You see an error mentioning missing API keys.

**Solution**:
1. Create a `.env.local` file in your project root
2. Copy the contents from `.env.local.example`
3. Fill in all required API keys:
   - `FIRECRAWL_API_KEY` - Get from [firecrawl.dev](https://firecrawl.dev)
   - `SERPER_API_KEY` - Get from [serper.dev](https://serper.dev)
   - `OPENAI_API_KEY` - Get from [platform.openai.com](https://platform.openai.com)
   - Supabase credentials from your Supabase project

### 2. "Failed to crawl website" Error

**Possible Causes**:
- Firecrawl API key is invalid or expired
- The target website blocks crawlers
- Network connectivity issues
- Rate limiting

**Solutions**:
- Verify your Firecrawl API key is valid
- Try analyzing a different URL to test
- Check your Firecrawl dashboard for usage limits
- Wait a few minutes if rate limited

### 3. Development/Testing Without APIs

**Quick Start Without APIs**:
1. Add to your `.env.local`:
   ```
   NEXT_PUBLIC_DEV_MODE=true
   ```
2. Restart your development server
3. The app will use mock data for testing

### 4. Supabase Connection Issues

**Setup Steps**:
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL from `DATABASE_SCHEMA.sql` in your Supabase SQL editor
3. Copy your project URL and keys to `.env.local`
4. Ensure Row Level Security (RLS) is properly configured

### 5. Running Diagnostics

**Test Your Configuration**:
```bash
# Install dependencies if needed
npm install dotenv

# Run the diagnostic script
node test-url-analysis.js
```

This will check:
- Environment variables
- API connections
- Service availability

### 6. Browser Console Errors

**Check for**:
- CORS errors - Ensure your API routes are properly configured
- 404 errors - Check that all endpoints exist
- Network errors - Verify your server is running

### 7. Slow Analysis

**Optimization Tips**:
- Use cached results when available (automatic for URLs analyzed within 24 hours)
- Consider upgrading API plans for higher rate limits
- Implement request queuing for multiple analyses

## Quick Fixes

### Enable Development Mode
```bash
# In .env.local
NEXT_PUBLIC_DEV_MODE=true
```

### Test with a Simple URL
Try analyzing `https://example.com` first to ensure basic functionality works.

### Check Server Logs
```bash
# View Next.js server logs
npm run dev
# Look for error messages in the terminal
```

### Verify API Endpoints
Test endpoints directly:
```bash
# Test the analysis endpoint
curl -X POST http://localhost:3000/api/ai/analyze-context \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","userId":"test"}'
```

## Need More Help?

1. Check the [SETUP_GUIDE.md](./SETUP_GUIDE.md) for initial setup
2. Review error messages in browser console (F12)
3. Check server logs for detailed error information
4. Ensure all npm packages are installed: `npm install`
5. Try the development mode to isolate API issues