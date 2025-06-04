/*
  # Create events management tables

  1. New Tables
    - `events`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `date` (date)
      - `start_time` (time)
      - `end_time` (time)
      - `artist_ids` (text[])
      - `tickets_sold` (integer)
      - `total_capacity` (integer)
      - `ticket_price` (numeric)
      - `status` (text)
      - `image` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    - `event_revenue`
      - `id` (uuid, primary key)
      - `event_id` (uuid, foreign key)
      - `tickets` (numeric)
      - `bar` (numeric)
      - `merchandise` (numeric)
      - `other` (numeric)
    - `event_expenses`
      - `id` (uuid, primary key)
      - `event_id` (uuid, foreign key)
      - `artists` (numeric)
      - `staff` (numeric)
      - `marketing` (numeric)
      - `other` (numeric)
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Events Table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  artist_ids text[] DEFAULT '{}',
  tickets_sold integer DEFAULT 0,
  total_capacity integer NOT NULL,
  ticket_price numeric NOT NULL,
  status text NOT NULL DEFAULT 'upcoming',
  image text,
  genre text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Event Revenue Table
CREATE TABLE IF NOT EXISTS event_revenue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  tickets numeric DEFAULT 0,
  bar numeric DEFAULT 0,
  merchandise numeric DEFAULT 0,
  other numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Event Expenses Table
CREATE TABLE IF NOT EXISTS event_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  artists numeric DEFAULT 0,
  staff numeric DEFAULT 0,
  marketing numeric DEFAULT 0,
  other numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_expenses ENABLE ROW LEVEL SECURITY;

-- Create Policies
-- Events policies
CREATE POLICY "Users can read all events"
  ON events
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create events"
  ON events
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update events"
  ON events
  FOR UPDATE
  TO authenticated
  USING (true);

-- Revenue policies
CREATE POLICY "Users can read all event revenue"
  ON event_revenue
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create event revenue"
  ON event_revenue
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update event revenue"
  ON event_revenue
  FOR UPDATE
  TO authenticated
  USING (true);

-- Expenses policies
CREATE POLICY "Users can read all event expenses"
  ON event_expenses
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create event expenses"
  ON event_expenses
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update event expenses"
  ON event_expenses
  FOR UPDATE
  TO authenticated
  USING (true);