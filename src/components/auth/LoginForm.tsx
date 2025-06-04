import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, LogIn, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useSecurityMiddleware } from '../../lib/security';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const { signIn } = useAuth();
  const navigate = useNavigate();
  const securityMiddleware = useSecurityMiddleware();

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // Sanitize form data for security
      const sanitizedData = securityMiddleware.sanitizeFormData({
        email: email.trim(),
        password: password
      });

      const { data, error } = await signIn(sanitizedData.email, sanitizedData.password);

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setErrors({ general: 'Invalid email or password. Please try again.' });
        } else if (error.message.includes('Email not confirmed')) {
          setErrors({ general: 'Please check your email and click the confirmation link before signing in.' });
        } else {
          setErrors({ general: error.message || 'An error occurred during sign in' });
        }
        return;
      }

      if (data.user) {
        toast.success('Welcome back!');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
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
          <div className="mx-auto h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
            <LogIn className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white">
            Welcome Back
          </h2>
          <p className="mt-2 text-gray-400">
            Sign in to your Train Station Dashboard
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            {/* General Error */}
            {errors.general && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{errors.general}</p>
              </div>
            )}

            <div className="space-y-4">
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`
                      block w-full pl-10 pr-10 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-600'}
                    `}
                    placeholder="Enter your password"
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
            </div>

            {/* Sign In Button */}
            <div className="mt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="
                  group relative w-full flex justify-center py-3 px-4 border border-transparent 
                  text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-purple-600 
                  hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 
                  focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-200
                "
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <LogIn className="h-5 w-5 mr-2" />
                    Sign In
                  </>
                )}
              </button>
            </div>

            {/* Links */}
            <div className="mt-6 flex items-center justify-between text-sm">
              <Link
                to="/forgot-password"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Forgot your password?
              </Link>
              <Link
                to="/signup"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Create account
              </Link>
            </div>
          </div>

          {/* Demo Credentials */}
          <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/30">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Demo Credentials</h4>
            <div className="space-y-1 text-xs text-gray-400">
              <p><strong>Admin:</strong> admin@trainstation.com / password123</p>
              <p><strong>Manager:</strong> manager@trainstation.com / password123</p>
              <p><strong>Staff:</strong> staff@trainstation.com / password123</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}; 