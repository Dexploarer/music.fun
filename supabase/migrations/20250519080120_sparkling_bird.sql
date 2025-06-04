/*
  # Create Advanced Analytics Tables

  1. New Tables
    - `analytics_metrics`
      - `id` (uuid, primary key)
      - `metric_name` (text, not null)
      - `category` (text, not null) - 'financial', 'attendance', 'marketing', etc.
      - `time_period` (text, not null) - 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
      - `date` (date, not null)
      - `value` (numeric, not null)
      - `comparison_value` (numeric) - optional previous period value
      - `target_value` (numeric) - optional goal/target
      - `is_cumulative` (boolean)
      - `metadata` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `custom_dashboards`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `description` (text)
      - `layout` (jsonb) - dashboard layout configuration
      - `is_default` (boolean)
      - `created_by` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `dashboard_widgets`
      - `id` (uuid, primary key)
      - `dashboard_id` (uuid, foreign key)
      - `widget_type` (text, not null) - 'chart', 'metric', 'table'
      - `title` (text, not null)
      - `data_source` (text) - SQL query or table reference
      - `chart_type` (text) - for chart widgets
      - `time_range` (text) - 'last_7_days', 'last_30_days', 'current_month', 'current_year'
      - `position_x` (integer)
      - `position_y` (integer)
      - `width` (integer)
      - `height` (integer)
      - `config` (jsonb) - widget-specific configuration
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Analytics Metrics Table
CREATE TABLE IF NOT EXISTS analytics_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name text NOT NULL,
  category text NOT NULL,
  time_period text NOT NULL,
  date date NOT NULL,
  value numeric NOT NULL,
  comparison_value numeric,
  target_value numeric,
  is_cumulative boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Custom Dashboards Table
CREATE TABLE IF NOT EXISTS custom_dashboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  layout jsonb DEFAULT '{}',
  is_default boolean DEFAULT false,
  created_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Dashboard Widgets Table
CREATE TABLE IF NOT EXISTS dashboard_widgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id uuid NOT NULL REFERENCES custom_dashboards(id) ON DELETE CASCADE,
  widget_type text NOT NULL,
  title text NOT NULL,
  data_source text,
  chart_type text,
  time_range text DEFAULT 'last_30_days',
  position_x integer DEFAULT 0,
  position_y integer DEFAULT 0,
  width integer DEFAULT 1,
  height integer DEFAULT 1,
  config jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE analytics_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;

-- Create Policies
-- Analytics Metrics policies
CREATE POLICY "Users can read all analytics metrics"
  ON analytics_metrics
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create analytics metrics"
  ON analytics_metrics
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update analytics metrics"
  ON analytics_metrics
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete analytics metrics"
  ON analytics_metrics
  FOR DELETE
  TO authenticated
  USING (true);

-- Custom Dashboards policies
CREATE POLICY "Users can read all custom dashboards"
  ON custom_dashboards
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create custom dashboards"
  ON custom_dashboards
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update custom dashboards"
  ON custom_dashboards
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete custom dashboards"
  ON custom_dashboards
  FOR DELETE
  TO authenticated
  USING (true);

-- Dashboard Widgets policies
CREATE POLICY "Users can read all dashboard widgets"
  ON dashboard_widgets
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create dashboard widgets"
  ON dashboard_widgets
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update dashboard widgets"
  ON dashboard_widgets
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete dashboard widgets"
  ON dashboard_widgets
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS analytics_metrics_date_idx ON analytics_metrics (date);
CREATE INDEX IF NOT EXISTS analytics_metrics_category_idx ON analytics_metrics (category);
CREATE INDEX IF NOT EXISTS analytics_metrics_metric_name_idx ON analytics_metrics (metric_name);
CREATE INDEX IF NOT EXISTS dashboard_widgets_dashboard_id_idx ON dashboard_widgets (dashboard_id);