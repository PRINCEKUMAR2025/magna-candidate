import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { useCandidateAuth } from '@/components/auth/CandidateAuthContext';

interface FormData {
  email: string;
  password: string;
}

export default function Login() {
  const { candidate, loading, login } = useCandidateAuth();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  useEffect(() => {
    if (!loading && candidate) router.replace('/dashboard');
  }, [loading, candidate, router]);

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password);
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed.';
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
              <h1 className="text-2xl font-bold">Sign In</h1>
              <p className="text-gray-500 text-sm mt-1">Welcome back! Enter your credentials.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="mb-4">
                <input
                  type="email"
                  placeholder="Email address"
                  className="form-control"
                  {...register('email', { required: 'Email is required.' })}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div className="mb-6">
                <input
                  type="password"
                  placeholder="Password"
                  className="form-control"
                  {...register('password', { required: 'Password is required.' })}
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              {errors.root && (
                <p className="text-red-500 text-sm mb-4 text-center">{errors.root.message}</p>
              )}

              <button type="submit" className="hami-btn w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="magna-purple font-semibold">
                Register
              </Link>
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
