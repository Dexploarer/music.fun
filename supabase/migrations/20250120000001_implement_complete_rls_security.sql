-- Enable RLS on all tables and create comprehensive security policies
-- This ensures only authenticated admin users can access Train Station data

-- Enable RLS on all existing tables
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE royalty_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_loyalty ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_multipliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictive_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_seasons ENABLE ROW LEVEL SECURITY;

-- Create user profiles table to store user roles and permissions
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('super_admin', 'admin', 'manager', 'staff', 'viewer')),
    department TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_sign_in_at TIMESTAMPTZ,
    failed_login_attempts INTEGER DEFAULT 0,
    account_locked_until TIMESTAMPTZ,
    password_changed_at TIMESTAMPTZ DEFAULT NOW(),
    must_change_password BOOLEAN DEFAULT false
);

-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create audit logs table for security tracking
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    table_name TEXT,
    record_id TEXT,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT role 
        FROM user_profiles 
        WHERE id = auth.uid() 
        AND is_active = true
        AND (account_locked_until IS NULL OR account_locked_until < NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is admin or super_admin
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_role() IN ('admin', 'super_admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is at least manager level
CREATE OR REPLACE FUNCTION is_manager_or_above()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_role() IN ('super_admin', 'admin', 'manager');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is at least staff level
CREATE OR REPLACE FUNCTION is_staff_or_above()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_role() IN ('super_admin', 'admin', 'manager', 'staff');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to log actions
CREATE OR REPLACE FUNCTION log_action(
    action_name TEXT,
    table_name TEXT DEFAULT NULL,
    record_id TEXT DEFAULT NULL,
    old_vals JSONB DEFAULT NULL,
    new_vals JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values, ip_address)
    VALUES (
        auth.uid(),
        action_name,
        table_name,
        record_id,
        old_vals,
        new_vals,
        inet_client_addr()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles" ON user_profiles
    FOR SELECT USING (is_admin_user());

CREATE POLICY "Super admins can manage all profiles" ON user_profiles
    FOR ALL USING (get_user_role() = 'super_admin');

-- Events policies (Admin and Manager access)
CREATE POLICY "Admin and Manager can manage events" ON events
    FOR ALL USING (is_manager_or_above());

CREATE POLICY "Staff can view events" ON events
    FOR SELECT USING (is_staff_or_above());

-- Event revenue/expenses policies (Admin only)
CREATE POLICY "Admin can manage event revenue" ON event_revenue
    FOR ALL USING (is_admin_user());

CREATE POLICY "Admin can manage event expenses" ON event_expenses
    FOR ALL USING (is_admin_user());

-- Artists policies (Admin and Manager access)
CREATE POLICY "Admin and Manager can manage artists" ON artists
    FOR ALL USING (is_manager_or_above());

CREATE POLICY "Staff can view artists" ON artists
    FOR SELECT USING (is_staff_or_above());

-- Marketing campaigns policies (Admin and Manager access)
CREATE POLICY "Admin and Manager can manage marketing campaigns" ON marketing_campaigns
    FOR ALL USING (is_manager_or_above());

-- Tickets policies (Staff and above can manage)
CREATE POLICY "Staff and above can manage tickets" ON tickets
    FOR ALL USING (is_staff_or_above());

-- Financial transactions policies (Admin only)
CREATE POLICY "Admin can manage financial transactions" ON financial_transactions
    FOR ALL USING (is_admin_user());

CREATE POLICY "Manager can view financial transactions" ON financial_transactions
    FOR SELECT USING (is_manager_or_above());

-- Documents policies (Staff and above)
CREATE POLICY "Staff and above can manage documents" ON documents
    FOR ALL USING (is_staff_or_above());

-- Tasks policies (Staff and above)
CREATE POLICY "Staff and above can manage tasks" ON tasks
    FOR ALL USING (is_staff_or_above());

-- Customers policies (Staff and above)
CREATE POLICY "Staff and above can manage customers" ON customers
    FOR ALL USING (is_staff_or_above());

-- Customer interactions policies (Staff and above)
CREATE POLICY "Staff and above can manage customer interactions" ON customer_interactions
    FOR ALL USING (is_staff_or_above());

-- Inventory policies (Staff and above)
CREATE POLICY "Staff and above can manage inventory categories" ON inventory_categories
    FOR ALL USING (is_staff_or_above());

CREATE POLICY "Staff and above can manage inventory items" ON inventory_items
    FOR ALL USING (is_staff_or_above());

CREATE POLICY "Staff and above can manage inventory transactions" ON inventory_transactions
    FOR ALL USING (is_staff_or_above());

-- Integrations policies (Admin only)
CREATE POLICY "Admin can manage integrations" ON integrations
    FOR ALL USING (is_admin_user());

-- Brand memory policies (Admin and Manager)
CREATE POLICY "Admin and Manager can manage brand memory" ON brand_memory
    FOR ALL USING (is_manager_or_above());

-- Reviews policies (Staff and above)
CREATE POLICY "Staff and above can manage event reviews" ON event_reviews
    FOR ALL USING (is_staff_or_above());

CREATE POLICY "Staff and above can manage feedback questions" ON feedback_questions
    FOR ALL USING (is_staff_or_above());

CREATE POLICY "Staff and above can manage feedback responses" ON feedback_responses
    FOR ALL USING (is_staff_or_above());

-- Artist contracts and payments policies (Admin only)
CREATE POLICY "Admin can manage artist contracts" ON artist_contracts
    FOR ALL USING (is_admin_user());

CREATE POLICY "Admin can manage artist payments" ON artist_payments
    FOR ALL USING (is_admin_user());

CREATE POLICY "Admin can manage royalty reports" ON royalty_reports
    FOR ALL USING (is_admin_user());

-- Analytics policies (Manager and above)
CREATE POLICY "Manager and above can manage analytics metrics" ON analytics_metrics
    FOR ALL USING (is_manager_or_above());

CREATE POLICY "Manager and above can manage custom dashboards" ON custom_dashboards
    FOR ALL USING (is_manager_or_above());

CREATE POLICY "Manager and above can manage dashboard widgets" ON dashboard_widgets
    FOR ALL USING (is_manager_or_above());

-- Loyalty program policies (Staff and above)
CREATE POLICY "Staff and above can manage loyalty tiers" ON loyalty_tiers
    FOR ALL USING (is_staff_or_above());

CREATE POLICY "Staff and above can manage customer loyalty" ON customer_loyalty
    FOR ALL USING (is_staff_or_above());

CREATE POLICY "Staff and above can manage point multipliers" ON point_multipliers
    FOR ALL USING (is_staff_or_above());

CREATE POLICY "Staff and above can manage loyalty rewards" ON loyalty_rewards
    FOR ALL USING (is_staff_or_above());

CREATE POLICY "Staff and above can manage reward redemptions" ON reward_redemptions
    FOR ALL USING (is_staff_or_above());

-- Staff management policies (Admin and Manager)
CREATE POLICY "Admin and Manager can manage staff members" ON staff_members
    FOR ALL USING (is_manager_or_above());

CREATE POLICY "Admin and Manager can manage shifts" ON shifts
    FOR ALL USING (is_manager_or_above());

CREATE POLICY "Staff can view their own shifts" ON shifts
    FOR SELECT USING (
        is_staff_or_above() AND 
        (is_manager_or_above() OR staff_id IN (
            SELECT id FROM staff_members WHERE email = (
                SELECT email FROM user_profiles WHERE id = auth.uid()
            )
        ))
    );

CREATE POLICY "Admin and Manager can manage time entries" ON time_entries
    FOR ALL USING (is_manager_or_above());

CREATE POLICY "Staff can manage their own time entries" ON time_entries
    FOR ALL USING (
        is_staff_or_above() AND 
        (is_manager_or_above() OR staff_id IN (
            SELECT id FROM staff_members WHERE email = (
                SELECT email FROM user_profiles WHERE id = auth.uid()
            )
        ))
    );

-- Equipment policies (Staff and above)
CREATE POLICY "Staff and above can manage equipment" ON equipment
    FOR ALL USING (is_staff_or_above());

CREATE POLICY "Staff and above can manage maintenance records" ON maintenance_records
    FOR ALL USING (is_staff_or_above());

CREATE POLICY "Staff and above can manage equipment reservations" ON equipment_reservations
    FOR ALL USING (is_staff_or_above());

-- Predictive models policies (Admin only)
CREATE POLICY "Admin can manage predictive models" ON predictive_models
    FOR ALL USING (is_admin_user());

CREATE POLICY "Admin can manage predictions" ON predictions
    FOR ALL USING (is_admin_user());

CREATE POLICY "Manager and above can view predictions" ON predictions
    FOR SELECT USING (is_manager_or_above());

-- Venue seasons policies (Admin and Manager)
CREATE POLICY "Admin and Manager can manage venue seasons" ON venue_seasons
    FOR ALL USING (is_manager_or_above());

-- Audit logs policies (Admin only can view)
CREATE POLICY "Admin can view audit logs" ON audit_logs
    FOR SELECT USING (is_admin_user());

-- Create trigger function for audit logging
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM log_action('INSERT', TG_TABLE_NAME, NEW.id::TEXT, NULL, to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        PERFORM log_action('UPDATE', TG_TABLE_NAME, NEW.id::TEXT, to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM log_action('DELETE', TG_TABLE_NAME, OLD.id::TEXT, to_jsonb(OLD), NULL);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit triggers to critical tables
CREATE TRIGGER audit_events_trigger
    AFTER INSERT OR UPDATE OR DELETE ON events
    FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_financial_transactions_trigger
    AFTER INSERT OR UPDATE OR DELETE ON financial_transactions
    FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_customers_trigger
    AFTER INSERT OR UPDATE OR DELETE ON customers
    FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_inventory_items_trigger
    AFTER INSERT OR UPDATE OR DELETE ON inventory_items
    FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_user_profiles_trigger
    AFTER INSERT OR UPDATE OR DELETE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION audit_trigger();

-- Create initial super admin user function
CREATE OR REPLACE FUNCTION create_initial_admin(
    admin_email TEXT,
    admin_password TEXT,
    admin_name TEXT DEFAULT 'System Administrator'
)
RETURNS UUID AS $$
DECLARE
    user_id UUID;
BEGIN
    -- This should be called once during setup
    -- In production, create this user through Supabase Auth API
    INSERT INTO user_profiles (id, email, full_name, role, department)
    VALUES (
        gen_random_uuid(),
        admin_email,
        admin_name,
        'super_admin',
        'Administration'
    ) RETURNING id INTO user_id;
    
    RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers where missing
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions for RLS functions
GRANT EXECUTE ON FUNCTION get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin_user() TO authenticated;
GRANT EXECUTE ON FUNCTION is_manager_or_above() TO authenticated;
GRANT EXECUTE ON FUNCTION is_staff_or_above() TO authenticated;
GRANT EXECUTE ON FUNCTION log_action(TEXT, TEXT, TEXT, JSONB, JSONB) TO authenticated;

-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES 
    ('documents', 'documents', false),
    ('images', 'images', false),
    ('avatars', 'avatars', false),
    ('attachments', 'attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for admin access
CREATE POLICY "Admin can upload documents" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'documents' AND 
        is_admin_user()
    );

CREATE POLICY "Admin can view documents" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'documents' AND 
        is_staff_or_above()
    );

CREATE POLICY "Admin can update documents" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'documents' AND 
        is_admin_user()
    );

CREATE POLICY "Admin can delete documents" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'documents' AND 
        is_admin_user()
    );

-- Similar policies for images
CREATE POLICY "Staff can upload images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'images' AND 
        is_staff_or_above()
    );

CREATE POLICY "Staff can view images" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'images' AND 
        is_staff_or_above()
    );

CREATE POLICY "Admin can update images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'images' AND 
        is_admin_user()
    );

CREATE POLICY "Admin can delete images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'images' AND 
        is_admin_user()
    );

-- Avatars policies
CREATE POLICY "Users can manage their avatars" ON storage.objects
    FOR ALL USING (
        bucket_id = 'avatars' AND 
        is_staff_or_above()
    );

-- Attachments policies
CREATE POLICY "Staff can manage attachments" ON storage.objects
    FOR ALL USING (
        bucket_id = 'attachments' AND 
        is_staff_or_above()
    );

COMMENT ON TABLE user_profiles IS 'User profiles with role-based access control for Train Station Dashboard';
COMMENT ON TABLE audit_logs IS 'Audit trail for all system actions and data changes';
COMMENT ON FUNCTION get_user_role() IS 'Returns the current authenticated user role';
COMMENT ON FUNCTION is_admin_user() IS 'Checks if current user has admin privileges';
COMMENT ON FUNCTION is_manager_or_above() IS 'Checks if current user has manager+ privileges';
COMMENT ON FUNCTION is_staff_or_above() IS 'Checks if current user has staff+ privileges'; 