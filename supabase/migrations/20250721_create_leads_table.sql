-- Create leads table for storing prospect information from chat
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  website_domain TEXT NOT NULL,
  website_url TEXT NOT NULL,
  email TEXT NOT NULL,
  conversation_id TEXT,
  source TEXT DEFAULT 'chat_widget',
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'closed')),
  collected_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  
  -- Indexes for performance
  CONSTRAINT leads_email_unique UNIQUE (email)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_domain ON leads(website_domain);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_collected_at ON leads(collected_at);
CREATE INDEX IF NOT EXISTS idx_leads_conversation_id ON leads(conversation_id);

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

-- Add RLS (Row Level Security) policies
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Policy to allow service role to do everything
CREATE POLICY "Service role can manage leads" ON leads
    FOR ALL USING (auth.role() = 'service_role');

-- Policy to allow authenticated users to read their own leads (if needed)
CREATE POLICY "Users can view leads" ON leads
    FOR SELECT USING (true);

-- Add comments for documentation
COMMENT ON TABLE leads IS 'Stores lead information collected from chat interactions';
COMMENT ON COLUMN leads.website_domain IS 'Extracted domain name from website URL';
COMMENT ON COLUMN leads.website_url IS 'Full website URL provided by user';
COMMENT ON COLUMN leads.email IS 'User email address for outreach';
COMMENT ON COLUMN leads.conversation_id IS 'Associated chat conversation ID';
COMMENT ON COLUMN leads.source IS 'Source of lead collection (chat_widget, form, etc.)';
COMMENT ON COLUMN leads.status IS 'Current status of the lead in sales pipeline';
COMMENT ON COLUMN leads.metadata IS 'Additional metadata like user agent, IP, referrer';
