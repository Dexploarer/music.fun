/*
  # Create tasks table for Kanban board

  1. New Tables
    - `tasks`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `description` (text)
      - `status` (text, default 'todo')
      - `priority` (text, default 'medium')
      - `due_date` (date)
      - `assigned_to` (text)
      - `tags` (text[])
      - `related_entity_id` (uuid)
      - `related_entity_type` (text)
      - `position` (integer)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
  
  2. Security
    - Enable RLS on `tasks` table
    - Add policies for authenticated users
*/

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'todo',
  priority text NOT NULL DEFAULT 'medium',
  due_date date,
  assigned_to text,
  tags text[] DEFAULT '{}',
  related_entity_id uuid,
  related_entity_type text,
  position integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can read all tasks"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create tasks"
  ON tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update tasks"
  ON tasks
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete tasks"
  ON tasks
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS tasks_status_idx ON tasks (status);
CREATE INDEX IF NOT EXISTS tasks_related_entity_id_idx ON tasks (related_entity_id);
CREATE INDEX IF NOT EXISTS tasks_position_idx ON tasks (position);