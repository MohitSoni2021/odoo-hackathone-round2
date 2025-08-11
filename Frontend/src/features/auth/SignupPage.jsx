import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { User, Mail, Lock, Eye, EyeOff, Phone, MapPin } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { signupUser, clearError } from './AuthSlice';
import { API_STATUS, VALIDATION_RULES } from '../../utils/constants';
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
        className="max-w-md w-full"
      >
        <Card className="bg-white/80 backdrop-blur-sm border-white/20">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 font-heading">Create Account</h2>
            <p className="text-gray-600 mt-2">Join GlobeTrotter and start planning</p>
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              {...register('name')}
              type="text"
              label="Full Name"
              placeholder="Enter your full name"
              icon={<User size={18} />}
              error={errors.name?.message}
              required
            />

            <Input
              {...register('email')}
              type="email"
              label="Email Address"
              placeholder="Enter your email"
              icon={<Mail size={18} />}
              error={errors.email?.message}
              required
            />

            <Input
              {...register('phone')}
              type="tel"
              label="Phone (optional)"
              placeholder="Enter your phone number"
              icon={<Phone size={18} />}
              error={errors.phone?.message}
            />

            <Input
              {...register('country')}
              type="text"
              label="Country (optional)"
              placeholder="Enter your country"
              icon={<MapPin size={18} />}
              error={errors.country?.message}
            />

            <Input
              {...register('city')}
              type="text"
              label="City (optional)"
              placeholder="Enter your city"
              icon={<MapPin size={18} />}
              error={errors.city?.message}
            />

            <div className="relative">
              <Input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="Enter your password"
                icon={<Lock size={18} />}
                error={errors.password?.message}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-10 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="relative">
              <Input
                {...register('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                label="Confirm Password"
                placeholder="Confirm your password"
                icon={<Lock size={18} />}
                error={errors.confirmPassword?.message}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-10 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                I agree to the{' '}
                <Link to="/terms" className="text-blue-600 hover:text-blue-500">
                  Terms and Conditions
                </Link>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full"
              loading={status === API_STATUS.LOADING}
            >
              Create Account
            </Button>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-500">
                Sign in
              </Link>
            </p>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default SignupPage;