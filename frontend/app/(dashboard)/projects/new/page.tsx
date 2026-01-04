'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { projectApi } from '@/lib/api/projectApi';
import { clientApi } from '@/lib/api/clientApi';
import { CreateProjectData, Client } from '@/lib/types';

export default function NewProjectPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CreateProjectData>({
    defaultValues: {
      client_ids: [],
    },
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const data = await clientApi.getAll({ limit: 100 });
      setClients(data.clients);
    } catch (err) {
      console.error('Failed to load clients', err);
    }
  };

  const toggleClient = (clientId: string) => {
    const newSelected = selectedClients.includes(clientId)
      ? selectedClients.filter(id => id !== clientId)
      : [...selectedClients, clientId];
    setSelectedClients(newSelected);
    setValue('client_ids', newSelected);
  };

  const onSubmit = async (data: CreateProjectData) => {
    setError('');

    // Validate that at least one client is selected
    if (!selectedClients || selectedClients.length === 0) {
      setError('At least one client must be selected');
      return;
    }

    setIsLoading(true);

    try {
      await projectApi.create({ ...data, client_ids: selectedClients });
      router.push('/projects');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">New Project</h1>
        <p className="text-gray-600 mt-1">Create a new project for your client</p>
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
            Project Name *
          </label>
          <input
            type="text"
            {...register('name', { required: 'Project name is required' })}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Website Redesign"
          />
          {errors.name && (
            <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Clients * (at least one required)
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
            {clients.length === 0 ? (
              <p className="text-gray-500 text-sm">No clients available. Please create a client first.</p>
            ) : (
              clients.map((client) => (
                <label key={client.id} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={selectedClients.includes(client.id)}
                    onChange={() => toggleClient(client.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{client.name}</div>
                    {client.company && (
                      <div className="text-sm text-gray-500">{client.company}</div>
                    )}
                  </div>
                </label>
              ))
            )}
          </div>
          {selectedClients.length === 0 && (
            <p className="text-red-600 text-sm mt-1">At least one client must be selected</p>
          )}
          <input
            type="hidden"
            {...register('client_ids', {
              validate: (value) => value && value.length > 0 ? true : 'At least one client must be selected',
            })}
            value={selectedClients}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            {...register('description')}
            className="w-full px-3 py-2 border rounded-lg"
            rows={3}
            placeholder="Project description..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Budget ($)
            </label>
            <input
              type="number"
              {...register('budget', { valueAsNumber: true, min: { value: 0, message: 'Budget cannot be negative' } })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="10000"
            />
            {errors.budget && (
              <p className="text-red-600 text-sm mt-1">{errors.budget.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              {...register('status')}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Deadline
          </label>
          <input
            type="date"
            {...register('deadline')}
            className="w-full px-3 py-2 border rounded-lg"
          />
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
            {isLoading ? 'Creating...' : 'Create Project'}
          </button>
          <Link
            href="/projects"
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-center"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
