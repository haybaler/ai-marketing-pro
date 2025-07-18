-- Enhanced AI Architecture Database Schema
-- Run this in your Supabase SQL editor

-- Create website contexts table for storing analysis data
CREATE TABLE IF NOT EXISTS website_contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  user_id TEXT,
  page_content JSONB,
  search_terms TEXT[],
  search_results JSONB,
  analysis_summary JSONB,
  analyzed_at TIMESTAMP DEFAULT NOW(),
  status TEXT DEFAULT 'analyzing' CHECK (status IN ('analyzing', 'completed', 'failed')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_website_contexts_url ON website_contexts(url);
CREATE INDEX IF NOT EXISTS idx_website_contexts_user_id ON website_contexts(user_id);
CREATE INDEX IF NOT EXISTS idx_website_contexts_status ON website_contexts(status);
CREATE INDEX IF NOT EXISTS idx_website_contexts_created_at ON website_contexts(created_at);

-- Create RLS policies for security
ALTER TABLE website_contexts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own contexts
CREATE POLICY "Users can view own contexts" ON website_contexts
  FOR SELECT USING (user_id = auth.uid()::text);

-- Policy: Users can insert their own contexts
CREATE POLICY "Users can insert own contexts" ON website_contexts
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

-- Policy: Users can update their own contexts
CREATE POLICY "Users can update own contexts" ON website_contexts
  FOR UPDATE USING (user_id = auth.uid()::text);

-- Optional: Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_website_contexts_updated_at
  BEFORE UPDATE ON website_contexts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 