/*
  # Create artists table and relationships

  1. New Tables
    - `artists`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `genre` (text)
      - `location` (text)
      - `email` (text)
      - `phone` (text)
      - `image` (text)
      - `bio` (text)
      - `last_performance` (date)
      - `next_performance` (date)
      - `status` (text, default 'Inquiry')
      - `social_media` (jsonb)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
  
  2. Security
    - Enable RLS on `artists` table
    - Add policies for authenticated users
*/

-- Artists Table
CREATE TABLE IF NOT EXISTS artists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  genre text,
  location text,
  email text,
  phone text,
  image text,
  bio text,
  last_performance date,
  next_performance date,
  status text DEFAULT 'Inquiry',
  social_media jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can read all artists"
  ON artists
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create artists"
  ON artists
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update artists"
  ON artists
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create index on name for faster lookups
CREATE INDEX IF NOT EXISTS artists_name_idx ON artists (name);