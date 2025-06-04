import React, { useState, useEffect, useCallback, memo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  Shield, 
  Key, 
  FileSignature,
  Save
} from 'lucide-react';

const Settings: React.FC = memo(() => {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [fullName, setFullName] = useState('');

  // Sync fullName with userProfile when it changes
  useEffect(() => {
    setFullName(userProfile?.full_name || '');
  }, [userProfile?.full_name]);

  const handleFullNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFullName(e.target.value);
  }, []);

  const handleSaveChanges = useCallback(() => {
    // TODO: Implement save functionality
    console.log('Saving changes...', { fullName });
  }, [fullName]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-gray-400">Manage your account settings and preferences</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Profile Settings */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-xl font-semibold text-white mb-6">Profile Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={userProfile?.email || ''}
                readOnly
                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={handleFullNameChange}
                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white"
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Current Role
              </label>
              <div className="w-full px-3 py-2 bg-gray-700/30 border border-gray-600 rounded-lg text-white">
                {userProfile?.role || 'admin'}
              </div>
            </div>
            
            <div className="pt-4">
              <button 
                onClick={handleSaveChanges}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </button>
            </div>
          </div>
        </div>

        {/* Account Security */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-green-400" />
            Account Security
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors">
                Change Password
              </button>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Two-Factor Authentication
              </label>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Add an extra layer of security</span>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                  Enable 2FA
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-xl font-semibold text-white mb-6">Notification Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Email Notifications</p>
                <p className="text-gray-400 text-sm">Receive email updates about events and bookings</p>
              </div>
              <input type="checkbox" className="toggle toggle-primary" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">System Alerts</p>
                <p className="text-gray-400 text-sm">Get notified about system status and maintenance</p>
              </div>
              <input type="checkbox" className="toggle toggle-primary" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Marketing Updates</p>
                <p className="text-gray-400 text-sm">Receive updates about new features and promotions</p>
              </div>
              <input type="checkbox" className="toggle toggle-primary" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

Settings.displayName = 'Settings';

export default Settings;