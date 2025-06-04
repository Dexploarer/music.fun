/*
  # Create Equipment Management tables

  1. New Tables
    - `equipment`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `category` (text, not null)
      - `serial_number` (text)
      - `manufacturer` (text)
      - `model` (text)
      - `purchase_date` (date)
      - `purchase_price` (numeric)
      - `condition` (text, not null)
      - `location` (text, not null)
      - `notes` (text)
      - `last_maintenance` (date)
      - `next_maintenance` (date)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `maintenance_records`
      - `id` (uuid, primary key)
      - `equipment_id` (uuid, foreign key to equipment)
      - `maintenance_date` (date, not null)
      - `maintenance_type` (text, not null)
      - `performed_by` (text, not null)
      - `cost` (numeric)
      - `notes` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `equipment_reservations`
      - `id` (uuid, primary key)
      - `equipment_id` (uuid, foreign key to equipment)
      - `event_id` (uuid, foreign key to events, nullable)
      - `start_date` (timestamptz, not null)
      - `end_date` (timestamptz, not null)
      - `reserved_by` (text, not null)
      - `status` (text, not null)
      - `notes` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Equipment Table
CREATE TABLE IF NOT EXISTS equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  serial_number text,
  manufacturer text,
  model text,
  purchase_date date,
  purchase_price numeric,
  condition text NOT NULL DEFAULT 'good',
  location text NOT NULL,
  notes text,
  last_maintenance date,
  next_maintenance date,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Maintenance Records Table
CREATE TABLE IF NOT EXISTS maintenance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id uuid NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  maintenance_date date NOT NULL,
  maintenance_type text NOT NULL,
  performed_by text NOT NULL,
  cost numeric,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Equipment Reservations Table
CREATE TABLE IF NOT EXISTS equipment_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id uuid NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  event_id uuid REFERENCES events(id) ON DELETE SET NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  reserved_by text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_reservations ENABLE ROW LEVEL SECURITY;

-- Create Policies for Equipment
CREATE POLICY "Users can read all equipment"
  ON equipment
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create equipment"
  ON equipment
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update equipment"
  ON equipment
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete equipment"
  ON equipment
  FOR DELETE
  TO authenticated
  USING (true);

-- Create Policies for Maintenance Records
CREATE POLICY "Users can read all maintenance records"
  ON maintenance_records
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create maintenance records"
  ON maintenance_records
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update maintenance records"
  ON maintenance_records
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete maintenance records"
  ON maintenance_records
  FOR DELETE
  TO authenticated
  USING (true);

-- Create Policies for Equipment Reservations
CREATE POLICY "Users can read all equipment reservations"
  ON equipment_reservations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create equipment reservations"
  ON equipment_reservations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update equipment reservations"
  ON equipment_reservations
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete equipment reservations"
  ON equipment_reservations
  FOR DELETE
  TO authenticated
  USING (true);

-- Create Indexes
CREATE INDEX IF NOT EXISTS equipment_category_idx ON equipment (category);
CREATE INDEX IF NOT EXISTS equipment_location_idx ON equipment (location);
CREATE INDEX IF NOT EXISTS equipment_next_maintenance_idx ON equipment (next_maintenance);
CREATE INDEX IF NOT EXISTS maintenance_records_equipment_id_idx ON maintenance_records (equipment_id);
CREATE INDEX IF NOT EXISTS equipment_reservations_equipment_id_idx ON equipment_reservations (equipment_id);
CREATE INDEX IF NOT EXISTS equipment_reservations_event_id_idx ON equipment_reservations (event_id);
CREATE INDEX IF NOT EXISTS equipment_reservations_date_range_idx ON equipment_reservations (start_date, end_date);

-- Insert sample equipment
INSERT INTO equipment 
  (name, category, serial_number, manufacturer, model, purchase_date, purchase_price, condition, location, notes, last_maintenance, next_maintenance)
VALUES
  ('Soundboard - Allen & Heath SQ-6', 'sound', 'SQ6-12345', 'Allen & Heath', 'SQ-6', '2023-01-15', 4999.99, 'excellent', 'Main Stage', 'Main digital mixer for house sound', '2023-08-15', '2024-02-15'),
  ('JBL EON615 PA Speaker (Left)', 'sound', 'EON615-789123', 'JBL', 'EON615', '2022-06-10', 699.95, 'good', 'Main Stage', 'Left main PA speaker', '2023-06-10', now() + interval '1 month'),
  ('JBL EON615 PA Speaker (Right)', 'sound', 'EON615-789124', 'JBL', 'EON615', '2022-06-10', 699.95, 'good', 'Main Stage', 'Right main PA speaker', '2023-06-10', now() + interval '1 month'),
  ('Shure SM58 Microphone', 'sound', 'SM58-456789', 'Shure', 'SM58', '2022-03-20', 99.99, 'excellent', 'Storage Room', 'Vocal microphone', '2023-09-01', '2024-03-01'),
  ('Chauvet DJ SlimPAR Pro', 'lighting', 'SLIM123456', 'Chauvet DJ', 'SlimPAR Pro', '2022-11-05', 249.99, 'good', 'Main Stage', 'RGB LED lighting fixture', '2023-11-05', now() + interval '2 months'),
  ('Roland Jazz Chorus JC-120', 'instruments', 'JC120-987654', 'Roland', 'Jazz Chorus JC-120', '2021-07-15', 1299.99, 'fair', 'Side Stage', 'Guitar amplifier - needs new speaker', '2023-02-10', now() - interval '1 month'),
  ('Fender American Professional Stratocaster', 'instruments', 'US21023456', 'Fender', 'American Professional Stratocaster', '2022-09-12', 1699.99, 'excellent', 'Storage Room', 'House electric guitar', '2023-09-12', '2024-03-12'),
  ('Behringer X32 Mixer', 'sound', 'X32-123987', 'Behringer', 'X32', '2020-03-15', 2499.99, 'poor', 'Storage Room', 'Backup mixer - needs repair on channel 5-8', '2022-10-05', now() - interval '2 months');

-- Insert sample maintenance records
INSERT INTO maintenance_records 
  (equipment_id, maintenance_date, maintenance_type, performed_by, cost, notes)
VALUES
  ((SELECT id FROM equipment WHERE name = 'Soundboard - Allen & Heath SQ-6'), '2023-08-15', 'routine', 'John Smith', 150.00, 'Firmware updated, faders cleaned and calibrated'),
  ((SELECT id FROM equipment WHERE name = 'JBL EON615 PA Speaker (Left)'), '2023-06-10', 'inspection', 'Audio Solutions Inc', 75.00, 'Checked connections and speaker cone, all in good condition'),
  ((SELECT id FROM equipment WHERE name = 'JBL EON615 PA Speaker (Right)'), '2023-06-10', 'inspection', 'Audio Solutions Inc', 75.00, 'Checked connections and speaker cone, all in good condition'),
  ((SELECT id FROM equipment WHERE name = 'Roland Jazz Chorus JC-120'), '2023-02-10', 'repair', 'Guitar Center', 220.00, 'Replaced faulty power cable, cleaned input jacks'),
  ((SELECT id FROM equipment WHERE name = 'Behringer X32 Mixer'), '2022-10-05', 'repair', 'Audio Solutions Inc', 350.00, 'Attempted repair of channels 5-8, still not functioning correctly. Unit may need to be sent to manufacturer.');