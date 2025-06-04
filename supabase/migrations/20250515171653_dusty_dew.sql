/*
  # Create tickets table

  1. New Tables
    - `tickets`
      - `id` (uuid, primary key)
      - `event_id` (uuid, foreign key to events)
      - `purchase_date` (timestamptz, default now())
      - `purchaser_name` (text)
      - `purchaser_email` (text)
      - `price` (numeric)
      - `type` (text, default 'general')
      - `status` (text, default 'valid')
      - `scanned_at` (timestamptz)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
  
  2. Security
    - Enable RLS on `tickets` table
    - Add policies for authenticated users
*/

-- Tickets Table
CREATE TABLE IF NOT EXISTS tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  purchase_date timestamptz DEFAULT now(),
  purchaser_name text,
  purchaser_email text,
  price numeric NOT NULL,
  type text DEFAULT 'general',
  status text DEFAULT 'valid',
  scanned_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can read all tickets"
  ON tickets
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create tickets"
  ON tickets
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update tickets"
  ON tickets
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create index on event_id for faster lookups
CREATE INDEX IF NOT EXISTS tickets_event_id_idx ON tickets (event_id);

-- Create function to update event tickets_sold when tickets are added/updated
CREATE OR REPLACE FUNCTION update_event_tickets_sold()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the events table tickets_sold count
  UPDATE events
  SET tickets_sold = (
    SELECT COUNT(*) 
    FROM tickets 
    WHERE event_id = NEW.event_id AND status != 'refunded' AND status != 'cancelled'
  )
  WHERE id = NEW.event_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update event tickets sold count
CREATE TRIGGER update_tickets_sold_trigger
AFTER INSERT OR UPDATE ON tickets
FOR EACH ROW
EXECUTE FUNCTION update_event_tickets_sold();