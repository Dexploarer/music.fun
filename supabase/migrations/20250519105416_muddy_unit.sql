/*
  # Create Predictive Analytics tables

  1. New Tables
    - `predictive_models`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `type` (text, not null)
      - `description` (text)
      - `parameters` (jsonb, not null)
      - `accuracy` (numeric)
      - `last_trained` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `predictions`
      - `id` (uuid, primary key)
      - `model_id` (uuid, foreign key to predictive_models)
      - `event_id` (uuid, foreign key to events, nullable)
      - `prediction_date` (timestamptz, not null)
      - `target_metric` (text, not null)
      - `predicted_value` (numeric, not null)
      - `confidence_score` (numeric)
      - `actual_value` (numeric)
      - `metadata` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `venue_seasons`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `start_date` (date, not null)
      - `end_date` (date, not null)
      - `description` (text)
      - `attendance_multiplier` (numeric)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Predictive Models Table
CREATE TABLE IF NOT EXISTS predictive_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  description text,
  parameters jsonb NOT NULL DEFAULT '{}',
  accuracy numeric,
  last_trained timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Predictions Table
CREATE TABLE IF NOT EXISTS predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id uuid REFERENCES predictive_models(id) ON DELETE CASCADE,
  event_id uuid REFERENCES events(id) ON DELETE SET NULL,
  prediction_date timestamptz NOT NULL DEFAULT now(),
  target_metric text NOT NULL,
  predicted_value numeric NOT NULL,
  confidence_score numeric,
  actual_value numeric,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Venue Seasons Table
CREATE TABLE IF NOT EXISTS venue_seasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  description text,
  attendance_multiplier numeric DEFAULT 1.0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE predictive_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_seasons ENABLE ROW LEVEL SECURITY;

-- Create Policies for Predictive Models
CREATE POLICY "Users can read all predictive models"
  ON predictive_models
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create predictive models"
  ON predictive_models
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update predictive models"
  ON predictive_models
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete predictive models"
  ON predictive_models
  FOR DELETE
  TO authenticated
  USING (true);

-- Create Policies for Predictions
CREATE POLICY "Users can read all predictions"
  ON predictions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create predictions"
  ON predictions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update predictions"
  ON predictions
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete predictions"
  ON predictions
  FOR DELETE
  TO authenticated
  USING (true);

-- Create Policies for Venue Seasons
CREATE POLICY "Users can read all venue seasons"
  ON venue_seasons
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create venue seasons"
  ON venue_seasons
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update venue seasons"
  ON venue_seasons
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete venue seasons"
  ON venue_seasons
  FOR DELETE
  TO authenticated
  USING (true);

-- Create Indexes
CREATE INDEX IF NOT EXISTS predictions_model_id_idx ON predictions (model_id);
CREATE INDEX IF NOT EXISTS predictions_event_id_idx ON predictions (event_id);
CREATE INDEX IF NOT EXISTS predictions_prediction_date_idx ON predictions (prediction_date);
CREATE INDEX IF NOT EXISTS venue_seasons_date_range_idx ON venue_seasons (start_date, end_date);

-- Insert sample predictive models
INSERT INTO predictive_models 
  (name, type, description, parameters, accuracy, last_trained)
VALUES
  ('Attendance Prediction Model', 'attendance', 'Predicts event attendance based on historical data and external factors',
   '{"genres": ["blues", "jazz", "folk", "rock", "country"], "days": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"], "weatherFactors": ["clear", "rain", "snow"], "holidayFactor": true}',
   0.82, now()),
   
  ('Price Optimization Model', 'pricing', 'Determines optimal ticket pricing to maximize revenue',
   '{"genres": ["blues", "jazz", "folk", "rock", "country"], "elasticityFactors": ["weekend", "holiday", "competition"], "capacityUtilization": true}',
   0.78, now()),
   
  ('Revenue Forecast Model', 'revenue', 'Projects total revenue across tickets, bar, and merchandise',
   '{"genres": ["blues", "jazz", "folk", "rock", "country"], "components": ["tickets", "bar", "merchandise"], "seasonalFactors": true}',
   0.85, now());

-- Insert sample venue seasons
INSERT INTO venue_seasons 
  (name, start_date, end_date, description, attendance_multiplier)
VALUES
  ('Summer Festival Season', '2024-05-15', '2024-09-15', 'Peak season with outdoor events and higher attendance', 1.3),
  ('Holiday Season', '2024-11-15', '2025-01-15', 'Winter holiday season with special events', 1.2),
  ('Spring Series', '2025-03-01', '2025-05-15', 'Spring concert series featuring local artists', 1.1),
  ('Winter Slowdown', '2025-01-16', '2025-02-28', 'Post-holiday slower period', 0.8);