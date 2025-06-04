import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '../../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, UserCog, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const SignupForm: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: 'admin' as UserRole
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    fullName?: string;
    general?: string;
  }>({});

  const { signUp } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const { data, error } = await signUp(formData.email, formData.password, {
        full_name: formData.fullName,
        role: formData.role
      });

      if (error) {
        if (error.message.includes('already registered')) {
          setErrors({ email: 'An account with this email already exists' });
        } else if (error.message.includes('weak password')) {
          setErrors({ password: 'Password is too weak. Please choose a stronger password.' });
        } else {
          setErrors({ general: error.message || 'An error occurred during registration' });
        }
        return;
      }

      if (data.user) {
        toast.success('Account created successfully! Please check your email to verify your account.');
        navigate('/login', { 
          state: { message: 'Please check your email to verify your account before signing in.' }
        });
      }
    } catch (error) {
      console.error('Signup error:', error);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
            <UserCog className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white">
            Create Account
          </h2>
          <p className="mt-2 text-gray-400">
            Join the Train Station Dashboard
          </p>
        </div>

        {/* Signup Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            {/* General Error */}
            {errors.general && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{errors.general}</p>
              </div>
            )}

            <div className="space-y-4">
              {/* Full Name Field */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`
                      block w-full pl-10 pr-3 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      ${errors.fullName ? 'border-red-500 focus:ring-red-500' : 'border-gray-600'}
                    `}
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-400">{errors.fullName}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`
                      block w-full pl-10 pr-3 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-600'}
                    `}
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                )}
              </div>

              {/* Role Selection */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-1">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="admin">Admin - Full system access</option>
                  <option value="manager">Manager - Management access</option>
                  <option value="staff">Staff - Basic operations access</option>
                  <option value="viewer">Viewer - View only access</option>
                </select>
                <p className="mt-1 text-xs text-gray-400">
                  Choose the appropriate role for your responsibilities
                </p>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`
                      block w-full pl-10 pr-10 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-600'}
                    `}
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`
                      block w-full pl-10 pr-10 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-600'}
                    `}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Sign Up Button */}
            <div className="mt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="
                  group relative w-full flex justify-center py-3 px-4 border border-transparent 
                  text-sm font-medium rounded-lg text-white bg-gradient-to-r from-green-500 to-blue-600 
                  hover:from-green-600 hover:to-blue-700 focus:outline-none focus:ring-2 
                  focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-200
                "
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <UserCog className="h-5 w-5 mr-2" />
                    Create Account
                  </>
                )}
              </button>
            </div>

            {/* Links */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>

          {/* Terms Notice */}
          <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/30">
            <p className="text-xs text-gray-400 text-center">
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}; 