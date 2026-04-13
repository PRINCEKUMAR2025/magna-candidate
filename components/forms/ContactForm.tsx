import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { submitCompanyContact, submitCollegeContact } from '@/lib/api';

interface FormData {
  name: string;
  email: string;
  org: string;
  message: string;
}

interface Props {
  type: 'company' | 'college';
}

export default function ContactForm({ type }: Props) {
  const [success, setSuccess] = useState(false);
  const orgLabel = type === 'company' ? 'Company name' : 'College / Institution name';

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      if (type === 'company') {
        await submitCompanyContact({
          name: data.name,
          email: data.email,
          company: data.org,
          message: data.message,
        });
      } else {
        await submitCollegeContact({
          name: data.name,
          email: data.email,
          college: data.org,
          message: data.message,
        });
      }
      setSuccess(true);
      reset();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Submission failed.';
      setError('root', { message: msg });
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
        <p className="text-green-700 font-semibold text-lg">
          Message sent! We&apos;ll be in touch shortly.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="text-sm text-gray-500 underline mt-3"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Your name"
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
          type="text"
          placeholder={orgLabel}
          className="form-control"
          {...register('org', { required: `${orgLabel} is required.` })}
        />
        {errors.org && <p className="text-red-500 text-xs mt-1">{errors.org.message}</p>}
      </div>

      <div className="mb-6">
        <textarea
          placeholder="Your message"
          className="form-control"
          {...register('message', { required: 'Message is required.' })}
        />
        {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
      </div>

      {errors.root && (
        <p className="text-red-500 text-sm mb-4">{errors.root.message}</p>
      )}

      <button type="submit" className="hami-btn w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  );
}
