import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Mail, Image, Lock, Calendar, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { updateProfileSchema } from '../schemas/userSchemas';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Alert from '../components/common/Alert';
import { getErrorMessage } from '../utils/errorHandler';

export const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [serverError, setServerError] = useState(null);

  const isOAuthAccount = user?.oauthProvider?.provider && user?.oauthProvider?.provider !== 'local';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name || '',
      avatar: user?.avatar || '',
      currentPassword: '',
      newPassword: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      setServerError(null);

      const payload = {};
      if (data.name && data.name !== user?.name) payload.name = data.name;
      if (data.avatar !== undefined && data.avatar !== user?.avatar) payload.avatar = data.avatar;
      if (data.newPassword) {
        payload.currentPassword = data.currentPassword;
        payload.newPassword = data.newPassword;
      }

      if (Object.keys(payload).length === 0) {
        return;
      }

      await updateProfile(payload);
      reset({
        name: data.name,
        avatar: data.avatar,
        currentPassword: '',
        newPassword: '',
      });
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  };

  const formattedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'N/A';

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Account Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your personal profile, avatar, and security credentials
        </p>
      </div>

      {/* Account Overview Header Card */}
      <Card padding="p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-200 shadow-sm"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-brand-100 text-brand-700 font-bold text-2xl flex items-center justify-center">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          )}

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
              <Badge variant={user?.role === 'admin' ? 'warning' : 'default'} size="sm">
                {user?.role}
              </Badge>
              <Badge variant="success" size="sm">
                Active Account
              </Badge>
            </div>

            <p className="text-sm text-slate-600 flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>{user?.email}</span>
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Joined {formattedDate}
              </span>
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" />
                Provider: {user?.oauthProvider?.provider || 'local'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Profile Modification Form Card */}
      <Card padding="p-6 sm:p-8" className="space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Personal Information</h3>
          <p className="text-xs text-slate-500">Update your public display name and avatar</p>
        </div>

        {serverError && (
          <Alert variant="error" onClose={() => setServerError(null)}>
            {serverError}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-5">
            <Input
              label="Full Name"
              name="name"
              placeholder="Your Name"
              leftIcon={User}
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label="Avatar Image URL"
              name="avatar"
              placeholder="https://example.com/avatar.jpg"
              leftIcon={Image}
              helperText="Provide a public direct image URL for your profile photo"
              error={errors.avatar?.message}
              {...register('avatar')}
            />
          </div>

          {!isOAuthAccount && (
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Change Password</h4>
                <p className="text-xs text-slate-500">
                  Leave these fields blank if you do not wish to change your password
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Current Password"
                  name="currentPassword"
                  type="password"
                  placeholder="••••••••"
                  leftIcon={Lock}
                  error={errors.currentPassword?.message}
                  {...register('currentPassword')}
                />

                <Input
                  label="New Password"
                  name="newPassword"
                  type="password"
                  placeholder="••••••••"
                  leftIcon={Lock}
                  error={errors.newPassword?.message}
                  {...register('newPassword')}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              disabled={!isDirty}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ProfilePage;
