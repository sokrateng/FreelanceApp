'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { timeEntryApi } from '@/lib/api/timeEntryApi';
import { projectApi } from '@/lib/api/projectApi';
import { taskApi } from '@/lib/api/taskApi';
import { CreateTimeEntryData, Project, Task } from '@/lib/types';

export default function NewTimeEntryPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CreateTimeEntryData>();

  const projectId = watch('project_id');

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadTasks(selectedProject);
    } else {
      setTasks([]);
    }
  }, [selectedProject]);

  const loadProjects = async () => {
    try {
      const data = await projectApi.getAll({ limit: 100 });
      setProjects(data.projects);
    } catch (err) {
      console.error('Failed to load projects', err);
    }
  };

  const loadTasks = async (projectId: string) => {
    try {
      const data = await taskApi.getAll({ project_id: projectId, limit: 100 });
      setTasks(data.tasks);
    } catch (err) {
      console.error('Failed to load tasks', err);
    }
  };

  const onSubmit = async (data: CreateTimeEntryData) => {
    setError('');
    setIsLoading(true);

    try {
      await timeEntryApi.create(data);
      router.push('/time');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create time entry');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">New Time Entry</h1>
        <p className="text-gray-600 mt-1">Track your work hours</p>
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
            Hours Worked *
          </label>
          <input
            type="number"
            step="0.25"
            min="0.25"
            max="24"
            {...register('hours', {
              required: 'Hours is required',
              valueAsNumber: true,
              min: { value: 0.25, message: 'Minimum 0.25 hours' },
              max: { value: 24, message: 'Maximum 24 hours' },
            })}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="2.0"
          />
          {errors.hours && (
            <p className="text-red-600 text-sm mt-1">{errors.hours.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date *
          </label>
          <input
            type="date"
            {...register('date', { required: 'Date is required' })}
            className="w-full px-3 py-2 border rounded-lg"
            defaultValue={new Date().toISOString().split('T')[0]}
          />
          {errors.date && (
            <p className="text-red-600 text-sm mt-1">{errors.date.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project
          </label>
          <select
            {...register('project_id')}
            className="w-full px-3 py-2 border rounded-lg"
            onChange={(e) => setSelectedProject(e.target.value)}
          >
            <option value="">No project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        {selectedProject && tasks.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task
            </label>
            <select
              {...register('task_id')}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">No task</option>
              {tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            {...register('description')}
            className="w-full px-3 py-2 border rounded-lg"
            rows={3}
            placeholder="What did you work on?"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            {...register('billable')}
            defaultChecked={true}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label className="ml-2 text-sm text-gray-700">
            Billable hours
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Create Time Entry'}
          </button>
          <Link
            href="/time"
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-center"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
