'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { clientApi } from '@/lib/api/clientApi';
import { CreateClientData } from '@/lib/types';

export default function NewClientPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateClientData>();

  const onSubmit = async (data: CreateClientData) => {
    setError('');
    setIsLoading(true);

    try {
      await clientApi.create(data);
      router.push('/clients');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create client');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">New Client</h1>
        <p className="text-gray-600 mt-1">Add a new client to your portfolio</p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg border space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </label>
          <input
            type="text"
            {...register('name', { required: 'Name is required' })}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="John Smith"
          />
          {errors.name && (
            <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            {...register('email', {
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email format',
              },
            })}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="john@example.com"
          />
          {errors.email && (
            <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            type="tel"
            {...register('phone')}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="+1 234 567 8900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company
          </label>
          <input
            type="text"
            {...register('company')}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Acme Inc."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <textarea
            {...register('address')}
            className="w-full px-3 py-2 border rounded-lg"
            rows={3}
            placeholder="123 Main St, City, Country"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            {...register('status')}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            {...register('notes')}
            className="w-full px-3 py-2 border rounded-lg"
            rows={3}
            placeholder="Additional notes..."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Create Client'}
          </button>
          <Link
            href="/clients"
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-center"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
