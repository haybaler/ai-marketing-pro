-- Create leads table for storing marketing chat lead information
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  website_domain TEXT NOT NULL,
  website_url TEXT NOT NULL,
  email TEXT NOT NULL,
  conversation_id TEXT,
  source TEXT DEFAULT 'chat_widget',
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'closed')),
  metadata JSONB DEFAULT '{}',
  collected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_domain ON leads(website_domain);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_collected_at ON leads(collected_at);
CREATE INDEX IF NOT EXISTS idx_leads_conversation_id ON leads(conversation_id);

-- Add unique constraint on email to prevent duplicates
ALTER TABLE leads ADD CONSTRAINT leads_email_unique UNIQUE (email);

-- Enable Row Level Security (RLS)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Policy for service role (full access)
CREATE POLICY "Service role can manage all leads" ON leads
  FOR ALL USING (auth.role() = 'service_role');

-- Policy for authenticated users (read their own leads)
CREATE POLICY "Users can view their own leads" ON leads
  FOR SELECT USING (auth.uid()::text = (metadata->>'user_id'));

-- Policy for authenticated users (insert their own leads)
CREATE POLICY "Users can insert their own leads" ON leads
  FOR INSERT WITH CHECK (auth.uid()::text = (metadata->>'user_id'));

-- Policy for authenticated users (update their own leads)
CREATE POLICY "Users can update their own leads" ON leads
  FOR UPDATE USING (auth.uid()::text = (metadata->>'user_id'));

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_leads_updated_at 
  BEFORE UPDATE ON leads 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE leads IS 'Stores lead information collected from marketing chat interactions';
COMMENT ON COLUMN leads.website_domain IS 'Domain name extracted from website URL';
COMMENT ON COLUMN leads.website_url IS 'Full website URL provided by the lead';
COMMENT ON COLUMN leads.email IS 'Lead email address (unique)';
COMMENT ON COLUMN leads.conversation_id IS 'Unique identifier for the chat conversation';
COMMENT ON COLUMN leads.source IS 'Source of the lead (e.g., chat_widget, form, etc.)';
COMMENT ON COLUMN leads.status IS 'Current status of the lead in the sales pipeline';
COMMENT ON COLUMN leads.metadata IS 'Additional metadata about the lead (JSON format)';
COMMENT ON COLUMN leads.collected_at IS 'Timestamp when the lead was first collected';
COMMENT ON COLUMN leads.updated_at IS 'Timestamp when the lead was last updated';
COMMENT ON COLUMN leads.created_at IS 'Timestamp when the record was created';
