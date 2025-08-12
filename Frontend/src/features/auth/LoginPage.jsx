import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Mail, Lock, Eye, EyeOff, Globe, MapPin, Plane, Compass, LogIn } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from './AuthSlice';
import { API_STATUS } from '../../utils/constants';
import { SITE_INFO } from '../../utils/SITEINFO';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required')
});

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { status, error, isAuthenticated } = useSelector((state) => state.auth);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, navigate, dispatch]);

  const onSubmit = (data) => {
    dispatch(loginUser(data));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="flex justify-center mb-6">
          <motion.div 
            className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Compass className="h-8 w-8 text-blue-600" />
          </motion.div>
        </div>
        
        <Card className="bg-white/90 backdrop-blur-md border border-white/30 shadow-xl">
          <div className="text-center mb-8">
            <motion.h2 
              className="text-3xl font-bold text-gray-900 font-heading"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Welcome Back Explorer
            </motion.h2>
            <motion.p 
              className="text-gray-600 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Sign in to your {SITE_INFO.brandName} account to continue your journey
            </motion.p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
            >
              {error}
            </motion.div>
          )}

          <motion.form 
            onSubmit={handleSubmit(onSubmit)} 
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <Input
                {...register('email')}
                type="email"
                label="Email Address"
                placeholder="Enter your email"
                icon={<Mail size={18} className="text-blue-500" />}
                error={errors.email?.message}
                required
                className="focus:border-blue-500 transition-all duration-300"
              />
            </motion.div>

            <motion.div variants={itemVariants} className="relative">
              <Input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="Enter your password"
                icon={<Lock size={18} className="text-blue-500" />}
                error={errors.password?.message}
                required
                className="focus:border-blue-500 transition-all duration-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-10 text-gray-400 hover:text-blue-500 transition-colors duration-300"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-300"
                >
                  Forgot your password?
                </Link>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={status === API_STATUS.LOADING}
                className="w-full bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <LogIn size={18} />
                Begin Your Journey
              </Button>
            </motion.div>
          </motion.form>

          <motion.div 
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-gray-600">
              Ready to start your adventure?{' '}
              <Link
                to="/signup"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-300"
              >
                Create an account
              </Link>
            </p>
          </motion.div>
          
          <motion.div 
            className="mt-6 pt-6 border-t border-gray-200 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
              <MapPin size={12} className="text-blue-500" />
              {SITE_INFO.tagline}
            </p>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginPage;