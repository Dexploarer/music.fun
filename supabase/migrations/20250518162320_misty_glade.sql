/*
  # Create brand memory table

  1. New Tables
    - `brand_memory`
      - `id` (uuid, primary key)
      - `venue_name` (text, unique)
      - `memory_data` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `brand_memory` table
    - Add policies for authenticated users
*/

-- Brand Memory Table
CREATE TABLE IF NOT EXISTS brand_memory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_name text UNIQUE NOT NULL,
  memory_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE brand_memory ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can read brand memory"
  ON brand_memory
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create brand memory"
  ON brand_memory
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update brand memory"
  ON brand_memory
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS brand_memory_venue_name_idx ON brand_memory (venue_name);