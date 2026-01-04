'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { clientApi } from '@/lib/api/clientApi';
import { projectApi } from '@/lib/api/projectApi';
import { taskApi } from '@/lib/api/taskApi';
import { timeEntryApi } from '@/lib/api/timeEntryApi';
import { ClientStats, ProjectStats, TaskStats, TimeEntryStats } from '@/lib/types';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [clientStats, setClientStats] = useState<ClientStats | null>(null);
  const [projectStats, setProjectStats] = useState<ProjectStats | null>(null);
  const [taskStats, setTaskStats] = useState<TaskStats | null>(null);
  const [timeEntryStats, setTimeEntryStats] = useState<TimeEntryStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [cStats, pStats, tStats, teStats] = await Promise.all([
        clientApi.getStats(),
        projectApi.getStats(),
        taskApi.getStats(),
        timeEntryApi.getStats(),
      ]);
      setClientStats(cStats);
      setProjectStats(pStats);
      setTaskStats(tStats);
      setTimeEntryStats(teStats);
    } catch (err) {
      console.error('Failed to load stats', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.first_name}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your projects today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Clients */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Clients</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {loading ? '-' : clientStats?.total || 0}
              </p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-green-600">
              {clientStats?.active || 0} active
            </p>
          </div>
        </div>

        {/* Projects */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Projects</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {loading ? '-' : projectStats?.active || 0}
              </p>
            </div>
            <div className="text-4xl">📁</div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-green-600">
              {projectStats?.total || 0} total
            </p>
          </div>
        </div>

        {/* Tasks */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Tasks</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {loading ? '-' : (taskStats?.todo || 0) + (taskStats?.in_progress || 0) + (taskStats?.review || 0)}
              </p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-green-600">
              {taskStats?.done || 0} completed
            </p>
          </div>
        </div>

        {/* Hours */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Hours This Week</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {loading ? '-' : timeEntryStats?.week.toFixed(1) || '0.0'}h
              </p>
            </div>
            <div className="text-4xl">⏱️</div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-green-600">
              {timeEntryStats?.today.toFixed(1) || '0.0'}h today
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <a
            href="/clients/new"
            className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition"
          >
            <span className="text-2xl mr-3">➕</span>
            <div>
              <p className="font-medium text-gray-900">Add New Client</p>
              <p className="text-sm text-gray-600">Create a client profile</p>
            </div>
          </a>
          <a
            href="/projects/new"
            className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition"
          >
            <span className="text-2xl mr-3">📁</span>
            <div>
              <p className="font-medium text-gray-900">New Project</p>
              <p className="text-sm text-gray-600">Create a project</p>
            </div>
          </a>
          <a
            href="/tasks/new"
            className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition"
          >
            <span className="text-2xl mr-3">✅</span>
            <div>
              <p className="font-medium text-gray-900">New Task</p>
              <p className="text-sm text-gray-600">Create a task</p>
            </div>
          </a>
          <a
            href="/time/new"
            className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition"
          >
            <span className="text-2xl mr-3">⏱️</span>
            <div>
              <p className="font-medium text-gray-900">Track Time</p>
              <p className="text-sm text-gray-600">Log work hours</p>
            </div>
          </a>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Getting Started</h2>
        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <span className="text-green-500 mr-2">✓</span>
            <span className="text-gray-600">Create your first client</span>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-green-500 mr-2">✓</span>
            <span className="text-gray-600">Create a project for your client</span>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-green-500 mr-2">✓</span>
            <span className="text-gray-600">Add tasks to your project</span>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-green-500 mr-2">✓</span>
            <span className="text-gray-600">Track time on tasks</span>
          </div>
        </div>
      </div>
    </div>
  );
}
