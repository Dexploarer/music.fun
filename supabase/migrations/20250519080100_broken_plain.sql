/*
  # Create Artist Royalties and Payment Tracking system

  1. New Tables
    - `artist_contracts`
      - `id` (uuid, primary key)
      - `artist_id` (uuid, foreign key to artists)
      - `contract_name` (text, not null)
      - `contract_type` (text) - 'performance', 'recording', 'residency'
      - `start_date` (date)
      - `end_date` (date, nullable)
      - `payment_type` (text) - 'flat_fee', 'percentage', 'hybrid'
      - `flat_fee_amount` (numeric)
      - `percentage_rate` (numeric) - percentage of ticket sales or other revenue
      - `minimum_guarantee` (numeric)
      - `payment_schedule` (text) - 'single', 'installment', 'post_event'
      - `status` (text)
      - `contract_document_id` (uuid, nullable, foreign key to documents)
      - `notes` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `artist_payments`
      - `id` (uuid, primary key)
      - `artist_id` (uuid, foreign key to artists)
      - `contract_id` (uuid, foreign key to artist_contracts, nullable)
      - `event_id` (uuid, foreign key to events, nullable)
      - `payment_date` (date)
      - `amount` (numeric, not null)
      - `payment_method` (text) - 'cash', 'check', 'bank_transfer', 'other'
      - `reference_number` (text)
      - `status` (text) - 'pending', 'paid', 'cancelled'
      - `description` (text)
      - `created_by` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `royalty_reports`
      - `id` (uuid, primary key)
      - `artist_id` (uuid, foreign key to artists)
      - `event_id` (uuid, foreign key to events, nullable)
      - `report_period_start` (date)
      - `report_period_end` (date)
      - `gross_revenue` (numeric)
      - `deductions` (numeric)
      - `net_revenue` (numeric)
      - `royalty_percentage` (numeric)
      - `royalty_amount` (numeric)
      - `status` (text) - 'draft', 'final', 'paid'
      - `notes` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Artist Contracts Table
CREATE TABLE IF NOT EXISTS artist_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id uuid NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  contract_name text NOT NULL,
  contract_type text DEFAULT 'performance',
  start_date date,
  end_date date,
  payment_type text DEFAULT 'flat_fee',
  flat_fee_amount numeric,
  percentage_rate numeric,
  minimum_guarantee numeric,
  payment_schedule text DEFAULT 'post_event',
  status text DEFAULT 'draft',
  contract_document_id uuid REFERENCES documents(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Artist Payments Table
CREATE TABLE IF NOT EXISTS artist_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id uuid NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  contract_id uuid REFERENCES artist_contracts(id) ON DELETE SET NULL,
  event_id uuid REFERENCES events(id) ON DELETE SET NULL,
  payment_date date NOT NULL,
  amount numeric NOT NULL,
  payment_method text DEFAULT 'check',
  reference_number text,
  status text DEFAULT 'pending',
  description text,
  created_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Royalty Reports Table
CREATE TABLE IF NOT EXISTS royalty_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id uuid NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  event_id uuid REFERENCES events(id) ON DELETE SET NULL,
  report_period_start date NOT NULL,
  report_period_end date NOT NULL,
  gross_revenue numeric NOT NULL,
  deductions numeric DEFAULT 0,
  net_revenue numeric,
  royalty_percentage numeric,
  royalty_amount numeric,
  status text DEFAULT 'draft',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE artist_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE royalty_reports ENABLE ROW LEVEL SECURITY;

-- Create Policies
-- Artist Contracts policies
CREATE POLICY "Users can read all artist contracts"
  ON artist_contracts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create artist contracts"
  ON artist_contracts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update artist contracts"
  ON artist_contracts
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete artist contracts"
  ON artist_contracts
  FOR DELETE
  TO authenticated
  USING (true);

-- Artist Payments policies
CREATE POLICY "Users can read all artist payments"
  ON artist_payments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create artist payments"
  ON artist_payments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update artist payments"
  ON artist_payments
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete artist payments"
  ON artist_payments
  FOR DELETE
  TO authenticated
  USING (true);

-- Royalty Reports policies
CREATE POLICY "Users can read all royalty reports"
  ON royalty_reports
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create royalty reports"
  ON royalty_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update royalty reports"
  ON royalty_reports
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete royalty reports"
  ON royalty_reports
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS artist_contracts_artist_id_idx ON artist_contracts (artist_id);
CREATE INDEX IF NOT EXISTS artist_contracts_status_idx ON artist_contracts (status);
CREATE INDEX IF NOT EXISTS artist_payments_artist_id_idx ON artist_payments (artist_id);
CREATE INDEX IF NOT EXISTS artist_payments_contract_id_idx ON artist_payments (contract_id);
CREATE INDEX IF NOT EXISTS artist_payments_event_id_idx ON artist_payments (event_id);
CREATE INDEX IF NOT EXISTS royalty_reports_artist_id_idx ON royalty_reports (artist_id);
CREATE INDEX IF NOT EXISTS royalty_reports_event_id_idx ON royalty_reports (event_id);