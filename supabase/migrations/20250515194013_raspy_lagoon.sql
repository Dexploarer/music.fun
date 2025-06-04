/*
  # Create documents table for storing document metadata

  1. New Tables
    - `documents`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `type` (text, not null) - template, contract, invoice, etc.
      - `description` (text)
      - `content` (text) - This could be a URL to a stored file or actual content
      - `file_type` (text) - pdf, docx, etc.
      - `file_size` (integer) - in bytes
      - `created_by` (text)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
      - `tags` (text[]) - For categorization and filtering
      - `is_template` (boolean) - Whether this is a template
      - `related_entity_id` (uuid) - Could be linked to an event, artist, etc.
      - `related_entity_type` (text) - 'event', 'artist', etc.
  
  2. Security
    - Enable RLS on `documents` table
    - Add policies for authenticated users
*/

-- Documents Table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  description text,
  content text,
  file_type text,
  file_size integer,
  created_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  tags text[] DEFAULT '{}',
  is_template boolean DEFAULT false,
  related_entity_id uuid,
  related_entity_type text
);

-- Enable Row Level Security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can read all documents"
  ON documents
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create documents"
  ON documents
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update documents"
  ON documents
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete documents"
  ON documents
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS documents_type_idx ON documents (type);
CREATE INDEX IF NOT EXISTS documents_is_template_idx ON documents (is_template);
CREATE INDEX IF NOT EXISTS documents_related_entity_id_idx ON documents (related_entity_id);