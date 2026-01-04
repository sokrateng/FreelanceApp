'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Clock, Trash2 } from 'lucide-react';
import { taskApi } from '@/lib/api/taskApi';
import { projectApi } from '@/lib/api/projectApi';
import { timeEntryApi } from '@/lib/api/timeEntryApi';
import { Task, Project, UpdateTaskData, TimeEntry } from '@/lib/types';

export default function EditTaskPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTask, setIsLoadingTask] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [task, setTask] = useState<Task | null>(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [timeEntryError, setTimeEntryError] = useState('');
  const [isSubmittingTimeEntry, setIsSubmittingTimeEntry] = useState(false);
  const [newTimeEntry, setNewTimeEntry] = useState({
    hours: '',
    description: '',
    billable: true,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateTaskData>();

  useEffect(() => {
    loadTask();
    loadProjects();
    loadTimeEntries();
  }, [taskId]);

  // Reset form when both task and projects are loaded
  useEffect(() => {
    if (task && projects.length > 0) {
      reset({
        title: task.title,
        project_id: task.project_id || '',
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        due_date: task.due_date ? task.due_date.split('T')[0] : '',
        estimated_hours: task.estimated_hours || 0,
        actual_hours: task.actual_hours || 0,
      });
    }
  }, [task, projects, reset]);

  const loadTask = async () => {
    try {
      setIsLoadingTask(true);
      const data = await taskApi.getById(taskId);
      setTask(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load task');
    } finally {
      setIsLoadingTask(false);
    }
  };

  const loadProjects = async () => {
    try {
      const data = await projectApi.getAll({ limit: 100 });
      setProjects(data.projects);
    } catch (err) {
      console.error('Failed to load projects', err);
    }
  };

  const loadTimeEntries = async () => {
    try {
      const data = await timeEntryApi.getAll({ task_id: taskId });
      setTimeEntries(data.timeEntries);
    } catch (err) {
      console.error('Failed to load time entries', err);
    }
  };

  const addTimeEntry = async () => {
    setTimeEntryError('');
    if (!newTimeEntry.hours || parseFloat(newTimeEntry.hours) <= 0) {
      setTimeEntryError('Hours must be greater than 0');
      return;
    }

    setIsSubmittingTimeEntry(true);
    try {
      await timeEntryApi.create({
        task_id: taskId,
        project_id: task?.project_id || undefined,
        hours: parseFloat(newTimeEntry.hours),
        description: newTimeEntry.description,
        billable: newTimeEntry.billable,
        date: new Date().toISOString().split('T')[0],
      });
      setNewTimeEntry({ hours: '', description: '', billable: true });
      loadTimeEntries();
      // Refresh task to update actual_hours
      loadTask();
    } catch (err: any) {
      setTimeEntryError(err.response?.data?.error || 'Failed to add time entry');
    } finally {
      setIsSubmittingTimeEntry(false);
    }
  };

  const deleteTimeEntry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this time entry?')) return;

    try {
      await timeEntryApi.delete(id);
      loadTimeEntries();
      // Refresh task to update actual_hours
      loadTask();
    } catch (err: any) {
      setTimeEntryError(err.response?.data?.error || 'Failed to delete time entry');
    }
  };

  const getTotalHours = () => {
    return timeEntries.reduce((sum, entry) => sum + Number(entry.hours || 0), 0);
  };

  const onSubmit = async (data: UpdateTaskData) => {
    setError('');
    setIsLoading(true);

    try {
      await taskApi.update(taskId, data);
      router.push('/tasks');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update task');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingTask) {
    return <div className="text-center py-8">Loading task...</div>;
  }

  if (!task) {
    return <div className="text-center py-8">Task not found</div>;
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Task</h1>
        <p className="text-gray-600 mt-1">Update task details</p>
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Actual Hours
          </label>
          <input
            type="number"
            step="0.5"
            {...register('actual_hours', { valueAsNumber: true, min: { value: 0, message: 'Cannot be negative' } })}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="0.0"
          />
          {errors.actual_hours && (
            <p className="text-red-600 text-sm mt-1">{errors.actual_hours.message}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Updating...' : 'Update Task'}
          </button>
          <Link
            href="/tasks"
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-center"
          >
            Cancel
          </Link>
        </div>
      </form>

      {/* Worklog Section */}
      <div className="mt-8 bg-white rounded-lg border">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Worklog
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Total: {getTotalHours().toFixed(1)}h
              </p>
            </div>
            <Link
              href="/time"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View all time entries →
            </Link>
          </div>
        </div>

        {/* Add Time Entry Form */}
        <div className="p-4 border-b bg-gray-50">
          {timeEntryError && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{timeEntryError}</p>
            </div>
          )}
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-2">
              <input
                type="number"
                step="0.5"
                placeholder="Hours"
                value={newTimeEntry.hours}
                onChange={(e) => setNewTimeEntry({ ...newTimeEntry, hours: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                min="0"
              />
            </div>
            <div className="col-span-6">
              <input
                type="text"
                placeholder="Description (optional)"
                value={newTimeEntry.description}
                onChange={(e) => setNewTimeEntry({ ...newTimeEntry, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div className="col-span-2 flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newTimeEntry.billable}
                  onChange={(e) => setNewTimeEntry({ ...newTimeEntry, billable: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">Billable</span>
              </label>
            </div>
            <div className="col-span-2">
              <button
                onClick={addTimeEntry}
                disabled={isSubmittingTimeEntry || !newTimeEntry.hours}
                className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
              >
                {isSubmittingTimeEntry ? 'Adding...' : 'Add'}
              </button>
            </div>
          </div>
        </div>

        {/* Time Entries List */}
        <div className="divide-y max-h-96 overflow-y-auto">
          {timeEntries.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              No worklog entries yet. Add your first time entry above.
            </div>
          ) : (
            timeEntries.map((entry) => (
              <div key={entry.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-lg font-semibold text-gray-900">
                        {entry.hours}h
                      </span>
                      {entry.billable && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                          Billable
                        </span>
                      )}
                      <span className="text-sm text-gray-500">
                        {new Date(entry.date).toLocaleDateString()}
                      </span>
                    </div>
                    {entry.description && (
                      <p className="text-gray-700 text-sm">{entry.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteTimeEntry(entry.id)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete time entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
