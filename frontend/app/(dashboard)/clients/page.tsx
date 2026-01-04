'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { clientApi } from '@/lib/api/clientApi';
import { Client, ClientStats } from '@/lib/types';
import { useAuth } from '@/lib/hooks/useAuth';

export default function ClientsPage() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const loadClients = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const data = await clientApi.getAll(params);
      setClients(data.clients);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await clientApi.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats', err);
    }
  };

  const deleteClient = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return;

    try {
      await clientApi.delete(id);
      loadClients();
      loadStats();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete client');
    }
  };

  useEffect(() => {
    loadClients();
    loadStats();
  }, [search, statusFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        </div>
        {user?.role === 'admin' && (
          <Link
            href="/clients/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Add Client
          </Link>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600">Total</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600">Active</div>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600">Inactive</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.inactive}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600">Archived</div>
            <div className="text-2xl font-bold text-gray-600">{stats.archived}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search clients..."
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
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Clients Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {clients.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No clients found. Create your first client to get started.
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{client.name}</td>
                  <td className="px-6 py-4 text-gray-600">{client.email || '-'}</td>
                  <td className="px-6 py-4 text-gray-600">{client.company || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      client.status === 'active' ? 'bg-green-100 text-green-800' :
                      client.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Link
                      href={`/clients/${client.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View
                    </Link>
                    {user?.role === 'admin' && (
                      <>
                        <Link
                          href={`/clients/${client.id}`}
                          className="text-blue-600 hover:text-blue-800 ml-2"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => deleteClient(client.id)}
                          className="text-red-600 hover:text-red-800 ml-2"
                        >
                          Delete
                        </button>
                      </>
                    )}
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
