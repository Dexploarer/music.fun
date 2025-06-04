# Security Runbooks - TrainStation Dashboard

## 📖 Overview

This document contains operational security procedures, maintenance tasks, and monitoring guidelines for the TrainStation Dashboard. These runbooks provide step-by-step instructions for common security operations and routine maintenance.

## 🔐 Authentication & Access Management

### User Account Management

#### Creating New User Accounts
```bash
# 1. Create user via Supabase Dashboard or CLI
supabase auth users create --email user@example.com --password temp_password

# 2. Assign role via database
INSERT INTO user_roles (user_id, role) 
VALUES ((SELECT id FROM auth.users WHERE email = 'user@example.com'), 'staff');

# 3. Send welcome email with password reset link
# (Automated via Supabase Auth)
```

#### Disabling Compromised Accounts
```bash
# 1. Immediately disable user account
UPDATE auth.users 
SET banned_until = NOW() + INTERVAL '90 days'
WHERE email = 'compromised@example.com';

# 2. Revoke all active sessions
DELETE FROM auth.refresh_tokens 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'compromised@example.com');

# 3. Log security event
INSERT INTO security_events (user_id, event_type, description, created_at)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'compromised@example.com'),
  'account_disabled',
  'Account disabled due to security incident',
  NOW()
);

# 4. Notify security team
```

#### Password Reset Process
```bash
# 1. Verify user identity (out-of-band)
# 2. Generate secure reset token
supabase auth users reset-password --email user@example.com

# 3. Monitor for successful reset
SELECT * FROM auth.audit_log_entries 
WHERE event_type = 'password_reset' 
AND created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

### Role-Based Access Control (RBAC)

#### Updating User Roles
```sql
-- Check current roles
SELECT u.email, ur.role, ur.created_at
FROM auth.users u
JOIN user_roles ur ON u.id = ur.user_id
WHERE u.email = 'user@example.com';

-- Update role
UPDATE user_roles 
SET role = 'manager', updated_at = NOW()
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user@example.com');

-- Audit role change
INSERT INTO security_events (user_id, event_type, description, metadata)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'user@example.com'),
  'role_changed',
  'User role updated from staff to manager',
  jsonb_build_object('old_role', 'staff', 'new_role', 'manager')
);
```

#### Access Review Process
```sql
-- Monthly access review query
SELECT 
  u.email,
  ur.role,
  u.last_sign_in_at,
  CASE 
    WHEN u.last_sign_in_at < NOW() - INTERVAL '90 days' THEN 'INACTIVE'
    WHEN u.last_sign_in_at < NOW() - INTERVAL '30 days' THEN 'STALE'
    ELSE 'ACTIVE'
  END as status
FROM auth.users u
JOIN user_roles ur ON u.id = ur.user_id
ORDER BY u.last_sign_in_at DESC;

-- Disable inactive accounts
UPDATE auth.users 
SET banned_until = NOW() + INTERVAL '1 year'
WHERE last_sign_in_at < NOW() - INTERVAL '180 days'
AND banned_until IS NULL;
```

## 🛡️ Security Monitoring

### Daily Security Checks

#### Authentication Monitoring
```sql
-- Check failed login attempts (last 24 hours)
SELECT 
  ip_address,
  COUNT(*) as attempts,
  MIN(created_at) as first_attempt,
  MAX(created_at) as last_attempt
FROM auth.audit_log_entries
WHERE event_type = 'login_failed'
AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY ip_address
HAVING COUNT(*) > 5
ORDER BY attempts DESC;

-- Check successful logins from new locations
SELECT 
  u.email,
  ale.ip_address,
  ale.created_at,
  ale.metadata->>'user_agent' as user_agent
FROM auth.audit_log_entries ale
JOIN auth.users u ON ale.user_id = u.id
WHERE ale.event_type = 'login_success'
AND ale.created_at > NOW() - INTERVAL '24 hours'
AND ale.ip_address NOT IN (
  SELECT DISTINCT ip_address 
  FROM auth.audit_log_entries 
  WHERE user_id = ale.user_id 
  AND created_at < NOW() - INTERVAL '24 hours'
  AND event_type = 'login_success'
)
ORDER BY ale.created_at DESC;
```

#### Database Activity Monitoring
```sql
-- Check for unusual data access patterns
SELECT 
  table_name,
  operation,
  COUNT(*) as operation_count,
  COUNT(DISTINCT user_id) as unique_users
FROM audit_log
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY table_name, operation
HAVING COUNT(*) > 100
ORDER BY operation_count DESC;

-- Monitor privileged operations
SELECT 
  u.email,
  al.table_name,
  al.operation,
  al.created_at,
  al.changes
FROM audit_log al
JOIN auth.users u ON al.user_id = u.id
WHERE al.created_at > NOW() - INTERVAL '24 hours'
AND al.table_name IN ('users', 'user_roles', 'venues', 'events')
AND al.operation IN ('DELETE', 'UPDATE')
ORDER BY al.created_at DESC;
```

### Weekly Security Reviews

#### Security Event Summary
```bash
#!/bin/bash
# Weekly security summary script

echo "=== Weekly Security Summary ==="
echo "Period: $(date -d '7 days ago' '+%Y-%m-%d') to $(date '+%Y-%m-%d')"
echo ""

# Authentication statistics
psql $DATABASE_URL -c "
SELECT 
  'Total Logins' as metric,
  COUNT(*) as value
FROM auth.audit_log_entries 
WHERE event_type = 'login_success' 
AND created_at > NOW() - INTERVAL '7 days'
UNION ALL
SELECT 
  'Failed Logins' as metric,
  COUNT(*) as value
FROM auth.audit_log_entries 
WHERE event_type = 'login_failed' 
AND created_at > NOW() - INTERVAL '7 days'
UNION ALL
SELECT 
  'New Users' as metric,
  COUNT(*) as value
FROM auth.users 
WHERE created_at > NOW() - INTERVAL '7 days';
"

# Security incidents
psql $DATABASE_URL -c "
SELECT 
  event_type,
  COUNT(*) as count
FROM security_events 
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY event_type
ORDER BY count DESC;
"
```

### Monthly Security Assessments

#### Vulnerability Assessment
```bash
#!/bin/bash
# Monthly vulnerability check

echo "=== Monthly Vulnerability Assessment ==="

# Check for outdated dependencies
npm audit --audit-level moderate

# Check Supabase security status
supabase status

# Database security check
psql $DATABASE_URL -c "
-- Check for users without MFA
SELECT 
  u.email,
  u.created_at,
  CASE 
    WHEN u.phone IS NOT NULL THEN 'SMS_ENABLED'
    ELSE 'NO_MFA'
  END as mfa_status
FROM auth.users u
WHERE u.phone IS NULL
ORDER BY u.created_at DESC;

-- Check for overprivileged accounts
SELECT 
  u.email,
  ur.role,
  u.last_sign_in_at
FROM auth.users u
JOIN user_roles ur ON u.id = ur.user_id
WHERE ur.role IN ('admin', 'manager')
ORDER BY u.last_sign_in_at DESC;
"
```

## 🔧 Maintenance Procedures

### Certificate Management

#### SSL Certificate Renewal
```bash
# Check certificate expiration
echo | openssl s_client -servername yourdomain.com -connect yourdomain.com:443 2>/dev/null | openssl x509 -noout -dates

# Automated renewal (if using Let's Encrypt)
certbot renew --dry-run

# Verify certificate installation
curl -I https://yourdomain.com
```

### Database Maintenance

#### Security Policy Updates
```sql
-- Review and update RLS policies quarterly
-- Example: Update artist access policy
DROP POLICY IF EXISTS "Users can view artists based on role" ON artists;

CREATE POLICY "Users can view artists based on role" 
ON artists FOR SELECT 
USING (
  -- Admin and managers can see all
  auth.role() IN ('admin', 'manager') OR 
  -- Staff can see confirmed artists only
  (auth.role() = 'staff' AND status = 'Confirmed') OR
  -- Artists can see their own records
  (auth.role() = 'artist' AND user_id = auth.uid())
);

-- Test policy
SET SESSION ROLE 'staff_role';
SELECT COUNT(*) FROM artists; -- Should only return confirmed artists
RESET ROLE;
```

#### Audit Log Maintenance
```sql
-- Archive old audit logs (keep 1 year)
CREATE TABLE IF NOT EXISTS audit_log_archive AS 
SELECT * FROM audit_log WHERE 1=0;

-- Move old records to archive
INSERT INTO audit_log_archive 
SELECT * FROM audit_log 
WHERE created_at < NOW() - INTERVAL '1 year';

-- Delete archived records from main table
DELETE FROM audit_log 
WHERE created_at < NOW() - INTERVAL '1 year';

-- Update statistics
ANALYZE audit_log;
ANALYZE audit_log_archive;
```

### Security Configuration Backup

#### Export Security Configurations
```bash
#!/bin/bash
# Backup security configurations

BACKUP_DIR="/secure/backups/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR

# Export RLS policies
pg_dump $DATABASE_URL --schema-only --table="*" | grep -A 20 "CREATE POLICY" > $BACKUP_DIR/rls_policies.sql

# Export user roles
psql $DATABASE_URL -c "\COPY (SELECT * FROM user_roles) TO '$BACKUP_DIR/user_roles.csv' CSV HEADER"

# Export security events (last 90 days)
psql $DATABASE_URL -c "\COPY (SELECT * FROM security_events WHERE created_at > NOW() - INTERVAL '90 days') TO '$BACKUP_DIR/security_events.csv' CSV HEADER"

# Encrypt backup
tar -czf $BACKUP_DIR.tar.gz $BACKUP_DIR
gpg --cipher-algo AES256 --compress-algo 1 --symmetric $BACKUP_DIR.tar.gz
rm -rf $BACKUP_DIR $BACKUP_DIR.tar.gz
```

## 🚨 Emergency Procedures

### Security Incident Response

#### Immediate Response Checklist
```bash
#!/bin/bash
# Emergency security response script

echo "=== SECURITY INCIDENT RESPONSE ==="
echo "Incident ID: INC-$(date +%Y%m%d-%H%M%S)"
echo "Start Time: $(date)"

# 1. Preserve evidence
echo "Creating system snapshot..."
pg_dump $DATABASE_URL > /secure/evidence/db_snapshot_$(date +%Y%m%d_%H%M%S).sql

# 2. Check active sessions
echo "Active user sessions:"
psql $DATABASE_URL -c "
SELECT 
  u.email,
  rt.created_at as session_start,
  rt.updated_at as last_activity
FROM auth.refresh_tokens rt
JOIN auth.users u ON rt.user_id = u.id
WHERE rt.revoked = false
ORDER BY rt.updated_at DESC;
"

# 3. Recent critical operations
echo "Recent critical operations:"
psql $DATABASE_URL -c "
SELECT 
  u.email,
  al.table_name,
  al.operation,
  al.created_at
FROM audit_log al
JOIN auth.users u ON al.user_id = u.id
WHERE al.created_at > NOW() - INTERVAL '2 hours'
AND al.table_name IN ('users', 'user_roles', 'venues', 'events')
ORDER BY al.created_at DESC
LIMIT 50;
"
```

#### System Isolation
```bash
#!/bin/bash
# Emergency system isolation

echo "=== EMERGENCY SYSTEM ISOLATION ==="

# 1. Disable all non-admin users
psql $DATABASE_URL -c "
UPDATE auth.users 
SET banned_until = NOW() + INTERVAL '24 hours'
WHERE id NOT IN (
  SELECT user_id FROM user_roles WHERE role = 'admin'
);
"

# 2. Revoke all active sessions except current
psql $DATABASE_URL -c "
UPDATE auth.refresh_tokens 
SET revoked = true, updated_at = NOW()
WHERE revoked = false;
"

# 3. Enable enhanced logging
psql $DATABASE_URL -c "
UPDATE security_config 
SET enhanced_logging = true, 
    log_all_queries = true,
    updated_at = NOW();
"

echo "System isolated. Only admin users can access."
echo "All active sessions terminated."
echo "Enhanced logging enabled."
```

### Data Breach Response

#### Data Exposure Assessment
```sql
-- Assess potential data exposure
WITH exposed_data AS (
  SELECT 
    table_name,
    operation,
    user_id,
    created_at,
    changes
  FROM audit_log
  WHERE created_at BETWEEN $INCIDENT_START AND $INCIDENT_END
  AND operation IN ('SELECT', 'UPDATE', 'DELETE')
)
SELECT 
  table_name,
  COUNT(*) as operations,
  COUNT(DISTINCT user_id) as affected_users,
  MIN(created_at) as first_access,
  MAX(created_at) as last_access
FROM exposed_data
GROUP BY table_name
ORDER BY operations DESC;

-- Identify affected user accounts
SELECT DISTINCT
  u.email,
  u.created_at as account_created,
  u.last_sign_in_at,
  ur.role
FROM auth.users u
JOIN user_roles ur ON u.id = ur.user_id
WHERE u.id IN (
  SELECT DISTINCT user_id 
  FROM audit_log 
  WHERE created_at BETWEEN $INCIDENT_START AND $INCIDENT_END
)
ORDER BY u.last_sign_in_at DESC;
```

## 📊 Security Metrics & Reporting

### Daily Metrics Collection
```bash
#!/bin/bash
# Daily security metrics

METRICS_DIR="/secure/metrics/$(date +%Y%m%d)"
mkdir -p $METRICS_DIR

# Authentication metrics
psql $DATABASE_URL -c "
SELECT 
  DATE(created_at) as date,
  event_type,
  COUNT(*) as count
FROM auth.audit_log_entries
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY DATE(created_at), event_type
ORDER BY date DESC, count DESC;
" > $METRICS_DIR/auth_metrics.csv

# Security events
psql $DATABASE_URL -c "
SELECT 
  DATE(created_at) as date,
  event_type,
  severity,
  COUNT(*) as count
FROM security_events
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY DATE(created_at), event_type, severity
ORDER BY date DESC, count DESC;
" > $METRICS_DIR/security_events.csv

# Generate summary report
python3 /secure/scripts/generate_daily_report.py $METRICS_DIR
```

### Weekly Trend Analysis
```sql
-- Weekly security trends
WITH weekly_stats AS (
  SELECT 
    DATE_TRUNC('week', created_at) as week,
    event_type,
    COUNT(*) as count
  FROM auth.audit_log_entries
  WHERE created_at > NOW() - INTERVAL '12 weeks'
  GROUP BY DATE_TRUNC('week', created_at), event_type
)
SELECT 
  week,
  SUM(CASE WHEN event_type = 'login_success' THEN count ELSE 0 END) as successful_logins,
  SUM(CASE WHEN event_type = 'login_failed' THEN count ELSE 0 END) as failed_logins,
  SUM(CASE WHEN event_type = 'password_reset' THEN count ELSE 0 END) as password_resets,
  ROUND(
    SUM(CASE WHEN event_type = 'login_failed' THEN count ELSE 0 END)::numeric / 
    NULLIF(SUM(CASE WHEN event_type = 'login_success' THEN count ELSE 0 END), 0) * 100, 
    2
  ) as failure_rate_percent
FROM weekly_stats
GROUP BY week
ORDER BY week DESC;
```

## 🔄 Automation Scripts

### Automated Security Checks
```bash
#!/bin/bash
# Automated hourly security checks

LOG_FILE="/var/log/security/automated_checks.log"

check_failed_logins() {
  FAILED_COUNT=$(psql $DATABASE_URL -t -c "
    SELECT COUNT(*) 
    FROM auth.audit_log_entries 
    WHERE event_type = 'login_failed' 
    AND created_at > NOW() - INTERVAL '1 hour'
  ")
  
  if [ $FAILED_COUNT -gt 50 ]; then
    echo "$(date): HIGH ALERT - $FAILED_COUNT failed logins in last hour" >> $LOG_FILE
    # Send alert to security team
    curl -X POST $SLACK_WEBHOOK -d "{\"text\":\"Security Alert: $FAILED_COUNT failed logins detected\"}"
  fi
}

check_suspicious_activity() {
  # Check for unusual data access patterns
  UNUSUAL_ACCESS=$(psql $DATABASE_URL -t -c "
    SELECT COUNT(*) 
    FROM audit_log 
    WHERE created_at > NOW() - INTERVAL '1 hour'
    AND operation = 'SELECT'
    GROUP BY user_id, table_name
    HAVING COUNT(*) > 100
  ")
  
  if [ ! -z "$UNUSUAL_ACCESS" ]; then
    echo "$(date): Suspicious data access patterns detected" >> $LOG_FILE
  fi
}

# Run checks
check_failed_logins
check_suspicious_activity

echo "$(date): Automated security checks completed" >> $LOG_FILE
```

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Next Review**: April 2025  
**Classification**: Internal Use Only  
**Owner**: Security Operations Team 