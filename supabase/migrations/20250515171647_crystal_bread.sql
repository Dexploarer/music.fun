/*
  # Create marketing campaigns table

  1. New Tables
    - `marketing_campaigns`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `description` (text)
      - `date` (date)
      - `platforms` (text[])
      - `status` (text, default 'draft')
      - `event_id` (uuid, foreign key to events)
      - `content` (jsonb)
      - `performance` (jsonb)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
  
  2. Security
    - Enable RLS on `marketing_campaigns` table
    - Add policies for authenticated users
*/

-- Marketing Campaigns Table
CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  date date,
  platforms text[] DEFAULT '{}',
  status text DEFAULT 'draft',
  event_id uuid REFERENCES events(id) ON DELETE SET NULL,
  content jsonb DEFAULT '{}',
  performance jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can read all marketing campaigns"
  ON marketing_campaigns
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create marketing campaigns"
  ON marketing_campaigns
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update marketing campaigns"
  ON marketing_campaigns
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create index on event_id for faster lookups
CREATE INDEX IF NOT EXISTS marketing_campaigns_event_id_idx ON marketing_campaigns (event_id);