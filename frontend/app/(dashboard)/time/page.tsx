'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { timeEntryApi } from '@/lib/api/timeEntryApi';
import { projectApi } from '@/lib/api/projectApi';
import { taskApi } from '@/lib/api/taskApi';
import { TimeEntry, TimeEntryStats, Project, Task } from '@/lib/types';

export default function TimePage() {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TimeEntryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('');

  const loadTimeEntries = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedProject) params.project_id = selectedProject;

      const data = await timeEntryApi.getAll(params);
      setTimeEntries(data.timeEntries);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load time entries');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await timeEntryApi.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats', err);
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

  const loadTasks = async () => {
    try {
      const data = await taskApi.getAll({ limit: 100 });
      setTasks(data.tasks);
    } catch (err) {
      console.error('Failed to load tasks', err);
    }
  };

  const deleteTimeEntry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this time entry?')) return;

    try {
      await timeEntryApi.delete(id);
      loadTimeEntries();
      loadStats();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete time entry');
    }
  };

  useEffect(() => {
    loadTimeEntries();
    loadStats();
    loadProjects();
    loadTasks();
  }, [selectedProject]);

  const getProjectName = (projectId: string | null) => {
    if (!projectId) return '-';
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Unknown';
  };

  const getTaskTitle = (taskId: string | null) => {
    if (!taskId) return '-';
    const task = tasks.find(t => t.id === taskId);
    return task?.title || 'Unknown';
  };

  const getTotalHours = () => {
    return timeEntries.reduce((sum, entry) => sum + Number(entry.hours || 0), 0);
  };

  const getBillableHours = () => {
    return timeEntries.filter(e => e.billable).reduce((sum, entry) => sum + Number(entry.hours || 0), 0);
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Time Tracking</h1>
        </div>
        <Link
          href="/time/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Add Time Entry
        </Link>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600">Total</div>
            <div className="text-2xl font-bold">{stats.total.toFixed(1)}h</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600">Today</div>
            <div className="text-2xl font-bold text-blue-600">{stats.today.toFixed(1)}h</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600">This Week</div>
            <div className="text-2xl font-bold text-green-600">{stats.week.toFixed(1)}h</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600">This Month</div>
            <div className="text-2xl font-bold text-purple-600">{stats.month.toFixed(1)}h</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600">Billable</div>
            <div className="text-2xl font-bold text-orange-600">{stats.billable.toFixed(1)}h</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="">All Projects</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Time Entries List */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Recent Entries</h2>
            <div className="text-sm text-gray-600">
              {getTotalHours().toFixed(1)}h total ({getBillableHours().toFixed(1)}h billable)
            </div>
          </div>
        </div>

        <div className="divide-y">
          {timeEntries.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No time entries found. Start tracking your time!
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
                      <p className="text-gray-700 mb-2">{entry.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {entry.project_id && (
                        <span className="text-blue-600">
                          📁 {getProjectName(entry.project_id)}
                        </span>
                      )}
                      {entry.task_id && (
                        <span className="text-purple-600">
                          ✅ {getTaskTitle(entry.task_id)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/time/${entry.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => deleteTimeEntry(entry.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
