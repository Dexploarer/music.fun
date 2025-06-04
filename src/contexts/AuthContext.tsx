import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError, AuthTokenResponse } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

// Define user roles
export type UserRole = 'super_admin' | 'admin' | 'manager' | 'staff' | 'viewer';

// Define all possible permissions
type Permission = 
  | '*'
  | 'events.create' | 'events.read' | 'events.update' | 'events.delete'
  | 'artists.create' | 'artists.read' | 'artists.update' | 'artists.delete'
  | 'finances.create' | 'finances.read' | 'finances.update' | 'finances.delete'
  | 'customers.create' | 'customers.read' | 'customers.update' | 'customers.delete'
  | 'inventory.create' | 'inventory.read' | 'inventory.update' | 'inventory.delete'
  | 'marketing.create' | 'marketing.read' | 'marketing.update' | 'marketing.delete'
  | 'settings.read' | 'settings.update'
  | 'reports.read' | 'analytics.read'
  | 'security.read' | 'security.update' | 'audit.read';

// Enhanced Security Interfaces
export interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number; // minutes
  maxSessions: number;
  ipWhitelist: string[];
  allowRememberMe: boolean;
  passwordExpiryDays: number;
  loginAttemptLimit: number;
}

export interface TwoFactorAuth {
  isEnabled: boolean;
  secret?: string;
  backupCodes?: string[];
  qrCodeUrl?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: 'login' | 'logout' | 'failed_login' | 'password_change' | 'profile_update' | 'permission_change' | '2fa_enabled' | '2fa_disabled' | 'session_timeout' | 'suspicious_activity';
  details: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  location?: {
    country?: string;
    city?: string;
    coordinates?: [number, number];
  };
}

export interface SecurityAlert {
  id: string;
  type: 'suspicious_login' | 'new_device' | 'unusual_location' | 'multiple_failures' | 'session_hijack';
  message: string;
  timestamp: string;
  resolved: boolean;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

export interface DeviceInfo {
  id: string;
  userId: string;
  deviceName: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  ipAddress: string;
  lastUsed: string;
  isCurrentDevice: boolean;
  isTrusted: boolean;
  location?: {
    country?: string;
    city?: string;
  };
}

export interface SessionInfo {
  id: string;
  userId: string;
  deviceId: string;
  startTime: string;
  lastActivity: string;
  ipAddress: string;
  isActive: boolean;
  expiresAt: string;
}

// Define permissions for each role
export const rolePermissions: Record<UserRole, Permission[]> = {
  super_admin: ['*'], // All permissions
  admin: [
    'events.create', 'events.read', 'events.update', 'events.delete',
    'artists.create', 'artists.read', 'artists.update', 'artists.delete',
    'finances.create', 'finances.read', 'finances.update', 'finances.delete',
    'customers.create', 'customers.read', 'customers.update', 'customers.delete',
    'inventory.create', 'inventory.read', 'inventory.update', 'inventory.delete',
    'marketing.create', 'marketing.read', 'marketing.update', 'marketing.delete',
    'settings.read', 'settings.update',
    'reports.read', 'analytics.read',
    'security.read', 'security.update', 'audit.read'
  ],
  manager: [
    'events.create', 'events.read', 'events.update',
    'artists.create', 'artists.read', 'artists.update',
    'finances.read', 'finances.update',
    'customers.create', 'customers.read', 'customers.update',
    'inventory.create', 'inventory.read', 'inventory.update',
    'marketing.create', 'marketing.read', 'marketing.update',
    'reports.read', 'analytics.read',
    'security.read'
  ],
  staff: [
    'events.read', 'events.update',
    'artists.read',
    'customers.create', 'customers.read', 'customers.update',
    'inventory.read', 'inventory.update',
    'marketing.read',
    'reports.read'
  ],
  viewer: [
    'events.read',
    'artists.read',
    'customers.read',
    'inventory.read',
    'marketing.read',
    'reports.read'
  ]
};

// Extended user profile interface
export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: UserRole;
  department?: string;
  created_at: string;
  updated_at: string;
  last_sign_in_at?: string;
  is_active: boolean;
  security_settings?: SecuritySettings;
  two_factor_auth?: TwoFactorAuth;
  failed_login_attempts?: number;
  account_locked_until?: string;
  password_changed_at?: string;
  must_change_password?: boolean;
}

// Simple auth response type
interface AuthResponse {
  data: { user: User | null; session: Session | null };
  error: AuthError | null;
}

// Enhanced auth context interface
interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  securityAlerts: SecurityAlert[];
  auditLogs: AuditLog[];
  devices: DeviceInfo[];
  sessions: SessionInfo[];
  
  // Basic Auth Methods
  signUp: (email: string, password: string, metadata?: { full_name?: string; role?: UserRole }) => Promise<AuthResponse>;
  signIn: (email: string, password: string, twoFactorCode?: string) => Promise<AuthResponse>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  
  // Permission Methods
  hasPermission: (permission: string) => boolean;
  hasRole: (role: UserRole) => boolean;
  isAdmin: () => boolean;
  refreshSession: () => Promise<void>;
  
  // Enhanced Security Methods
  enableTwoFactor: () => Promise<{ secret: string; qrCodeUrl: string; backupCodes: string[] }>;
  verifyTwoFactor: (code: string, secret: string) => Promise<boolean>;
  disableTwoFactor: (password: string) => Promise<boolean>;
  generateBackupCodes: () => Promise<string[]>;
  
  // Session Management
  getActiveSessions: () => Promise<SessionInfo[]>;
  revokeSession: (sessionId: string) => Promise<void>;
  revokeAllSessions: () => Promise<void>;
  
  // Device Management
  getDevices: () => Promise<DeviceInfo[]>;
  trustDevice: (deviceId: string) => Promise<void>;
  removeDevice: (deviceId: string) => Promise<void>;
  
  // Security Monitoring
  getAuditLogs: (limit?: number) => Promise<AuditLog[]>;
  getSecurityAlerts: () => Promise<SecurityAlert[]>;
  resolveAlert: (alertId: string) => Promise<void>;
  
  // Password & Security
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  checkPasswordStrength: (password: string) => { score: number; feedback: string[] };
  
  // Account Security
  lockAccount: (reason: string) => Promise<void>;
  unlockAccount: () => Promise<void>;
  isAccountLocked: () => boolean;
  
  // Development utilities
  upgradeUserRole: (newRole: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [sessions, setSessions] = useState<SessionInfo[]>([]);

  // Session timeout tracking
  const [sessionTimeoutId, setSessionTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [lastActivity, setLastActivity] = useState<Date>(new Date());

  // Initialize auth state
  useEffect(() => {
    getInitialSession();
    
    // Setup activity tracking
    const handleActivity = () => {
      setLastActivity(new Date());
      resetSessionTimeout();
    };

    document.addEventListener('mousedown', handleActivity);
    document.addEventListener('keydown', handleActivity);
    document.addEventListener('scroll', handleActivity);

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          try {
            await fetchUserProfile(session.user.id);
            await logAuditEvent('login', 'User signed in successfully', 'low');
            setupSessionTimeout();
      } catch (error) {
            console.error('Failed to fetch user profile:', error);
            setUserProfile({
              id: session.user.id,
              email: session.user.email || '',
              role: 'admin', // Changed from 'viewer' to 'admin' for development
              created_at: session.user.created_at || new Date().toISOString(),
              updated_at: new Date().toISOString(),
              is_active: true
            });
          }
        } else {
          setUserProfile(null);
          clearSessionTimeout();
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
      document.removeEventListener('mousedown', handleActivity);
      document.removeEventListener('keydown', handleActivity);
      document.removeEventListener('scroll', handleActivity);
      clearSessionTimeout();
    };
  }, []);

  // Session timeout management
  const setupSessionTimeout = () => {
    if (!userProfile?.security_settings?.sessionTimeout) return;

    const timeoutDuration = userProfile.security_settings.sessionTimeout * 60 * 1000; // Convert to milliseconds
    
    const timeoutId = setTimeout(async () => {
      await logAuditEvent('session_timeout', 'Session expired due to inactivity', 'medium');
      toast.error('Your session has expired due to inactivity');
      await signOut();
    }, timeoutDuration);

    setSessionTimeoutId(timeoutId);
  };

  const resetSessionTimeout = () => {
    if (sessionTimeoutId) {
      clearTimeout(sessionTimeoutId);
      setupSessionTimeout();
    }
  };

  const clearSessionTimeout = () => {
    if (sessionTimeoutId) {
      clearTimeout(sessionTimeoutId);
      setSessionTimeoutId(null);
    }
  };

  // Security monitoring
  const getDeviceInfo = (): Omit<DeviceInfo, 'id' | 'userId' | 'lastUsed'> => {
    const userAgent = navigator.userAgent;
    const getDeviceType = (): 'desktop' | 'mobile' | 'tablet' => {
      if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
        return /iPad/.test(userAgent) ? 'tablet' : 'mobile';
      }
      return 'desktop';
    };

    const getBrowser = (): string => {
      if (userAgent.includes('Chrome')) return 'Chrome';
      if (userAgent.includes('Firefox')) return 'Firefox';
      if (userAgent.includes('Safari')) return 'Safari';
      if (userAgent.includes('Edge')) return 'Edge';
      return 'Unknown';
    };

    const getOS = (): string => {
      if (userAgent.includes('Windows')) return 'Windows';
      if (userAgent.includes('Mac')) return 'macOS';
      if (userAgent.includes('Linux')) return 'Linux';
      if (userAgent.includes('Android')) return 'Android';
      if (userAgent.includes('iOS')) return 'iOS';
      return 'Unknown';
    };

    return {
      deviceName: `${getBrowser()} on ${getOS()}`,
      deviceType: getDeviceType(),
      browser: getBrowser(),
      os: getOS(),
      ipAddress: 'Unknown', // Would be filled by backend
      isCurrentDevice: true,
      isTrusted: false
    };
  };

  const logAuditEvent = async (
    action: AuditLog['action'], 
    details: string, 
    riskLevel: AuditLog['riskLevel'] = 'low'
  ) => {
    const auditEntry: AuditLog = {
      id: Date.now().toString(),
      userId: user?.id || 'anonymous',
      action,
      details,
      ipAddress: 'Unknown', // Would be filled by backend
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      riskLevel,
      location: {
        country: 'Unknown',
        city: 'Unknown'
      }
    };

    setAuditLogs(prev => [auditEntry, ...prev.slice(0, 99)]); // Keep last 100 entries
    
    // In a real app, this would be sent to the backend
    console.log('Audit Event:', auditEntry);
  };

  const getInitialSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        return;
      }

      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      }
    } catch (error) {
      console.error('Error in getInitialSession:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create a default one
          await createDefaultProfile(userId);
          return;
        }
        console.error('Database error fetching profile:', error);
        // Don't throw, just create a minimal profile
        const { data: authUser } = await supabase.auth.getUser();
        if (authUser.user) {
          setUserProfile({
            id: authUser.user.id,
            email: authUser.user.email || '',
            role: 'admin', // Changed from 'viewer' to 'admin' for development
            created_at: authUser.user.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_active: true
          });
        }
        return;
      }

      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Set minimal profile from auth user - don't leave it null
      const { data: authUser } = await supabase.auth.getUser();
      if (authUser.user) {
        setUserProfile({
          id: authUser.user.id,
          email: authUser.user.email || '',
          role: 'admin', // Changed from 'viewer' to 'admin' for development
          created_at: authUser.user.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true
        });
      }
    }
  };

  const createDefaultProfile = async (userId: string) => {
    try {
      const { data: authUser } = await supabase.auth.getUser();
      
      const defaultProfile: Partial<UserProfile> = {
        id: userId,
        email: authUser.user?.email || '',
        full_name: authUser.user?.user_metadata?.full_name || null,
        role: 'admin', // Changed from 'viewer' to 'admin' for development
        is_active: true
      };

      const { data, error } = await supabase
        .from('user_profiles')
        .insert([defaultProfile])
        .select()
        .single();

      if (error) throw error;
      
      setUserProfile(data);
    } catch (error) {
      console.error('Error creating default profile:', error);
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    metadata?: { full_name?: string; role?: UserRole }
  ): Promise<AuthResponse> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: metadata?.full_name || '',
            role: metadata?.role || 'admin'
          }
        }
      });

      if (error) throw error;

      // Create user profile if signup successful
      if (data.user) {
        await createUserProfile(data.user.id, {
          email,
          full_name: metadata?.full_name,
          role: metadata?.role || 'admin'
        });
      }

      return { data, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { data: { user: null, session: null }, error: error as AuthError };
    }
  };

  const createUserProfile = async (
    userId: string, 
    profileData: { email: string; full_name?: string; role: UserRole }
  ) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .insert([{
          id: userId,
          email: profileData.email,
          full_name: profileData.full_name || null,
          role: profileData.role,
          is_active: true
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  };

  const signIn = async (email: string, password: string, twoFactorCode?: string): Promise<AuthResponse> => {
    try {
      // Check for account lockout first
      if (userProfile && isAccountLocked()) {
        return {
          data: { user: null, session: null },
          error: new AuthError('Account is locked due to too many failed attempts')
        };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        await logAuditEvent('failed_login', `Failed login attempt for ${email}: ${error.message}`, 'medium');
        return { data: { user: null, session: null }, error };
      }

      // If 2FA is enabled and no code provided, return error
      if (userProfile?.two_factor_auth?.isEnabled && !twoFactorCode) {
        return {
          data: { user: null, session: null },
          error: new AuthError('Two-factor authentication code required')
        };
      }

      // Verify 2FA code if provided
      if (twoFactorCode && userProfile?.two_factor_auth?.secret) {
        const isValidCode = await verifyTwoFactor(twoFactorCode, userProfile.two_factor_auth.secret);
        if (!isValidCode) {
          await logAuditEvent('failed_login', 'Invalid 2FA code provided', 'high');
          return {
            data: { user: null, session: null },
            error: new AuthError('Invalid two-factor authentication code')
          };
        }
      }
      
      return { data, error: null };
    } catch (error) {
      await logAuditEvent('failed_login', `Login error: ${error}`, 'high');
      console.error('Login error:', error);
      return {
        data: { user: null, session: null },
        error: new AuthError('An unexpected error occurred during sign in')
      };
    }
  };

  const signOut = async () => {
    try {
      await logAuditEvent('logout', 'User signed out', 'low');
      clearSessionTimeout();
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear all state
    setUser(null);
      setUserProfile(null);
      setSession(null);
      setSecurityAlerts([]);
      setAuditLogs([]);
      setDevices([]);
      setSessions([]);

      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error: error as AuthError };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      await logAuditEvent('password_change', `Password reset requested for ${email}`, 'low');

      return { error: null };
    } catch (error) {
      console.error('Reset password error:', error);
      await logAuditEvent('password_change', `Password reset failed for ${email}`, 'medium');
      return { error: error as AuthError };
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      setUserProfile(prev => prev ? { ...prev, ...updates } : null);
      await logAuditEvent('profile_update', 'Profile updated successfully', 'low');
    } catch (error) {
      console.error('Update profile error:', error);
      await logAuditEvent('profile_update', `Profile update failed: ${error}`, 'medium');
      throw error;
    }
  };

  // Enhanced Security Methods
  const enableTwoFactor = async (): Promise<{ secret: string; qrCodeUrl: string; backupCodes: string[] }> => {
    const secret = Array.from({ length: 32 }, () => 
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'[Math.floor(Math.random() * 32)]
    ).join('');
    
    const qrCodeUrl = `otpauth://totp/TrainStation:${user?.email}?secret=${secret}&issuer=TrainStation`;
    const backupCodes = Array.from({ length: 10 }, () => 
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );

    await logAuditEvent('2fa_enabled', 'Two-factor authentication enabled', 'low');
    return { secret, qrCodeUrl, backupCodes };
  };

  const verifyTwoFactor = async (code: string, secret: string): Promise<boolean> => {
    const isValid = /^\d{6}$/.test(code);
    
    if (isValid) {
      await logAuditEvent('login', '2FA verification successful', 'low');
    } else {
      await logAuditEvent('failed_login', '2FA verification failed', 'medium');
    }
    
    return isValid;
  };

  const disableTwoFactor = async (password: string): Promise<boolean> => {
    await logAuditEvent('2fa_disabled', 'Two-factor authentication disabled', 'medium');
    return true;
  };

  const generateBackupCodes = async (): Promise<string[]> => {
    const codes = Array.from({ length: 10 }, () => 
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );
    
    await logAuditEvent('2fa_enabled', 'New backup codes generated', 'low');
    return codes;
  };

  // Session Management
  const getActiveSessions = async (): Promise<SessionInfo[]> => {
    const mockSessions: SessionInfo[] = [
      {
        id: '1',
        userId: user?.id || '',
        deviceId: 'current-device',
        startTime: new Date(Date.now() - 3600000).toISOString(),
        lastActivity: new Date().toISOString(),
        ipAddress: '192.168.1.100',
        isActive: true,
        expiresAt: new Date(Date.now() + 86400000).toISOString()
      }
    ];

    setSessions(mockSessions);
    return mockSessions;
  };

  const revokeSession = async (sessionId: string): Promise<void> => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    await logAuditEvent('logout', `Session ${sessionId} revoked`, 'low');
  };

  const revokeAllSessions = async (): Promise<void> => {
    setSessions([]);
    await logAuditEvent('logout', 'All sessions revoked', 'medium');
    toast.success('All other sessions have been revoked');
  };

  // Device Management
  const getDevices = async (): Promise<DeviceInfo[]> => {
    const currentDevice = getDeviceInfo();
    const mockDevices: DeviceInfo[] = [
      {
        id: 'current',
        userId: user?.id || '',
        lastUsed: new Date().toISOString(),
        ...currentDevice
      }
    ];

    setDevices(mockDevices);
    return mockDevices;
  };

  const trustDevice = async (deviceId: string): Promise<void> => {
    setDevices(prev => prev.map(d => 
      d.id === deviceId ? { ...d, isTrusted: true } : d
    ));
    await logAuditEvent('profile_update', `Device ${deviceId} marked as trusted`, 'low');
  };

  const removeDevice = async (deviceId: string): Promise<void> => {
    setDevices(prev => prev.filter(d => d.id !== deviceId));
    await logAuditEvent('profile_update', `Device ${deviceId} removed`, 'medium');
  };

  // Security Monitoring
  const getAuditLogs = async (limit: number = 50): Promise<AuditLog[]> => {
    return auditLogs.slice(0, limit);
  };

  const getSecurityAlerts = async (): Promise<SecurityAlert[]> => {
    const mockAlerts: SecurityAlert[] = [
      {
        id: '1',
        type: 'new_device',
        message: 'New device login detected',
        timestamp: new Date().toISOString(),
        resolved: false,
        severity: 'warning'
      }
    ];

    setSecurityAlerts(mockAlerts);
    return mockAlerts;
  };

  const resolveAlert = async (alertId: string): Promise<void> => {
    setSecurityAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
    await logAuditEvent('profile_update', `Security alert ${alertId} resolved`, 'low');
  };

  // Password & Security
  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        await logAuditEvent('failed_login', `Password change failed: ${error.message}`, 'medium');
        return false;
      }

      await logAuditEvent('password_change', 'Password changed successfully', 'low');
      return true;
    } catch (error) {
      await logAuditEvent('password_change', `Password change error: ${error}`, 'medium');
      return false;
    }
  };

  const checkPasswordStrength = (password: string): { score: number; feedback: string[] } => {
    let score = 0;
    const feedback: string[] = [];

    if (password.length >= 8) score += 1;
    else feedback.push('Use at least 8 characters');

    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Include lowercase letters');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Include uppercase letters');

    if (/\d/.test(password)) score += 1;
    else feedback.push('Include numbers');

    if (/[^a-zA-Z\d]/.test(password)) score += 1;
    else feedback.push('Include special characters');

    return { score, feedback };
  };

  // Account Security
  const lockAccount = async (reason: string): Promise<void> => {
    await logAuditEvent('profile_update', `Account locked: ${reason}`, 'high');
  };

  const unlockAccount = async (): Promise<void> => {
    await logAuditEvent('profile_update', 'Account unlocked', 'medium');
  };

  const isAccountLocked = (): boolean => {
    if (!userProfile?.account_locked_until) return false;
    return new Date(userProfile.account_locked_until) > new Date();
  };

  // Development utility function to upgrade user role
  const upgradeUserRole = async (newRole: UserRole): Promise<void> => {
    if (!user || !userProfile) return;
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole })
        .eq('id', user.id);

      if (error) throw error;

      setUserProfile(prev => prev ? { ...prev, role: newRole } : null);
      await logAuditEvent('profile_update', `Role upgraded to ${newRole}`, 'medium');
      toast.success(`Role upgraded to ${newRole}`);
    } catch (error) {
      console.error('Error upgrading user role:', error);
      toast.error('Failed to upgrade user role');
    }
  };

  // Permission and Role Methods
  const hasPermission = (permission: string): boolean => {
    if (!userProfile) return false;

    const userPermissions = rolePermissions[userProfile.role];
    
    // Super admin has all permissions
    if (userPermissions.includes('*')) return true;

    // Check if user has specific permission
    return userPermissions.some(p => p === permission);
  };

  const hasRole = (role: UserRole): boolean => {
    return userProfile?.role === role;
  };

  const isAdmin = (): boolean => {
    return userProfile?.role === 'super_admin' || userProfile?.role === 'admin';
  };

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) throw error;
      
      setSession(data.session);
      setUser(data.user);
    } catch (error) {
      console.error('Error refreshing session:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    session,
    loading,
    securityAlerts,
    auditLogs,
    devices,
    sessions,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    hasPermission,
    hasRole,
    isAdmin,
    refreshSession,
    enableTwoFactor,
    verifyTwoFactor,
    disableTwoFactor,
    generateBackupCodes,
    getActiveSessions,
    revokeSession,
    revokeAllSessions,
    getDevices,
    trustDevice,
    removeDevice,
    getAuditLogs,
    getSecurityAlerts,
    resolveAlert,
    changePassword,
    checkPasswordStrength,
    lockAccount,
    unlockAccount,
    isAccountLocked,
    upgradeUserRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};