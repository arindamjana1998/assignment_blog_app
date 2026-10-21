import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { registerSchema } from '../../schemas/authSchemas';
import { useAuth } from '../../hooks/useAuth';
import Input from '../common/Input';
import Button from '../common/Button';
import Alert from '../common/Alert';
import OAuthButtons from './OAuthButtons';
import { getErrorMessage } from '../../utils/errorHandler';

export const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState(null);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password') || '';
  const confirmPassword = watch('confirmPassword') || '';

  // Real-time password match evaluation as user types
  const hasTypedConfirm = confirmPassword.length > 0;
  const isMatch = hasTypedConfirm && password.length > 0 && password === confirmPassword;
  const isMismatch = hasTypedConfirm && password !== confirmPassword;

  const confirmPasswordError = isMismatch
    ? 'Passwords do not match'
    : errors.confirmPassword?.message;

  const confirmPasswordSuccess = isMatch ? 'Passwords match' : null;

  const onSubmit = async (data) => {
    try {
      setServerError(null);
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      navigate('/login');
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Create your account
        </h2>
        <p className="text-sm text-slate-500">
          Join Chronicle to publish articles and engage in discussions
        </p>
      </div>

      {serverError && (
        <Alert variant="error" onClose={() => setServerError(null)}>
          {serverError}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full Name"
          name="name"
          placeholder="Alice Developer"
          required
          leftIcon={User}
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Email address"
          name="email"
          type="email"
          placeholder="name@example.com"
          required
          leftIcon={Mail}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          placeholder="At least 6 characters"
          required
          leftIcon={Lock}
          rightIcon={showPassword ? EyeOff : Eye}
          onRightIconClick={() => setShowPassword(!showPassword)}
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          label="Confirm Password"
          name="confirmPassword"
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder="Repeat your password"
          required
          leftIcon={Lock}
          rightIcon={showConfirmPassword ? EyeOff : Eye}
          onRightIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
          error={confirmPasswordError}
          success={confirmPasswordSuccess}
          {...register('confirmPassword')}
        />

        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          className="w-full mt-2"
        >
          Create Account
        </Button>
      </form>

      <OAuthButtons />

      <p className="text-center text-xs text-slate-500 pt-2">
        Already registered?{' '}
        <Link
          to="/login"
          className="font-semibold text-brand-600 hover:text-brand-500 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default RegisterForm;
