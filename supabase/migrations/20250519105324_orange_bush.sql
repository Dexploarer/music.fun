/*
  # Create Staff Management tables

  1. New Tables
    - `staff_members`
      - `id` (uuid, primary key)
      - `first_name` (text, not null)
      - `last_name` (text, not null)
      - `email` (text, not null, unique)
      - `phone` (text)
      - `position` (text, not null)
      - `department` (text, not null)
      - `hourly_rate` (numeric)
      - `is_active` (boolean)
      - `hire_date` (date, not null)
      - `skills` (text[])
      - `notes` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `shifts`
      - `id` (uuid, primary key)
      - `staff_id` (uuid, foreign key to staff_members)
      - `event_id` (uuid, foreign key to events, nullable)
      - `start_time` (timestamptz, not null)
      - `end_time` (timestamptz, not null)
      - `position` (text, not null)
      - `status` (text, not null)
      - `notes` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `time_entries`
      - `id` (uuid, primary key)
      - `staff_id` (uuid, foreign key to staff_members)
      - `shift_id` (uuid, foreign key to shifts, nullable)
      - `clock_in_time` (timestamptz, not null)
      - `clock_out_time` (timestamptz, nullable)
      - `total_hours` (numeric, nullable)
      - `approved` (boolean, not null)
      - `approved_by` (text, nullable)
      - `notes` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Staff Members Table
CREATE TABLE IF NOT EXISTS staff_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  position text NOT NULL,
  department text NOT NULL,
  hourly_rate numeric,
  is_active boolean DEFAULT true,
  hire_date date NOT NULL,
  skills text[] DEFAULT '{}',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Shifts Table
CREATE TABLE IF NOT EXISTS shifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
  event_id uuid REFERENCES events(id) ON DELETE SET NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  position text NOT NULL,
  status text NOT NULL DEFAULT 'scheduled',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Time Entries Table
CREATE TABLE IF NOT EXISTS time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
  shift_id uuid REFERENCES shifts(id) ON DELETE SET NULL,
  clock_in_time timestamptz NOT NULL,
  clock_out_time timestamptz,
  total_hours numeric,
  approved boolean NOT NULL DEFAULT false,
  approved_by text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Create Policies for Staff Members
CREATE POLICY "Users can read all staff members"
  ON staff_members
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create staff members"
  ON staff_members
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update staff members"
  ON staff_members
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete staff members"
  ON staff_members
  FOR DELETE
  TO authenticated
  USING (true);

-- Create Policies for Shifts
CREATE POLICY "Users can read all shifts"
  ON shifts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create shifts"
  ON shifts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update shifts"
  ON shifts
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete shifts"
  ON shifts
  FOR DELETE
  TO authenticated
  USING (true);

-- Create Policies for Time Entries
CREATE POLICY "Users can read all time entries"
  ON time_entries
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create time entries"
  ON time_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update time entries"
  ON time_entries
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete time entries"
  ON time_entries
  FOR DELETE
  TO authenticated
  USING (true);

-- Create Indexes
CREATE INDEX IF NOT EXISTS shifts_staff_id_idx ON shifts (staff_id);
CREATE INDEX IF NOT EXISTS shifts_event_id_idx ON shifts (event_id);
CREATE INDEX IF NOT EXISTS shifts_start_time_idx ON shifts (start_time);
CREATE INDEX IF NOT EXISTS time_entries_staff_id_idx ON time_entries (staff_id);
CREATE INDEX IF NOT EXISTS time_entries_shift_id_idx ON time_entries (shift_id);

-- Insert sample staff members
INSERT INTO staff_members 
  (first_name, last_name, email, phone, position, department, hourly_rate, hire_date, skills)
VALUES
  ('John', 'Doe', 'john@trainstation.com', '(555) 123-4567', 'Bar Manager', 'Bar', 18.50, '2022-05-15', 
   ARRAY['Bartending', 'Inventory Management', 'Staff Training']),
  ('Sarah', 'Johnson', 'sarah@trainstation.com', '(555) 987-6543', 'Sound Engineer', 'Technical', 22.00, '2021-08-10',
   ARRAY['Live Sound Mixing', 'Audio Equipment Maintenance', 'Pro Tools']),
  ('Miguel', 'Rodriguez', 'miguel@trainstation.com', '(555) 456-7890', 'Security Lead', 'Security', 17.00, '2023-02-20',
   ARRAY['Crowd Management', 'Conflict Resolution', 'First Aid Certified']),
  ('Lisa', 'Chen', 'lisa@trainstation.com', '(555) 234-5678', 'Bartender', 'Bar', 15.00, '2023-06-01',
   ARRAY['Mixology', 'Customer Service', 'Cash Handling']),
  ('David', 'Wilson', 'david@trainstation.com', '(555) 876-5432', 'Event Manager', 'Management', 24.00, '2022-01-15',
   ARRAY['Event Planning', 'Staff Coordination', 'Vendor Relations']);