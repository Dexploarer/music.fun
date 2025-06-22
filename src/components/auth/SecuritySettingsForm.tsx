import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { ValidatedInput } from '../ui/FormField';
import { TwoFactorSetup } from './TwoFactorSetup';

export const SecuritySettingsForm: React.FC = () => {
  const { userProfile, updateSecuritySettings } = useAuth();
  const [sessionTimeout, setSessionTimeout] = useState(
    userProfile?.security_settings?.sessionTimeout || 30
  );
  const [passwordExpiryDays, setPasswordExpiryDays] = useState(
    userProfile?.security_settings?.passwordExpiryDays || 90
  );
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSecuritySettings({
        sessionTimeout,
        passwordExpiryDays,
      });
      toast.success('Security settings updated');
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Security Settings</h3>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between bg-gray-800/50 p-4 rounded-lg">
          <div className="text-white">Two-Factor Authentication</div>
          {userProfile?.two_factor_auth?.isEnabled ? (
            <span className="text-green-400">Enabled</span>
          ) : (
            <button
              onClick={() => setShowTwoFactor(true)}
              className="text-blue-400 hover:text-blue-300"
            >
              Enable
            </button>
          )}
        </div>

        <ValidatedInput
          type="number"
          label="Session Timeout (minutes)"
          value={sessionTimeout}
          onChange={(e) => setSessionTimeout(Number(e.target.value))}
          min={1}
        />

        <ValidatedInput
          type="number"
          label="Password Expiry (days)"
          value={passwordExpiryDays}
          onChange={(e) => setPasswordExpiryDays(Number(e.target.value))}
          min={1}
        />
      </div>

      {showTwoFactor && (
        <TwoFactorSetup
          onComplete={() => setShowTwoFactor(false)}
          onCancel={() => setShowTwoFactor(false)}
        />
      )}
    </div>
  );
};
