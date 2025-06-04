/*
  # Create Customer Relationship Management tables

  1. New Tables
    - `customers`
      - `id` (uuid, primary key)
      - `first_name` (text)
      - `last_name` (text)
      - `email` (text, unique)
      - `phone` (text)
      - `address` (text)
      - `city` (text)
      - `state` (text)
      - `zip` (text)
      - `notes` (text)
      - `birthday` (date)
      - `customer_since` (date)
      - `last_visit` (date)
      - `tags` (text[])
      - `marketing_preferences` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    - `customer_interactions`
      - `id` (uuid, primary key)
      - `customer_id` (uuid, foreign key)
      - `type` (text)
      - `date` (timestamptz)
      - `description` (text)
      - `staff_member` (text)
      - `related_entity_id` (uuid)
      - `related_entity_type` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE,
  phone text,
  address text,
  city text,
  state text,
  zip text,
  notes text,
  birthday date,
  customer_since date DEFAULT CURRENT_DATE,
  last_visit date,
  tags text[] DEFAULT '{}',
  marketing_preferences jsonb DEFAULT '{
    "email_promotions": true,
    "sms_notifications": false,
    "newsletter": true,
    "special_events": true,
    "unsubscribed": false
  }',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Customer Interactions Table
CREATE TABLE IF NOT EXISTS customer_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  type text NOT NULL,
  date timestamptz DEFAULT now(),
  description text,
  staff_member text,
  related_entity_id uuid,
  related_entity_type text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_interactions ENABLE ROW LEVEL SECURITY;

-- Create Policies
-- Customers policies
CREATE POLICY "Users can read all customers"
  ON customers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create customers"
  ON customers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update customers"
  ON customers
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete customers"
  ON customers
  FOR DELETE
  TO authenticated
  USING (true);

-- Customer interactions policies
CREATE POLICY "Users can read all customer interactions"
  ON customer_interactions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create customer interactions"
  ON customer_interactions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update customer interactions"
  ON customer_interactions
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete customer interactions"
  ON customer_interactions
  FOR DELETE
  TO authenticated
  USING (true);

-- Create required indexes
CREATE INDEX IF NOT EXISTS customers_email_idx ON customers (email);
CREATE INDEX IF NOT EXISTS customers_phone_idx ON customers (phone);
CREATE INDEX IF NOT EXISTS customers_name_idx ON customers (first_name, last_name);
CREATE INDEX IF NOT EXISTS customers_last_visit_idx ON customers (last_visit);

CREATE INDEX IF NOT EXISTS customer_interactions_customer_id_idx ON customer_interactions (customer_id);
CREATE INDEX IF NOT EXISTS customer_interactions_type_idx ON customer_interactions (type);
CREATE INDEX IF NOT EXISTS customer_interactions_date_idx ON customer_interactions (date);