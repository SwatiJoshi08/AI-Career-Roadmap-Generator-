import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../lib/auth/authStore';
import { useToast } from '../../lib/ToastContext';
import { authApi } from '../../features/acrg/api/auth.api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { ErrorAlert } from '../../components/ui/ErrorAlert';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  role: z.enum(['student', 'career_mentor', 'placement_officer', 'career_content_admin']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const getErrorMessage = (err: any, fallback: string) => {
  const message =
    err?.response?.data?.error?.message ||
    err?.error?.message ||
    err?.message?.message ||
    err?.message ||
    fallback;

  return typeof message === 'string' ? message : fallback;
};

export const RegisterPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [globalError, setGlobalError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'student'
    }
  });

  const onSubmit = async (data: RegisterFormData) => {
    setGlobalError('');
    try {
      // Omit confirmPassword
      const { confirmPassword, ...payload } = data;
      const response = await authApi.register(payload);
      
      if (response.data) {
        login(response.data.token, response.data.user);
        showToast('Registration successful!', 'success');
        navigate('/dashboard');
      } else {
        setGlobalError('Invalid response from server');
      }
    } catch (err: any) {
      setGlobalError(getErrorMessage(err, 'Registration failed. Please try again.'));
    }
  };

  const roleOptions = [
    { value: 'student', label: 'Student' },
    { value: 'career_mentor', label: 'Career Mentor' },
    { value: 'placement_officer', label: 'Placement Officer' },
    { value: 'career_content_admin', label: 'Content Admin' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create a new account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {globalError && (
            <div className="mb-4">
              <ErrorAlert message={globalError} />
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              {...register('email')}
              error={errors.email?.message}
            />

            <Select
              label="Role"
              options={roleOptions}
              {...register('role')}
              error={errors.role?.message}
            />

            <Input
              label="Password"
              type="password"
              autoComplete="new-password"
              {...register('password')}
              error={errors.password?.message}
            />

            <Input
              label="Confirm Password"
              type="password"
              autoComplete="new-password"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
            />

            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Register
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
