'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { clientApi } from '@/lib/api/clientApi';
import { Client, UpdateClientData } from '@/lib/types';
import { useAuth } from '@/lib/hooks/useAuth';

export default function EditClientPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();

  const [client, setClient] = useState<Client | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingClient, setIsLoadingClient] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateClientData>();

  const loadClient = async () => {
    try {
      setIsLoadingClient(true);
      const data = await clientApi.getById(id);
      setClient(data);
      // Convert null values to undefined for form reset
      reset({
        name: data.name,
        email: data.email || undefined,
        phone: data.phone || undefined,
        company: data.company || undefined,
        address: data.address || undefined,
        status: data.status,
        notes: data.notes || undefined,
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load client');
    } finally {
      setIsLoadingClient(false);
    }
  };

  const onSubmit = async (data: UpdateClientData) => {
    setError('');
    setIsLoading(true);

    try {
      await clientApi.update(id, data);
      router.push('/clients');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update client');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClient();
  }, [id]);

  if (isLoadingClient) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!client) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Client not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {user?.role === 'admin' ? 'Edit Client' : 'Client Details'}
        </h1>
        <p className="text-gray-600 mt-1">
          {user?.role === 'admin' ? 'Update client information' : 'View client information'}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Admin: Edit Form */}
      {user?.role === 'admin' ? (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg border space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              {...register('name', { required: 'Name is required' })}
              className="w-full px-3 py-2 border rounded-lg"
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
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
            <Link
              href="/clients"
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      ) : (
        /* Non-Admin: Read-only View */
        <div className="bg-white p-6 rounded-lg border space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Name
            </label>
            <p className="text-lg font-semibold text-gray-900">{client.name}</p>
          </div>

          {client.email && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Email
              </label>
              <p className="text-gray-700">{client.email}</p>
            </div>
          )}

          {client.phone && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Phone
              </label>
              <p className="text-gray-700">{client.phone}</p>
            </div>
          )}

          {client.company && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Company
              </label>
              <p className="text-gray-700">{client.company}</p>
            </div>
          )}

          {client.address && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Address
              </label>
              <p className="text-gray-700 whitespace-pre-wrap">{client.address}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Status
            </label>
            <p className="text-gray-700 capitalize">{client.status}</p>
          </div>

          {client.notes && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Notes
              </label>
              <p className="text-gray-700 whitespace-pre-wrap">{client.notes}</p>
            </div>
          )}

          {/* Back Button */}
          <div className="pt-4">
            <Link
              href="/clients"
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-center inline-block"
            >
              Back to Clients
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
