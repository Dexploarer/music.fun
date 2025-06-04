/*
  # Add Square integration tables

  1. New Tables
    - `integrations`
      - `id` (uuid, primary key)
      - `provider` (text, not null) - e.g., 'square', 'stripe'
      - `merchant_id` (text) - provider's merchant ID
      - `access_token` (text) - encrypted token
      - `refresh_token` (text) - encrypted refresh token
      - `token_expiry` (timestamptz) - when the token expires
      - `scope` (text[]) - permissions granted
      - `metadata` (jsonb) - additional provider-specific data
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
  
  2. Security
    - Enable RLS on `integrations` table
    - Add policies for authenticated users
*/

-- Integrations Table
CREATE TABLE IF NOT EXISTS integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  merchant_id text,
  access_token text,
  refresh_token text,
  token_expiry timestamptz,
  scope text[],
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(provider, merchant_id)
);

-- Enable Row Level Security
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can read integrations"
  ON integrations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create integrations"
  ON integrations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update integrations"
  ON integrations
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create index on provider for faster lookups
CREATE INDEX IF NOT EXISTS integrations_provider_idx ON integrations (provider);