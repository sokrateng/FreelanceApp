'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { projectApi } from '@/lib/api/projectApi';
import { clientApi } from '@/lib/api/clientApi';
import { Project, ProjectStats, Client } from '@/lib/types';
import { useAuth } from '@/lib/hooks/useAuth';

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const loadProjects = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const data = await projectApi.getAll(params);
      setProjects(data.projects);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await projectApi.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats', err);
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

  const deleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      await projectApi.delete(id);
      loadProjects();
      loadStats();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete project');
    }
  };

  const getClientName = (clientId: string | null) => {
    if (!clientId) return '-';
    const client = clients.find(c => c.id === clientId);
    return client?.name || 'Unknown';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    // Just extract the date part and format it nicely without timezone conversion
    const dateOnly = dateString.split('T')[0]; // Get YYYY-MM-DD
    const [year, month, day] = dateOnly.split('-');

    // Format as "Jan 1, 2025"
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthIndex = parseInt(month, 10) - 1;

    return `${months[monthIndex]} ${parseInt(day, 10)}, ${year}`;
  };

  useEffect(() => {
    loadProjects();
    loadStats();
    loadClients();
  }, [search, statusFilter]);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        </div>
        {user?.role === 'admin' && (
          <Link
            href="/projects/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Add Project
          </Link>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600">Total</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600">Planning</div>
            <div className="text-2xl font-bold text-blue-600">{stats.planning}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600">Active</div>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600">On Hold</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.on_hold}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600">Completed</div>
            <div className="text-2xl font-bold text-purple-600">{stats.completed}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="">All Status</option>
          <option value="planning">Planning</option>
          <option value="active">Active</option>
          <option value="on_hold">On Hold</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Projects Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {projects.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No projects found. Create your first project to get started.
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deadline</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{project.name}</div>
                      {project.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">{project.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{getClientName(project.client_id)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {project.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {project.budget ? `$${project.budget.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(project.deadline)}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Link
                      href={`/projects/${project.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => deleteProject(project.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
