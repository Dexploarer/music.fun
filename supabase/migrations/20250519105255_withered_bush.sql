/*
  # Create Customer Loyalty Program tables

  1. New Tables
    - `loyalty_tiers`
      - `id` (uuid, primary key)
      - `name` (text) - Regular, Gold, Platinum, etc.
      - `point_threshold` (integer) - Points needed to reach this tier
      - `benefits` (text) - Description of tier benefits
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `customer_loyalty`
      - `id` (uuid, primary key)
      - `customer_id` (uuid, foreign key to customers)
      - `points` (integer) - Current point balance
      - `tier_id` (uuid, foreign key to loyalty_tiers)
      - `last_updated` (timestamptz)
      - `last_points_added` (integer)
      - `last_points_reason` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `point_multipliers`
      - `id` (uuid, primary key)
      - `name` (text)
      - `multiplier` (numeric)
      - `description` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `loyalty_rewards`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `points_cost` (integer)
      - `required_tier_id` (uuid, foreign key to loyalty_tiers, nullable)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `reward_redemptions`
      - `id` (uuid, primary key)
      - `customer_id` (uuid, foreign key to customers)
      - `reward_id` (uuid, foreign key to loyalty_rewards)
      - `points_spent` (integer)
      - `redemption_date` (timestamptz)
      - `status` (text) - pending, completed, cancelled
      - `notes` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Loyalty Tiers Table
CREATE TABLE IF NOT EXISTS loyalty_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  point_threshold integer NOT NULL,
  benefits text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Customer Loyalty Table
CREATE TABLE IF NOT EXISTS customer_loyalty (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  points integer NOT NULL DEFAULT 0,
  tier_id uuid REFERENCES loyalty_tiers(id) ON DELETE SET NULL,
  last_updated timestamptz DEFAULT now(),
  last_points_added integer,
  last_points_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(customer_id)
);

-- Point Multipliers Table
CREATE TABLE IF NOT EXISTS point_multipliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  multiplier numeric NOT NULL DEFAULT 1,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Loyalty Rewards Table
CREATE TABLE IF NOT EXISTS loyalty_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  points_cost integer NOT NULL,
  required_tier_id uuid REFERENCES loyalty_tiers(id) ON DELETE SET NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Reward Redemptions Table
CREATE TABLE IF NOT EXISTS reward_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  reward_id uuid NOT NULL REFERENCES loyalty_rewards(id) ON DELETE CASCADE,
  points_spent integer NOT NULL,
  redemption_date timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE loyalty_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_loyalty ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_multipliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_redemptions ENABLE ROW LEVEL SECURITY;

-- Create Policies for Loyalty Tiers
CREATE POLICY "Users can read all loyalty tiers"
  ON loyalty_tiers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create loyalty tiers"
  ON loyalty_tiers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update loyalty tiers"
  ON loyalty_tiers
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create Policies for Customer Loyalty
CREATE POLICY "Users can read all customer loyalty"
  ON customer_loyalty
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create customer loyalty"
  ON customer_loyalty
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update customer loyalty"
  ON customer_loyalty
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create Policies for Point Multipliers
CREATE POLICY "Users can read all point multipliers"
  ON point_multipliers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create point multipliers"
  ON point_multipliers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update point multipliers"
  ON point_multipliers
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create Policies for Loyalty Rewards
CREATE POLICY "Users can read all loyalty rewards"
  ON loyalty_rewards
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create loyalty rewards"
  ON loyalty_rewards
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update loyalty rewards"
  ON loyalty_rewards
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create Policies for Reward Redemptions
CREATE POLICY "Users can read all reward redemptions"
  ON reward_redemptions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create reward redemptions"
  ON reward_redemptions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update reward redemptions"
  ON reward_redemptions
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create Indexes
CREATE INDEX IF NOT EXISTS customer_loyalty_tier_id_idx ON customer_loyalty (tier_id);
CREATE INDEX IF NOT EXISTS reward_redemptions_customer_id_idx ON reward_redemptions (customer_id);
CREATE INDEX IF NOT EXISTS reward_redemptions_reward_id_idx ON reward_redemptions (reward_id);

-- Insert default loyalty tiers
INSERT INTO loyalty_tiers (name, point_threshold, benefits)
VALUES 
  ('Regular', 0, 'Standard access to events, Regular pricing, Basic rewards'),
  ('Gold', 1000, 'Priority access to tickets, 10% discount on drinks, Free coat check'),
  ('Platinum', 3000, 'VIP entrance, 15% discount on all purchases, Dedicated host, Artist meet & greets');

-- Insert default point multipliers
INSERT INTO point_multipliers (name, multiplier, description)
VALUES 
  ('Standard Purchases', 1, 'Standard ticket and merchandise purchases'),
  ('Premium Events', 2, 'Special events and premium shows'),
  ('Weekday Events', 1.5, 'Events held Monday through Thursday'),
  ('Friend Referral', 3, 'Points for bringing new customers');

-- Insert default rewards
INSERT INTO loyalty_rewards (name, description, points_cost, required_tier_id)
VALUES 
  ('Free Drink Voucher', 'Redeem for one free standard drink at the venue bar.', 500, NULL),
  ('Free Admission', 'One free entry to a standard event (excludes special events).', 1000, (SELECT id FROM loyalty_tiers WHERE name = 'Gold')),
  ('VIP Experience', 'VIP treatment for one event including reserved seating and a drink package.', 2500, (SELECT id FROM loyalty_tiers WHERE name = 'Platinum')),
  ('Merchandise Credit', '$15 credit toward venue merchandise.', 750, NULL),
  ('Event Pre-sale Access', 'Early access to tickets for the next 3 special events.', 1500, (SELECT id FROM loyalty_tiers WHERE name = 'Gold')),
  ('Meet & Greet Pass', 'Meet and greet with an artist at an upcoming event.', 5000, (SELECT id FROM loyalty_tiers WHERE name = 'Platinum'));