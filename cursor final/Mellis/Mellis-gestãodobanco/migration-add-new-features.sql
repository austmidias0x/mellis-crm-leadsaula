-- Migration: Add new features (sellers, is_customer, notes)

-- Create sellers table
CREATE TABLE IF NOT EXISTS sellers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add new columns to leads table
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS seller_id INTEGER REFERENCES sellers(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_customer BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_leads_seller_id ON leads(seller_id);
CREATE INDEX IF NOT EXISTS idx_leads_is_customer ON leads(is_customer);

-- Insert some default sellers (optional)
INSERT INTO sellers (name, email, active) VALUES
('Sem vendedor', NULL, true)
ON CONFLICT DO NOTHING;

