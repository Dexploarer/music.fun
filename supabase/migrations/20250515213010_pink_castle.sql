/*
  # Create Inventory Management tables

  1. New Tables
    - `inventory_categories`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `description` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    - `inventory_items`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `sku` (text)
      - `description` (text)
      - `category_id` (uuid, foreign key)
      - `unit_price` (numeric)
      - `cost_price` (numeric)
      - `current_stock` (numeric)
      - `reorder_level` (numeric)
      - `vendor` (text)
      - `image_url` (text)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    - `inventory_transactions`
      - `id` (uuid, primary key)
      - `item_id` (uuid, foreign key)
      - `transaction_type` (text, not null)
      - `quantity` (numeric, not null)
      - `transaction_date` (timestamptz)
      - `notes` (text)
      - `related_entity_id` (uuid)
      - `related_entity_type` (text)
      - `created_by` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Inventory Categories Table
CREATE TABLE IF NOT EXISTS inventory_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Inventory Items Table
CREATE TABLE IF NOT EXISTS inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sku text,
  description text,
  category_id uuid REFERENCES inventory_categories(id) ON DELETE SET NULL,
  unit_price numeric,
  cost_price numeric,
  current_stock numeric DEFAULT 0,
  reorder_level numeric DEFAULT 10,
  vendor text,
  image_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Inventory Transactions Table
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  transaction_type text NOT NULL,
  quantity numeric NOT NULL,
  transaction_date timestamptz DEFAULT now(),
  notes text,
  related_entity_id uuid,
  related_entity_type text,
  created_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE inventory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;

-- Create Policies
-- Inventory categories policies
CREATE POLICY "Users can read all inventory categories"
  ON inventory_categories
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create inventory categories"
  ON inventory_categories
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update inventory categories"
  ON inventory_categories
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete inventory categories"
  ON inventory_categories
  FOR DELETE
  TO authenticated
  USING (true);

-- Inventory items policies
CREATE POLICY "Users can read all inventory items"
  ON inventory_items
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create inventory items"
  ON inventory_items
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update inventory items"
  ON inventory_items
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete inventory items"
  ON inventory_items
  FOR DELETE
  TO authenticated
  USING (true);

-- Inventory transactions policies
CREATE POLICY "Users can read all inventory transactions"
  ON inventory_transactions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create inventory transactions"
  ON inventory_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update inventory transactions"
  ON inventory_transactions
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete inventory transactions"
  ON inventory_transactions
  FOR DELETE
  TO authenticated
  USING (true);

-- Create required indexes
CREATE INDEX IF NOT EXISTS inventory_items_category_id_idx ON inventory_items (category_id);
CREATE INDEX IF NOT EXISTS inventory_items_sku_idx ON inventory_items (sku);
CREATE INDEX IF NOT EXISTS inventory_items_stock_idx ON inventory_items (current_stock);

CREATE INDEX IF NOT EXISTS inventory_transactions_item_id_idx ON inventory_transactions (item_id);
CREATE INDEX IF NOT EXISTS inventory_transactions_date_idx ON inventory_transactions (transaction_date);
CREATE INDEX IF NOT EXISTS inventory_transactions_type_idx ON inventory_transactions (transaction_type);

-- Create trigger to update inventory item stock when transactions are added
CREATE OR REPLACE FUNCTION update_inventory_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.transaction_type = 'purchase' OR NEW.transaction_type = 'adjustment_add' THEN
    UPDATE inventory_items
    SET current_stock = current_stock + NEW.quantity,
        updated_at = now()
    WHERE id = NEW.item_id;
  ELSIF NEW.transaction_type = 'sale' OR NEW.transaction_type = 'waste' OR NEW.transaction_type = 'adjustment_remove' THEN
    UPDATE inventory_items
    SET current_stock = current_stock - NEW.quantity,
        updated_at = now()
    WHERE id = NEW.item_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update inventory stock
CREATE TRIGGER update_inventory_stock_trigger
AFTER INSERT ON inventory_transactions
FOR EACH ROW
EXECUTE FUNCTION update_inventory_stock();