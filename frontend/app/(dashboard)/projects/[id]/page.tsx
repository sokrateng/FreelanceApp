'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { projectApi } from '@/lib/api/projectApi';
import { clientApi } from '@/lib/api/clientApi';
import { Project, UpdateProjectData, Client } from '@/lib/types';

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProject, setIsLoadingProject] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateProjectData>();

  const loadProject = async () => {
    try {
      setIsLoadingProject(true);
      const data = await projectApi.getById(id);
      setProject(data);

      // Format data for form reset, converting null to undefined
      reset({
        name: data.name,
        client_id: data.client_id || undefined,
        description: data.description || undefined,
        status: data.status,
        budget: data.budget || undefined,
        deadline: data.deadline ? data.deadline.substring(0, 10) : undefined,
        notes: data.notes || undefined,
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load project');
    } finally {
      setIsLoadingProject(false);
    }
  };

  const loadClients = async () => {
    try {
      const data = await clientApi.getAll({ limit: 100 });
      setClients(data.clients);
    } catch (err) {
      console.error('Failed to load clients', err);
    }
  };

  const onSubmit = async (data: UpdateProjectData) => {
    setError('');
    setIsLoading(true);

    try {
      await projectApi.update(id, data);
      router.push('/projects');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update project');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
    loadClients();
  }, [id]);

  if (isLoadingProject) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!project) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Project not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Project</h1>
        <p className="text-gray-600 mt-1">Update project information</p>
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
          />
          {errors.name && (
            <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Client
          </label>
          <select
            {...register('client_id')}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">No client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            {...register('description')}
            className="w-full px-3 py-2 border rounded-lg"
            rows={3}
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
            defaultValue={project.deadline ? project.deadline.substring(0, 10) : ''}
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
