# AI Marketing Pro

A comprehensive AI-powered marketing platform that provides personalized marketing insights, competitor analysis, and strategic recommendations with integrated lead collection.

## 🚀 Features

### 🤖 AI Marketing Chat with Lead Collection
- **Multi-stage Lead Capture**: Collects website and email before analysis
- **Context-aware Responses**: Based on real-time website analysis
- **Visual Progress Indicators**: Shows lead collection stages
- **Personalized Recommendations**: Tailored to user's specific website

### 🔍 Advanced Website Analysis
- **Puppeteer-based Crawling**: Enhanced content extraction with MCP server
- **Fallback Scraping**: Fetch-based backup for reliability
- **SERP Integration**: Competitor insights via Serper API
- **SEO Analysis**: Content and optimization recommendations

### 📊 Lead Management System
- **Automatic Lead Storage**: Saves to Supabase database
- **Email Validation**: Ensures data quality
- **Conversation Tracking**: Links leads to chat sessions
- **Status Management**: Track lead progression

### 🏢 Case Studies & Portfolio
- **Success Stories**: Showcase marketing campaigns
- **Client Testimonials**: Build credibility
- **Industry Examples**: Sector-specific case studies

### 📞 Consultation System
- **Direct Booking**: Integrated consultation requests
- **Lead Qualification**: Automated scoring
- **Contact Management**: Centralized communication

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **AI Services**: OpenAI GPT-4, Anthropic Claude (optional)
- **Website Crawling**: Puppeteer MCP Server + Fetch fallback
- **Search Insights**: Serper API for competitor research
- **Authentication**: Supabase Auth
- **Deployment**: Vercel (recommended)

## 📋 Environment Variables

Create a `.env.local` file in the root directory:

```env
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# SERP API Configuration (for competitor insights)
SERPER_API_KEY=your_serper_api_key_here

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Anthropic API (if using Claude)
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd ai-marketing-pro
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your API keys
```

**Required API Keys:**
- **OpenAI**: [Get API Key](https://platform.openai.com/api-keys)
- **Supabase**: [Create Project](https://supabase.com)
- **Serper**: [Get API Key](https://serper.dev)

### 3. Database Migration

```bash
# Using Supabase CLI (recommended)
npx supabase db push

# Or run SQL manually in Supabase dashboard
# File: supabase/migrations/20250121_create_leads_table.sql
```

### 4. Run Application

```bash
# Development
npm run dev

# Production
npm run build && npm start
```

Access at: `http://localhost:3000`

## 🎯 Lead Collection Workflow

### Stage 1: Welcome
- User enters chat interface
- System introduces AI assistant
- Requests website URL

### Stage 2: Website Collection
- Validates URL format
- Normalizes URL (adds https:// if needed)
- Stores website data

### Stage 3: Email Collection
- Validates email format
- Creates conversation ID
- Saves lead to database

### Stage 4: Analysis & Chat
- Triggers website analysis
- Performs SERP research
- Enables personalized chat

## 🔍 Website Analysis Process

1. **URL Validation**: Ensures proper format and accessibility
2. **Content Scraping**: 
   - Primary: Puppeteer MCP server
   - Fallback: Fetch-based scraping
3. **Content Processing**: Extracts title, description, text content
4. **Search Research**: Generates competitor search terms
5. **SERP Analysis**: Fetches competitor insights via Serper API
6. **AI Analysis**: Creates comprehensive marketing insights
7. **Context Storage**: Saves for future chat sessions (24hr cache)

## 📡 API Endpoints

### Lead Management
```
POST /api/leads          # Create/update leads
GET  /api/leads          # Retrieve leads with filters
PUT  /api/leads          # Update lead status
```

### Website Analysis
```
POST /api/scrape-website    # Scrape website content
POST /api/ai/analyze-context # Analyze website context
```

### Chat System
```
POST /api/ai/chat           # Chat with context
POST /api/ai/generate       # Generate marketing content
```

## 🗄 Database Schema

### Leads Table
```sql
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_domain TEXT NOT NULL,
  website_url TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  conversation_id TEXT,
  source TEXT DEFAULT 'chat_widget',
  status TEXT DEFAULT 'new',
  metadata JSONB DEFAULT '{}',
  collected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Website Contexts Table
```sql
CREATE TABLE website_contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  content TEXT,
  domain TEXT,
  search_terms TEXT[],
  search_results JSONB,
  analysis TEXT,
  status TEXT DEFAULT 'processing',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔒 Security Features

- **Row Level Security (RLS)**: Supabase policies protect data
- **Input Validation**: URL and email sanitization
- **Rate Limiting**: API protection against abuse
- **Environment Security**: Secure API key management
- **CORS Protection**: Proper cross-origin handling
- **Unique Constraints**: Prevent duplicate leads

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**: Link GitHub/GitLab to Vercel
2. **Environment Variables**: Configure in Vercel dashboard
3. **Deploy**: Automatic CI/CD pipeline

### Production Environment Variables

Ensure these are set in your deployment platform:

```env
OPENAI_API_KEY=your_production_openai_key
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_production_service_key
SERPER_API_KEY=your_production_serper_key
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## 🐛 Troubleshooting

### Common Issues

**Website Scraping Fails**
- Check Puppeteer MCP server availability
- Verify target website accessibility
- Review CORS policies

**Database Connection Issues**
- Verify Supabase URL and service role key
- Check RLS policies
- Ensure migrations are applied

**API Rate Limits**
- Monitor OpenAI usage
- Check Serper API limits
- Implement request queuing if needed

**Lead Collection Not Working**
- Verify email validation logic
- Check Supabase table permissions
- Review unique constraint conflicts

### Debug Mode

```env
NODE_ENV=development
DEBUG=true
```

## 📊 Monitoring

- **Lead Conversion**: Track collection success rates
- **API Usage**: Monitor OpenAI and Serper consumption
- **Error Rates**: Watch for scraping failures
- **Response Times**: Measure analysis performance

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Documentation**: Check this README
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions).