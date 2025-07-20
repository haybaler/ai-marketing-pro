# Vercel Environment Variables Checklist

## Required Environment Variables

Ensure all these variables are set in your Vercel project settings:

### 1. Supabase Configuration
- [x] `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key (safe for client-side)
- [x] `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side only)

### 2. AI Services
- [x] `OPENAI_API_KEY` - OpenAI API key
- [x] `ANTHROPIC_API_KEY` - Anthropic Claude API key
- [x] `OPENROUTER_API_KEY` - OpenRouter API key (optional)

### 3. Web Scraping & Search
- [x] `FIRECRAWL_API_KEY` - Firecrawl API key for web scraping
- [x] `SERPER_API_KEY` - Serper API key for search results

## Setting Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add each variable with its value
4. Select the appropriate environments:
   - Production ✓
   - Preview ✓
   - Development ✓

## Important Notes

- **DO NOT** commit `.env.local` to git
- Vercel automatically injects these variables during build/runtime
- Variables without `NEXT_PUBLIC_` prefix are only available server-side
- After adding variables, redeploy your project for changes to take effect

## Verify Deployment

After deployment, test the chat functionality:
1. Go to your deployed app
2. Start a new conversation
3. Ask a marketing-related question
4. Check the Vercel function logs if there are issues

## Troubleshooting in Production

If you encounter issues:
1. Check Vercel Functions logs: Project → Functions tab
2. Look for error messages in the logs
3. Verify all environment variables are set correctly
4. Ensure API keys have sufficient credits/quota