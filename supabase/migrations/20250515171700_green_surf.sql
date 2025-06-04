/*
  # Create financial transactions table

  1. New Tables
    - `financial_transactions`
      - `id` (uuid, primary key)
      - `date` (date, not null)
      - `description` (text, not null)
      - `amount` (numeric, not null)
      - `category` (text, not null)
      - `type` (text, not null)
      - `event_id` (uuid, foreign key to events)
      - `artist_id` (uuid, foreign key to artists)
      - `notes` (text)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
  
  2. Security
    - Enable RLS on `financial_transactions` table
    - Add policies for authenticated users
*/

-- Financial Transactions Table
CREATE TABLE IF NOT EXISTS financial_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  description text NOT NULL,
  amount numeric NOT NULL,
  category text NOT NULL,
  type text NOT NULL,
  event_id uuid REFERENCES events(id) ON DELETE SET NULL,
  artist_id uuid REFERENCES artists(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can read all financial transactions"
  ON financial_transactions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create financial transactions"
  ON financial_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update financial transactions"
  ON financial_transactions
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS financial_transactions_event_id_idx ON financial_transactions (event_id);
CREATE INDEX IF NOT EXISTS financial_transactions_artist_id_idx ON financial_transactions (artist_id);
CREATE INDEX IF NOT EXISTS financial_transactions_date_idx ON financial_transactions (date);