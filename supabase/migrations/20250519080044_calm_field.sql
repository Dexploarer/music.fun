/*
  # Create Event Reviews and Feedback system

  1. New Tables
    - `event_reviews`
      - `id` (uuid, primary key)
      - `event_id` (uuid, foreign key to events)
      - `customer_id` (uuid, foreign key to customers, nullable)
      - `rating` (integer, 1-5 stars)
      - `review_text` (text)
      - `attendance_confirmed` (boolean)
      - `review_date` (timestamptz)
      - `sentiment` (text) - positive, negative, neutral
      - `tags` (text[]) - feedback categories like 'service', 'sound', 'value'
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
    
    - `feedback_questions`
      - `id` (uuid, primary key)
      - `question_text` (text, not null)
      - `question_type` (text) - rating, text, multiple_choice
      - `options` (text[]) - for multiple_choice questions
      - `is_required` (boolean)
      - `active` (boolean)
      - `display_order` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `feedback_responses`
      - `id` (uuid, primary key)
      - `review_id` (uuid, foreign key to event_reviews)
      - `question_id` (uuid, foreign key to feedback_questions)
      - `response_text` (text)
      - `response_rating` (integer)
      - `response_option` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Event Reviews Table
CREATE TABLE IF NOT EXISTS event_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  attendance_confirmed boolean DEFAULT true,
  review_date timestamptz DEFAULT now(),
  sentiment text,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Feedback Questions Table
CREATE TABLE IF NOT EXISTS feedback_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text text NOT NULL,
  question_type text NOT NULL DEFAULT 'rating',
  options text[] DEFAULT '{}',
  is_required boolean DEFAULT true,
  active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Feedback Responses Table
CREATE TABLE IF NOT EXISTS feedback_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES event_reviews(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES feedback_questions(id) ON DELETE CASCADE,
  response_text text,
  response_rating integer,
  response_option text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE event_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_responses ENABLE ROW LEVEL SECURITY;

-- Create Policies
-- Event Reviews policies
CREATE POLICY "Users can read all event reviews"
  ON event_reviews
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create event reviews"
  ON event_reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update event reviews"
  ON event_reviews
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete event reviews"
  ON event_reviews
  FOR DELETE
  TO authenticated
  USING (true);

-- Feedback Questions policies
CREATE POLICY "Users can read all feedback questions"
  ON feedback_questions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create feedback questions"
  ON feedback_questions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update feedback questions"
  ON feedback_questions
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete feedback questions"
  ON feedback_questions
  FOR DELETE
  TO authenticated
  USING (true);

-- Feedback Responses policies
CREATE POLICY "Users can read all feedback responses"
  ON feedback_responses
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create feedback responses"
  ON feedback_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS event_reviews_event_id_idx ON event_reviews (event_id);
CREATE INDEX IF NOT EXISTS event_reviews_customer_id_idx ON event_reviews (customer_id);
CREATE INDEX IF NOT EXISTS event_reviews_rating_idx ON event_reviews (rating);
CREATE INDEX IF NOT EXISTS feedback_responses_review_id_idx ON feedback_responses (review_id);
CREATE INDEX IF NOT EXISTS feedback_responses_question_id_idx ON feedback_responses (question_id);