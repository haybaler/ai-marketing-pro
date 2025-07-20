# Production Deployment Guide for Vercel

## Pre-Deployment Checklist

### 1. ✅ Environment Variables
All required environment variables should be set in Vercel:
- Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- AI Services: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `OPENROUTER_API_KEY`
- Web Services: `FIRECRAWL_API_KEY`, `SERPER_API_KEY`

### 2. ✅ Database Setup
Ensure your Supabase database has:
- Run the SQL from `DATABASE_SCHEMA.sql`
- Proper Row Level Security (RLS) policies
- Indexes for performance

### 3. ✅ API Key Validation
Verify all API keys have:
- Sufficient credits/quota
- Proper permissions
- No rate limiting issues

## Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Production-ready updates"
git push origin main
```

### 2. Deploy on Vercel
- Vercel will automatically deploy from your GitHub repository
- Monitor the build logs for any errors
- Check the Functions tab after deployment

### 3. Post-Deployment Testing

#### Test AI Chat
1. Start a new conversation
2. Ask a marketing-related question
3. Try different AI models (OpenAI, Anthropic, etc.)
4. Verify responses are generated correctly
5. Test conversation history and context

## Monitoring & Debugging

### Vercel Dashboard
- **Functions Tab**: Monitor API route performance and errors
- **Analytics**: Track usage and performance metrics
- **Logs**: Real-time function logs for debugging

### Common Issues & Solutions

#### "Service configuration error"
- Check all environment variables are set in Vercel
- Verify API keys are valid and active
- Check Vercel function logs for specific errors

#### Slow Response Times
- Firecrawl analysis can take 30-60 seconds for complex sites
- Consider implementing progress indicators
- Check API rate limits

#### Failed URL Analysis
- Some sites block web scrapers
- Try different URLs to isolate the issue
- Check Firecrawl dashboard for usage/errors

## Performance Optimization

### 1. Caching
- URL analyses are cached for 24 hours
- Reduces API calls and improves response time

### 2. Function Timeouts
- `analyze-context`: 60 seconds (for complex sites)
- `chat-with-context`: 30 seconds
- `marketing-content`: 30 seconds

### 3. Error Handling
- Production error messages are user-friendly
- Detailed errors logged server-side only
- Graceful fallbacks for service failures

## Security Best Practices

1. **Never expose service role keys** client-side
2. **Use environment variables** for all sensitive data
3. **Enable RLS** on all Supabase tables
4. **Monitor API usage** to prevent abuse
5. **Implement rate limiting** if needed

## Scaling Considerations

As your usage grows:
1. Monitor API quotas and upgrade plans as needed
2. Implement request queuing for high traffic
3. Consider caching strategies for common queries
4. Use Vercel Analytics to identify bottlenecks

## Support & Maintenance

- Check API provider dashboards regularly
- Monitor error rates in Vercel Functions
- Keep dependencies updated
- Review and rotate API keys periodically

## Quick Commands

```bash
# Check deployment status
vercel

# View production logs
vercel logs --prod

# Redeploy
vercel --prod
```

Remember: Always test in preview deployments before promoting to production!