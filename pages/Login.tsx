import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  ArrowRight,
  BookOpen,
  Laptop,
  Coffee,
  Users,
  Shield,
  Sparkles
} from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = (location.state as any)?.from || '/';
  const message = (location.state as any)?.message;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Simulate login - replace with actual login logic
      await login(email);
      navigate(from, { replace: true });
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const demoAccounts = [
    { email: 'student@babcock.edu.ng', role: 'Student', color: 'blue' },
    { email: 'seller@babcock.edu.ng', role: 'Seller', color: 'green' },
    { email: 'admin@babcock.edu.ng', role: 'Admin', color: 'purple' },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* Left Panel - Login Form */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-8"
      >
        <div className="w-full max-w-md">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="flex items-center justify-center mb-8"
          >
            <div className="bg-primary-800 p-3 rounded-xl">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <span className="ml-3 text-2xl font-bold">
              <span className="text-primary-800">Babcock</span>
              <span className="text-gray-900">Market</span>
            </span>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
            <p className="text-gray-600">
              Sign in to continue to Babcock Marketplace
            </p>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-amber-50 text-amber-800 rounded-lg text-sm"
              >
                {message}
              </motion.div>
            )}
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-red-50 text-red-600 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@babcock.edu.ng"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-primary-800 focus:ring-primary-500" />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-primary-800 hover:text-primary-900">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-800 hover:bg-primary-900 text-white py-6 text-lg"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </motion.form>

          {/* Demo Accounts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <p className="text-center text-sm text-gray-500 mb-4">
              Demo Accounts (Click to fill)
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {demoAccounts.map((account) => (
                <motion.button
                  key={account.email}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEmail(account.email)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                    ${account.color === 'blue' ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' : ''}
                    ${account.color === 'green' ? 'bg-green-50 text-green-700 hover:bg-green-100' : ''}
                    ${account.color === 'purple' ? 'bg-purple-50 text-purple-700 hover:bg-purple-100' : ''}
                  `}
                >
                  {account.role}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Sign Up Link */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-sm text-gray-600 mt-8"
          >
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-800 font-medium hover:text-primary-900">
              Sign up with your Babcock email
            </Link>
          </motion.p>
        </div>
      </motion.div>

      {/* Right Panel - Hero Section with reduced whitespace */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden lg:block w-1/2 bg-gradient-to-br from-primary-900 to-primary-800 relative overflow-hidden"
      >
        {/* Animated background patterns */}
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -right-20 -top-20 w-96 h-96 bg-white/5 rounded-full"
        />
        <motion.div
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute -left-20 -bottom-20 w-96 h-96 bg-accent-500/10 rounded-full"
        />

        <div className="relative h-full flex flex-col items-center justify-center p-12 text-white">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Badge variant="outline" className="border-white/30 text-white mb-8 px-4 py-2">
              <GraduationCap className="h-4 w-4 mr-2" />
              Babcock University • Est. 1959
            </Badge>
          </motion.div>

          {/* Main heading - more compact */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold text-center mb-4 leading-tight"
          >
            Join the Largest
            <span className="block text-accent-400">Campus Marketplace</span>
          </motion.h2>

          {/* Features grid - more compact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 gap-4 mt-8 w-full max-w-lg"
          >
            {[
              { icon: Users, text: '2,500+ Students', color: 'bg-blue-500/20' },
              { icon: BookOpen, text: '1,800+ Items', color: 'bg-green-500/20' },
              { icon: Laptop, text: 'Safe Trading', color: 'bg-purple-500/20' },
              { icon: Coffee, text: 'Campus Pickup', color: 'bg-orange-500/20' },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className={`${feature.color} rounded-lg p-4 text-center backdrop-blur-sm`}
                >
                  <Icon className="h-6 w-6 mx-auto mb-2 text-white" />
                  <p className="text-sm font-medium">{feature.text}</p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Testimonial - more compact */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 bg-white/10 rounded-xl p-6 backdrop-blur-sm max-w-md"
          >
            <div className="flex items-center mb-3">
              {[...Array(5)].map((_, i) => (
                <Sparkles key={i} className="h-4 w-4 text-accent-400 fill-accent-400" />
              ))}
            </div>
            <p className="text-sm text-white/90 italic">
              "Found all my textbooks at half the price! Best decision ever."
            </p>
            <div className="flex items-center mt-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">Sarah O.</p>
                <p className="text-xs text-white/60">300 Level, Accounting</p>
              </div>
            </div>
          </motion.div>

          {/* Security badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 flex items-center text-sm text-white/70"
          >
            <Shield className="h-4 w-4 mr-2" />
            Verified by Babcock University
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;