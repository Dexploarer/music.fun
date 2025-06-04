-- Migration: Add file_metadata table for tracking uploaded files
-- Description: This table tracks metadata for all files uploaded to Supabase Storage

-- Create file_metadata table
CREATE TABLE IF NOT EXISTS file_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    path TEXT NOT NULL UNIQUE,
    bucket TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size BIGINT NOT NULL DEFAULT 0,
    mime_type TEXT NOT NULL,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Additional metadata
    description TEXT,
    tags TEXT[],
    is_public BOOLEAN DEFAULT FALSE,
    download_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    
    -- File organization
    folder_path TEXT,
    category TEXT CHECK (category IN ('image', 'document', 'video', 'audio', 'other')),
    
    -- Version control
    version INTEGER DEFAULT 1,
    parent_file_id UUID REFERENCES file_metadata(id) ON DELETE SET NULL,
    
    -- Constraints
    CONSTRAINT valid_bucket CHECK (bucket IN ('documents', 'images', 'avatars', 'attachments')),
    CONSTRAINT valid_file_size CHECK (file_size >= 0),
    CONSTRAINT valid_version CHECK (version >= 1)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_file_metadata_bucket ON file_metadata(bucket);
CREATE INDEX IF NOT EXISTS idx_file_metadata_uploaded_by ON file_metadata(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_file_metadata_uploaded_at ON file_metadata(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_file_metadata_path ON file_metadata(path);
CREATE INDEX IF NOT EXISTS idx_file_metadata_folder_path ON file_metadata(folder_path);
CREATE INDEX IF NOT EXISTS idx_file_metadata_category ON file_metadata(category);
CREATE INDEX IF NOT EXISTS idx_file_metadata_tags ON file_metadata USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_file_metadata_deleted_at ON file_metadata(deleted_at) WHERE deleted_at IS NULL;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_file_metadata_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_update_file_metadata_updated_at
    BEFORE UPDATE ON file_metadata
    FOR EACH ROW
    EXECUTE FUNCTION update_file_metadata_updated_at();

-- Create function to categorize files based on MIME type
CREATE OR REPLACE FUNCTION categorize_file(mime_type TEXT)
RETURNS TEXT AS $$
BEGIN
    CASE 
        WHEN mime_type LIKE 'image/%' THEN
            RETURN 'image';
        WHEN mime_type LIKE 'video/%' THEN
            RETURN 'video';
        WHEN mime_type LIKE 'audio/%' THEN
            RETURN 'audio';
        WHEN mime_type IN (
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            'application/rtf',
            'text/csv',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ) THEN
            RETURN 'document';
        ELSE
            RETURN 'other';
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Create function to auto-categorize files on insert/update
CREATE OR REPLACE FUNCTION auto_categorize_file()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-set category if not provided
    IF NEW.category IS NULL THEN
        NEW.category = categorize_file(NEW.mime_type);
    END IF;
    
    -- Extract folder path from file path
    IF NEW.folder_path IS NULL AND NEW.path LIKE '%/%' THEN
        NEW.folder_path = regexp_replace(NEW.path, '/[^/]+$', '');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-categorization
CREATE TRIGGER trigger_auto_categorize_file
    BEFORE INSERT OR UPDATE ON file_metadata
    FOR EACH ROW
    EXECUTE FUNCTION auto_categorize_file();

-- Enable RLS on file_metadata table
ALTER TABLE file_metadata ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for file_metadata
-- Policy: Users can view files they uploaded or that are public
CREATE POLICY "Users can view accessible files" ON file_metadata
    FOR SELECT
    USING (
        uploaded_by = auth.uid() OR
        is_public = true OR
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.user_id = auth.uid() 
            AND up.role IN ('super_admin', 'admin', 'manager')
        )
    );

-- Policy: Only authenticated users can insert files
CREATE POLICY "Users can insert their own files" ON file_metadata
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND
        (uploaded_by = auth.uid() OR uploaded_by IS NULL)
    );

-- Policy: Users can update files they uploaded, admins can update any
CREATE POLICY "Users can update their own files" ON file_metadata
    FOR UPDATE
    USING (
        uploaded_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.user_id = auth.uid() 
            AND up.role IN ('super_admin', 'admin', 'manager')
        )
    )
    WITH CHECK (
        uploaded_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.user_id = auth.uid() 
            AND up.role IN ('super_admin', 'admin', 'manager')
        )
    );

-- Policy: Users can delete files they uploaded, admins can delete any
CREATE POLICY "Users can delete their own files" ON file_metadata
    FOR DELETE
    USING (
        uploaded_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.user_id = auth.uid() 
            AND up.role IN ('super_admin', 'admin', 'manager')
        )
    );

-- Create view for file statistics
CREATE OR REPLACE VIEW file_statistics AS
SELECT 
    bucket,
    category,
    COUNT(*) as file_count,
    SUM(file_size) as total_size,
    AVG(file_size) as avg_size,
    MAX(uploaded_at) as last_upload,
    SUM(download_count) as total_downloads
FROM file_metadata 
WHERE deleted_at IS NULL
GROUP BY bucket, category;

-- Create function to get storage usage by user
CREATE OR REPLACE FUNCTION get_user_storage_usage(user_id UUID DEFAULT auth.uid())
RETURNS TABLE (
    bucket TEXT,
    file_count BIGINT,
    total_size BIGINT,
    avg_size NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        fm.bucket,
        COUNT(*)::BIGINT as file_count,
        COALESCE(SUM(fm.file_size), 0)::BIGINT as total_size,
        COALESCE(AVG(fm.file_size), 0) as avg_size
    FROM file_metadata fm
    WHERE fm.uploaded_by = user_id 
    AND fm.deleted_at IS NULL
    GROUP BY fm.bucket;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to clean up deleted files
CREATE OR REPLACE FUNCTION cleanup_deleted_files(days_old INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Permanently delete files marked as deleted older than specified days
    DELETE FROM file_metadata 
    WHERE deleted_at IS NOT NULL 
    AND deleted_at < NOW() - INTERVAL '1 day' * days_old;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to soft delete files
CREATE OR REPLACE FUNCTION soft_delete_file(file_path TEXT, file_bucket TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    affected_rows INTEGER;
BEGIN
    UPDATE file_metadata 
    SET deleted_at = NOW()
    WHERE path = file_path 
    AND bucket = file_bucket 
    AND deleted_at IS NULL;
    
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    
    RETURN affected_rows > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to restore soft deleted files
CREATE OR REPLACE FUNCTION restore_file(file_path TEXT, file_bucket TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    affected_rows INTEGER;
BEGIN
    UPDATE file_metadata 
    SET deleted_at = NULL
    WHERE path = file_path 
    AND bucket = file_bucket 
    AND deleted_at IS NOT NULL;
    
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    
    RETURN affected_rows > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit logging for file operations
CREATE TRIGGER trigger_audit_file_metadata
    AFTER INSERT OR UPDATE OR DELETE ON file_metadata
    FOR EACH ROW
    EXECUTE FUNCTION log_audit_event();

-- Create some initial data categories for better organization
INSERT INTO file_metadata (path, bucket, file_name, file_size, mime_type, uploaded_by, description, is_public, category)
VALUES 
    ('system/placeholder.png', 'images', 'placeholder.png', 1024, 'image/png', NULL, 'System placeholder image', true, 'image'),
    ('templates/default_avatar.png', 'avatars', 'default_avatar.png', 2048, 'image/png', NULL, 'Default user avatar', true, 'image'),
    ('system/sample_document.pdf', 'documents', 'sample_document.pdf', 4096, 'application/pdf', NULL, 'Sample document template', false, 'document')
ON CONFLICT (path) DO NOTHING;

-- Grant necessary permissions
GRANT SELECT ON file_statistics TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_storage_usage TO authenticated;
GRANT EXECUTE ON FUNCTION categorize_file TO authenticated;

-- Admin functions
GRANT EXECUTE ON FUNCTION cleanup_deleted_files TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_file TO authenticated;
GRANT EXECUTE ON FUNCTION restore_file TO authenticated;

-- Add helpful comments
COMMENT ON TABLE file_metadata IS 'Tracks metadata for all files uploaded to Supabase Storage buckets';
COMMENT ON COLUMN file_metadata.path IS 'Full path to the file in the storage bucket';
COMMENT ON COLUMN file_metadata.bucket IS 'Storage bucket name (documents, images, avatars, attachments)';
COMMENT ON COLUMN file_metadata.tags IS 'Array of tags for file organization and search';
COMMENT ON COLUMN file_metadata.is_public IS 'Whether the file is publicly accessible';
COMMENT ON COLUMN file_metadata.download_count IS 'Number of times the file has been downloaded';
COMMENT ON COLUMN file_metadata.version IS 'File version number for version control';
COMMENT ON COLUMN file_metadata.parent_file_id IS 'Reference to parent file for versioning';

COMMENT ON FUNCTION categorize_file IS 'Automatically categorizes files based on MIME type';
COMMENT ON FUNCTION get_user_storage_usage IS 'Returns storage usage statistics for a specific user';
COMMENT ON FUNCTION cleanup_deleted_files IS 'Permanently removes soft-deleted files older than specified days';
COMMENT ON FUNCTION soft_delete_file IS 'Marks a file as deleted without removing the record';
COMMENT ON FUNCTION restore_file IS 'Restores a soft-deleted file'; 