import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loginSchema } from '../../schemas/authSchemas';
import { useAuth } from '../../hooks/useAuth';
import Input from '../common/Input';
import Button from '../common/Button';
import Alert from '../common/Alert';
import OAuthButtons from './OAuthButtons';
import { getErrorMessage } from '../../utils/errorHandler';

export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      setServerError(null);
      await login(data);
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Sign in to your account
        </h2>
        <p className="text-sm text-slate-500">
          Enter your credentials to access your blog dashboard
        </p>
      </div>

      {serverError && (
        <Alert variant="error" onClose={() => setServerError(null)}>
          {serverError}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          placeholder="••••••••"
          required
          leftIcon={Lock}
          rightIcon={showPassword ? EyeOff : Eye}
          onRightIconClick={() => setShowPassword(!showPassword)}
          error={errors.password?.message}
          {...register('password')}
        />

        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          className="w-full mt-2"
        >
          Sign In
        </Button>
      </form>

      <OAuthButtons />

      <p className="text-center text-xs text-slate-500 pt-2">
        Don&apos;t have an account yet?{' '}
        <Link
          to="/register"
          className="font-semibold text-brand-600 hover:text-brand-500 hover:underline"
        >
          Create account
        </Link>
      </p>
    </div>
  );
};

export default LoginForm;
