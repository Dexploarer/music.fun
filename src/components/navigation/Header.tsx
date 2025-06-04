import React, { useState, useRef, useEffect } from 'react';
import { Bell, HelpCircle, Menu, User, Zap, Search, Command, LogOut, Settings, UserCircle, Crown, Shield, Users, Eye, LogIn } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from '../ui/ThemeToggle';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  username: string;
  onMenuClick: () => void;
  onAIAssistantToggle: () => void;
  searchOpen: boolean;
  onSearchToggle: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: Date;
  read: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  username, 
  onMenuClick, 
  onAIAssistantToggle, 
  searchOpen, 
  onSearchToggle 
}) => {
  const { user, userProfile, signOut } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const helpRef = useRef<HTMLDivElement>(null);

  // Mock notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'Event Alert',
      message: 'Tonight\'s concert has reached 90% capacity',
      type: 'warning',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: false
    },
    {
      id: '2',
      title: 'Payment Received',
      message: 'Artist payment of $2,500 processed successfully',
      type: 'success',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: true
    },
    {
      id: '3',
      title: 'System Update',
      message: 'New features available in the marketing dashboard',
      type: 'info',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      read: false
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Handle search input focus
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Handle click outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
      if (helpRef.current && !helpRef.current.contains(event.target as Node)) {
        setShowHelp(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin': return <Crown className="h-3 w-3 text-yellow-400" />;
      case 'admin': return <Shield className="h-3 w-3 text-red-400" />;
      case 'manager': return <Users className="h-3 w-3 text-blue-400" />;
      case 'staff': return <UserCircle className="h-3 w-3 text-green-400" />;
      case 'viewer': return <Eye className="h-3 w-3 text-gray-400" />;
      default: return <User className="h-3 w-3 text-gray-400" />;
    }
  };

  // Get role label
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'Admin';
      case 'manager': return 'Manager';
      case 'staff': return 'Staff';
      case 'viewer': return 'Viewer';
      default: return 'User';
    }
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      // Implement search functionality
    }
  };

  // Keyboard shortcuts info
  const shortcuts = [
    { key: 'Ctrl + B', action: 'Toggle Sidebar' },
    { key: 'Ctrl + K', action: 'Open AI Assistant' },
    { key: 'Ctrl + /', action: 'Global Search' },
    { key: 'Esc', action: 'Close Overlays' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-700/50 shadow-lg transition-all duration-300">
      <div className="flex h-16 items-center justify-between px-4">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="rounded-lg p-2 text-gray-300 hover:bg-zinc-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all duration-200"
            aria-label="Toggle menu"
          >
            <Menu size={18} />
          </button>
          
          <div className="hidden md:flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">TS</span>
            </div>
            <div>
              <h1 className="font-playfair text-lg font-semibold text-white leading-none">
                Train Station
          </h1>
              <p className="text-xs text-gray-400">Venue Management</p>
            </div>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-md mx-4">
          {searchOpen ? (
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search events, artists, customers..."
                  className="w-full pl-10 pr-4 py-2 bg-zinc-800/50 border border-zinc-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1 text-xs text-gray-400">
                  <Command size={10} />
                  <span>/</span>
                </div>
              </div>
            </form>
          ) : (
            <button
              onClick={onSearchToggle}
              className="w-full flex items-center px-3 py-2 bg-zinc-800/30 border border-zinc-700 rounded-lg text-gray-400 hover:text-white hover:bg-zinc-800/50 transition-all text-sm"
            >
              <Search size={14} className="mr-3" />
              <span>Search...</span>
              <div className="ml-auto flex items-center space-x-1 text-xs">
                <Command size={10} />
                <span>/</span>
              </div>
            </button>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2">
          {/* Theme Toggle */}
          <ThemeToggle size="sm" />

          {user ? (
            <>
              {/* AI Assistant Button */}
              <button
                onClick={onAIAssistantToggle}
                className="flex items-center rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 px-3 py-2 text-sm font-medium text-white transition-all hover:from-amber-600 hover:to-orange-700 hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-500"
                aria-label="AI Assistant"
              >
                <Zap size={14} className="mr-1.5" />
                <span className="hidden sm:inline">Rowan AI</span>
                <div className="ml-1.5 hidden sm:flex items-center space-x-1 text-xs opacity-75">
                  <Command size={8} />
                  <span>K</span>
                </div>
              </button>
            </>
          ) : (
            /* Login Button for unauthenticated users */
            <button
              onClick={() => navigate('/login')}
              className="flex items-center rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 px-3 py-2 text-sm font-medium text-white transition-all hover:from-amber-600 hover:to-orange-700 hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-500"
              aria-label="Login"
            >
              <LogIn size={14} className="mr-1.5" />
              <span className="hidden sm:inline">Login</span>
            </button>
          )}

          {/* User-specific elements - only show when authenticated */}
          {user && (
            <>
              {/* Notifications */}
              <div className="relative" ref={notificationsRef}>
          <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative rounded-lg p-2 text-gray-300 hover:bg-zinc-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            aria-label="Notifications"
          >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
          </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-zinc-800 rounded-lg shadow-xl border border-zinc-700 py-2 z-50">
                <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-700">
                  <h3 className="font-medium text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-amber-400 hover:text-amber-300"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map(notification => (
                      <div
                        key={notification.id}
                        onClick={() => markAsRead(notification.id)}
                        className={`px-4 py-3 hover:bg-zinc-700/50 cursor-pointer border-l-4 ${
                          notification.read 
                            ? 'border-transparent opacity-70' 
                            : notification.type === 'error' 
                              ? 'border-red-500'
                              : notification.type === 'warning'
                                ? 'border-yellow-500'
                                : notification.type === 'success'
                                  ? 'border-green-500'
                                  : 'border-blue-500'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">{notification.title}</p>
                            <p className="text-xs text-gray-400 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {notification.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="h-2 w-2 rounded-full bg-amber-500 mt-1"></div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center text-gray-400">
                      <Bell size={24} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No notifications</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Help */}
          <div className="relative" ref={helpRef}>
          <button 
              onClick={() => setShowHelp(!showHelp)}
              className="rounded-lg p-2 text-gray-300 hover:bg-zinc-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            aria-label="Help"
          >
              <HelpCircle size={16} />
          </button>

            {/* Help Dropdown */}
            {showHelp && (
              <div className="absolute right-0 mt-2 w-64 bg-zinc-800 rounded-lg shadow-xl border border-zinc-700 py-2 z-50">
                <div className="px-4 py-2 border-b border-zinc-700">
                  <h3 className="font-medium text-white">Keyboard Shortcuts</h3>
                </div>
                <div className="px-4 py-2">
                  {shortcuts.map((shortcut, index) => (
                    <div key={index} className="flex justify-between items-center py-1">
                      <span className="text-sm text-gray-400">{shortcut.action}</span>
                      <kbd className="px-2 py-1 bg-zinc-700 rounded text-xs text-gray-300 font-mono">
                        {shortcut.key}
                      </kbd>
                    </div>
                  ))}
                </div>
                <div className="border-t border-zinc-700 px-4 py-2">
                  <button className="text-sm text-amber-400 hover:text-amber-300">
                    View Documentation
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center space-x-2 rounded-lg p-2 text-gray-300 hover:bg-zinc-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center">
                <User size={14} className="text-white" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-white leading-none">{username}</p>
                <div className="flex items-center space-x-1 mt-0.5">
                  {getRoleIcon(userProfile?.role || '')}
                  <span className="text-xs text-gray-400">{getRoleLabel(userProfile?.role || '')}</span>
                </div>
              </div>
            </button>

            {/* Profile Dropdown */}
            {showProfile && (
              <div className="absolute right-0 mt-2 w-56 bg-zinc-800 rounded-lg shadow-xl border border-zinc-700 py-2 z-50">
                <div className="px-4 py-3 border-b border-zinc-700">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center">
                      <User size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{username}</p>
                      <div className="flex items-center space-x-1">
                        {getRoleIcon(userProfile?.role || '')}
                        <span className="text-xs text-gray-400">{getRoleLabel(userProfile?.role || '')}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="py-1">
                  <button className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-zinc-700 hover:text-white">
                    <UserCircle size={14} className="mr-3" />
                    Profile Settings
                  </button>
                  <button className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-zinc-700 hover:text-white">
                    <Settings size={14} className="mr-3" />
                    Preferences
                  </button>
                </div>
                
                <div className="border-t border-zinc-700 py-1">
                  <button 
                    onClick={() => signOut()}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-red-600/10 hover:text-red-300"
                  >
                    <LogOut size={14} className="mr-3" />
                    Sign Out
                  </button>
                </div>
            </div>
            )}
          </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;