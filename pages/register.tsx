import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { useCandidateAuth } from '@/components/auth/CandidateAuthContext';

interface FormData {
  name: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
}

export default function Register() {
  const { candidate, loading, register: registerCandidate } = useCandidateAuth();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  useEffect(() => {
    if (!loading && candidate) router.replace('/dashboard');
  }, [loading, candidate, router]);

  const onSubmit = async (data: FormData) => {
    if (data.password !== data.confirmPassword) {
      setError('confirmPassword', { message: 'Passwords do not match.' });
      return;
    }
    try {
      await registerCandidate({
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        password: data.password,
      });
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed.';
      setError('root', { message: msg });
    }
  };

  return (
    <Layout>
      <section className="bg-magna-light min-h-[80vh] flex items-center py-16">
        <div className="container max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-10">
            <div className="text-center mb-8">
              <Image
                src="/img/logo/Magna-Hire-Normal.png"
                alt="Magna Hire"
                width={140}
                height={45}
                className="mx-auto mb-4"
              />
              <h1 className="text-2xl font-bold">Create Account</h1>
              <p className="text-gray-500 text-sm mt-1">Join Magna Hire and find your next opportunity.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Full name"
                  className="form-control"
                  {...register('name', { required: 'Name is required.' })}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div className="mb-4">
                <input
                  type="email"
                  placeholder="Email address"
                  className="form-control"
                  {...register('email', { required: 'Email is required.' })}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div className="mb-4">
                <input
                  type="tel"
                  placeholder="Phone (Mandatory)"
                  className="form-control"
                  {...register('phone')}
                />
              </div>

              <div className="mb-4">
                <input
                  type="password"
                  placeholder="Password (min. 8 characters)"
                  className="form-control"
                  {...register('password', {
                    required: 'Password is required.',
                    minLength: { value: 8, message: 'Password must be at least 8 characters.' },
                  })}
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <div className="mb-6">
                <input
                  type="password"
                  placeholder="Confirm password"
                  className="form-control"
                  {...register('confirmPassword', { required: 'Please confirm your password.' })}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              {errors.root && (
                <p className="text-red-500 text-sm mb-4 text-center">{errors.root.message}</p>
              )}

              <button type="submit" className="hami-btn w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Creating account…' : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{' '}
              <Link href="/login" className="magna-purple font-semibold">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
