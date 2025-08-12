import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { User, Mail, Lock, Eye, EyeOff, Phone, MapPin, Globe, Plane, Compass, UserPlus, Briefcase } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { signupUser, clearError } from './AuthSlice';
import { API_STATUS, VALIDATION_RULES } from '../../utils/constants';
import { SITE_INFO } from '../../utils/SITEINFO';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import toast from 'react-hot-toast';

const schema = yup.object({
  name: yup
    .string()
    .min(VALIDATION_RULES.NAME_MIN_LENGTH, `Name must be at least ${VALIDATION_RULES.NAME_MIN_LENGTH} characters`)
    .max(VALIDATION_RULES.NAME_MAX_LENGTH, `Name cannot exceed ${VALIDATION_RULES.NAME_MAX_LENGTH} characters`)
    .required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup
    .string()
    .min(VALIDATION_RULES.PASSWORD_MIN_LENGTH, `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters`)
    .matches(VALIDATION_RULES.PASSWORD_PATTERN, VALIDATION_RULES.PASSWORD_MESSAGE)
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
  phone: yup
    .string()
    .matches(VALIDATION_RULES.PHONE_PATTERN, 'Please provide a valid phone number')
    .notRequired(),
  country: yup
    .string()
    .max(VALIDATION_RULES.COUNTRY_MAX_LENGTH, `Country name cannot exceed ${VALIDATION_RULES.COUNTRY_MAX_LENGTH} characters`)
    .notRequired(),
  city: yup
    .string()
    .max(VALIDATION_RULES.CITY_MAX_LENGTH, `City name cannot exceed ${VALIDATION_RULES.CITY_MAX_LENGTH} characters`)
    .notRequired(),
});

const SignupPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
  
  // Featured destinations from SITE_INFO for the background
  const destinations = SITE_INFO.featuredDestinations;

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

  const onSubmit = async (data) => {
    const { confirmPassword, ...signupData } = data;
    try {
      await dispatch(signupUser(signupData)).unwrap();
      toast.success('Account created successfully! Please check your email to verify your account.');
      navigate('/login');
    } catch (error) {
      toast.error(error || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      
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
            <Compass className="h-8 w-8 text-teal-600" />
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
              Start Your Journey
            </motion.h2>
            <motion.p 
              className="text-gray-600 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Join {SITE_INFO.brandName} and create your travel story
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
                {...register('name')}
                type="text"
                label="Full Name"
                placeholder="Enter your full name"
                icon={<User size={18} className="text-teal-500" />}
                error={errors.name?.message}
                required
                className="focus:border-teal-500 transition-all duration-300"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Input
                {...register('email')}
                type="email"
                label="Email Address"
                placeholder="Enter your email"
                icon={<Mail size={18} className="text-teal-500" />}
                error={errors.email?.message}
                required
                className="focus:border-teal-500 transition-all duration-300"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Input
                {...register('phone')}
                type="tel"
                label="Phone (optional)"
                placeholder="Enter your phone number"
                icon={<Phone size={18} className="text-teal-500" />}
                error={errors.phone?.message}
                className="focus:border-teal-500 transition-all duration-300"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Input
                {...register('country')}
                type="text"
                label="Country (optional)"
                placeholder="Enter your country"
                icon={<Globe size={18} className="text-teal-500" />}
                error={errors.country?.message}
                className="focus:border-teal-500 transition-all duration-300"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Input
                {...register('city')}
                type="text"
                label="City (optional)"
                placeholder="Enter your city"
                icon={<MapPin size={18} className="text-teal-500" />}
                error={errors.city?.message}
                className="focus:border-teal-500 transition-all duration-300"
              />
            </motion.div>

            <motion.div variants={itemVariants} className="relative">
              <Input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="Enter your password"
                icon={<Lock size={18} className="text-teal-500" />}
                error={errors.password?.message}
                required
                className="focus:border-teal-500 transition-all duration-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-10 text-gray-400 hover:text-teal-500 transition-colors duration-300"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </motion.div>

            <motion.div variants={itemVariants} className="relative">
              <Input
                {...register('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                label="Confirm Password"
                placeholder="Confirm your password"
                icon={<Lock size={18} className="text-teal-500" />}
                error={errors.confirmPassword?.message}
                required
                className="focus:border-teal-500 transition-all duration-300"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-10 text-gray-400 hover:text-teal-500 transition-colors duration-300"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                I agree to the{' '}
                <Link to="/terms" className="text-teal-600 hover:text-teal-500 transition-colors duration-300">
                  Terms and Conditions
                </Link>
              </label>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-teal-600 to-blue-500 hover:from-teal-700 hover:to-blue-600 transition-all duration-300 flex items-center justify-center gap-2"
                loading={status === API_STATUS.LOADING}
              >
                <UserPlus size={18} />
                Begin Your Adventure
              </Button>
            </motion.div>

            <motion.p 
              variants={itemVariants}
              className="text-center text-sm text-gray-600 mt-6"
            >
              Already have an account?{' '}
              <Link to="/login" className="text-teal-600 hover:text-teal-500 transition-colors duration-300">
                Sign in
              </Link>
            </motion.p>
          </motion.form>
          
          <motion.div 
            className="mt-6 pt-6 border-t border-gray-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <Briefcase size={16} className="mr-2 text-teal-500" />
              Why join {SITE_INFO.brandName}?
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="flex-shrink-0 h-5 w-5 text-teal-500 flex items-center justify-center">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="ml-2">Create personalized multi-city travel itineraries</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-5 w-5 text-teal-500 flex items-center justify-center">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="ml-2">Manage travel budgets and track expenses</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-5 w-5 text-teal-500 flex items-center justify-center">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="ml-2">Discover new destinations and travel recommendations</span>
              </li>
            </ul>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
};

export default SignupPage;