# AI Marketing Pro - Enhanced Architecture Setup Guide

## 🚀 Overview

This guide will help you set up the enhanced AI architecture for AI Marketing Pro, which includes:
- **Context Analysis**: Firecrawl + Serper for website analysis
- **Multi-Model AI**: OpenAI, Anthropic, and OpenRouter integration
- **Two-Stage Workflow**: Analyze → Chat with context

## 📋 Prerequisites

- Node.js 18+ installed
- Vercel account for deployment
- Supabase account for database
- API keys for the required services

## 🔧 Step 1: Install Dependencies

The enhanced dependencies have been installed:
```bash
npm install @anthropic-ai/sdk @mendable/firecrawl-js
```

## 🔑 Step 2: Set Up API Keys

Create a `.env.local` file in your project root with these variables:

```env
# Existing Variables
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# New Enhanced AI Variables
FIRECRAWL_API_KEY=fc-...
SERPER_API_KEY=...
ANTHROPIC_API_KEY=sk-ant-...
OPENROUTER_API_KEY=sk-or-...
```

## 🌐 Step 3: Get API Keys

### 1. Firecrawl API
- Visit [firecrawl.dev](https://firecrawl.dev)
- Sign up for an account
- Get your API key from the dashboard
- **Free tier**: 500 pages/month
- **Cost**: $20/month for 2,000 pages

### 2. Serper API
- Visit [serper.dev](https://serper.dev)
- Sign up for an account
- Get your API key from the dashboard
- **Free tier**: 2,500 queries/month
- **Cost**: $50/month for 100,000 queries

### 3. Anthropic API
- Visit [console.anthropic.com](https://console.anthropic.com)
- Sign up for an account
- Get your API key from the dashboard
- **Cost**: $3/million input tokens, $15/million output tokens

### 4. OpenRouter API
- Visit [openrouter.ai](https://openrouter.ai)
- Sign up for an account
- Get your API key from the dashboard
- **Cost**: Pay-per-use, varies by model

## 🗄️ Step 4: Set Up Database

1. Go to your Supabase project
2. Navigate to the SQL editor
3. Run the SQL commands from `DATABASE_SCHEMA.sql`

This will create:
- `website_contexts` table for storing analysis data
- Proper indexes for performance
- Row Level Security (RLS) policies

## 🚀 Step 5: Deploy to Vercel

1. **Push your code** to GitHub:
```bash
git add .
git commit -m "Add enhanced AI architecture"
git push origin main
```

2. **Add environment variables** in Vercel dashboard:
   - Go to your project settings
   - Add all the environment variables from Step 2

3. **Deploy**:
   - Vercel will automatically deploy from your GitHub push
   - The build should complete successfully

## 🧪 Step 6: Test the Enhanced Features

1. **Visit your deployed app**
2. **Go to the Playground page**
3. **Test the two-stage workflow**:
   - Enter a website URL (e.g., `https://example.com`)
   - Click "Analyze Website"
   - Wait for the progress bar to complete
   - Ask a marketing question
   - Try different AI models

## 📊 New Features

### 🎯 Context Analysis
- **Website crawling** with Firecrawl
- **Competitive research** with Serper
- **AI-powered insights** generation
- **Progress tracking** with real-time updates

### 🤖 Multi-Model AI Chat
- **GPT-4** (OpenAI)
- **Claude 3.5 Sonnet** (Anthropic)
- **Multiple models** via OpenRouter
- **Context-aware responses** based on analysis

### 📈 Enhanced UI
- **Two-stage workflow** with clear steps
- **Progress indicators** for analysis
- **Model selection** dropdown
- **Real-time status** updates

## 💰 Cost Estimation

### Per Analysis (Average)
- **Firecrawl**: ~$0.10
- **Serper**: ~$0.05
- **AI Processing**: ~$0.20
- **Total**: ~$0.35 per website analysis

### Monthly Costs (100 analyses)
- **Firecrawl**: $20
- **Serper**: $50
- **Anthropic**: ~$60
- **OpenRouter**: ~$30
- **Total**: ~$160/month

## 🔍 Troubleshooting

### Common Issues

1. **Build failures**: Check environment variables are set
2. **API errors**: Verify API keys are correct and have sufficient credits
3. **Database errors**: Ensure Supabase schema is properly set up
4. **CORS issues**: Check API routes are in the correct directory

### Debug Steps

1. **Check logs** in Vercel dashboard
2. **Test API routes** individually
3. **Verify database** connection in Supabase
4. **Check network** requests in browser dev tools

## 🎉 Success!

You now have a fully functional enhanced AI architecture with:
- ✅ Context analysis with Firecrawl + Serper
- ✅ Multi-model AI integration
- ✅ Two-stage workflow
- ✅ Progress tracking
- ✅ Database persistence
- ✅ Production-ready deployment

## 📞 Support

If you need help:
1. Check the troubleshooting section
2. Review the API documentation for each service
3. Check the GitHub issues for common problems
4. Ensure all environment variables are properly set

Happy building! 🚀 