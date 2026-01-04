'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { taskApi } from '@/lib/api/taskApi';
import { projectApi } from '@/lib/api/projectApi';
import { CreateTaskData, Project } from '@/lib/types';

export default function NewTaskPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTaskData>();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await projectApi.getAll({ limit: 100 });
      setProjects(data.projects);
    } catch (err) {
      console.error('Failed to load projects', err);
    }
  };

  const onSubmit = async (data: CreateTaskData) => {
    setError('');
    setIsLoading(true);

    try {
      await taskApi.create(data);
      router.push('/tasks');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create task');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">New Task</h1>
        <p className="text-gray-600 mt-1">Create a new task</p>
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
            Title *
          </label>
          <input
            type="text"
            {...register('title', { required: 'Title is required' })}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Design homepage mockup"
          />
          {errors.title && (
            <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project *
          </label>
          <select
            {...register('project_id', { required: 'Project is required' })}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">Select a project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
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
            placeholder="Task description..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              {...register('status')}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              {...register('priority')}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date *
            </label>
            <input
              type="date"
              {...register('due_date', { required: 'Due date is required' })}
              className="w-full px-3 py-2 border rounded-lg"
            />
            {errors.due_date && (
              <p className="text-red-600 text-sm mt-1">{errors.due_date.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Hours
            </label>
            <input
              type="number"
              step="0.5"
              {...register('estimated_hours', { valueAsNumber: true, min: { value: 0, message: 'Cannot be negative' } })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="8.0"
            />
            {errors.estimated_hours && (
              <p className="text-red-600 text-sm mt-1">{errors.estimated_hours.message}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Create Task'}
          </button>
          <Link
            href="/tasks"
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-center"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
