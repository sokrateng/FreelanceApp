'use client';

import { useState, useEffect } from 'react';
import { authApi, UserWithInviteStatus } from '@/lib/api/auth';
import { clientApi } from '@/lib/api/clientApi';
import { useAuthStore } from '@/lib/store/authStore';
import { Client } from '@/lib/types';

export default function UsersPage() {
  const { user } = useAuthStore();
  const [users, setUsers] = useState<UserWithInviteStatus[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithInviteStatus | null>(null);
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [inviteData, setInviteData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: 'user' as 'admin' | 'user',
    client_ids: [] as string[],
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  // Check if user is admin
  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Access Denied. Admin only.</p>
      </div>
    );
  }

  const loadUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const data = await authApi.getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setIsLoadingUsers(false);
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

  useEffect(() => {
    loadUsers();
    loadClients();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await authApi.inviteUser(inviteData);
      setSuccess(`Invitation sent to ${inviteData.email}`);
      setInviteData({ email: '', first_name: '', last_name: '', role: 'user', client_ids: [] });
      setSelectedClientIds([]);
      setIsInviteModalOpen(false);
      // Reload users to show the new pending user
      loadUsers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send invitation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = async (user: UserWithInviteStatus) => {
    setEditingUser(user);
    setSelectedClientIds([]);
    setError('');
    try {
      const data = await authApi.getUserClients(user.id);
      setSelectedClientIds(data.client_ids);
      setIsEditModalOpen(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load user clients');
    }
  };

  const handleUpdateUserClients = async () => {
    if (!editingUser) return;

    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await authApi.updateUserClients(editingUser.id, selectedClientIds);
      setSuccess(`Client assignments updated for ${editingUser.first_name} ${editingUser.last_name}`);
      setIsEditModalOpen(false);
      setEditingUser(null);
      setSelectedClientIds([]);
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update client assignments');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleClient = (clientId: string) => {
    setSelectedClientIds(prev =>
      prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const toggleInviteClient = (clientId: string) => {
    setInviteData(prev => ({
      ...prev,
      client_ids: prev.client_ids.includes(clientId)
        ? prev.client_ids.filter(id => id !== clientId)
        : [...prev.client_ids, clientId],
    }));
  };

  const handleResendInvite = async (userId: string, userEmail: string) => {
    setError('');
    setSuccess('');

    try {
      await authApi.resendInvite(userId);
      setSuccess(`New invitation sent to ${userEmail}`);
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to resend invitation');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      await authApi.deleteUser(userId);
      setSuccess(`User ${userName} deleted successfully`);
      setTimeout(() => setSuccess(''), 5000);
      // Refresh users list
      loadUsers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete user');
    }
  };

  const getStatusBadge = (user: UserWithInviteStatus) => {
    if (user.is_pending) {
      const isExpired = user.invite_token_expiry && new Date(user.invite_token_expiry) < new Date();
      if (isExpired) {
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Expired</span>;
      }
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
    }
    if (!user.is_active) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Inactive</span>;
    }
    return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Active</span>;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 mt-1">Manage team members</p>
        </div>
        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Invite User
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">{success}</p>
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        {isLoadingUsers ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No users yet. Invite your first team member!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invite Expiry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {u.first_name} {u.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{u.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 capitalize">{u.role}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(u)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {u.invite_token_expiry ? formatDate(u.invite_token_expiry.toString()) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(u.created_at.toString())}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditUser(u)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Edit Clients
                      </button>
                      {u.is_pending && (
                        <button
                          onClick={() => handleResendInvite(u.id, u.email)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Resend Invite
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteUser(u.id, `${u.first_name} ${u.last_name}`)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Invite User</h2>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={inviteData.first_name}
                  onChange={(e) => setInviteData({ ...inviteData, first_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={inviteData.last_name}
                  onChange={(e) => setInviteData({ ...inviteData, last_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={inviteData.email}
                  onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={inviteData.role}
                  onChange={(e) => setInviteData({ ...inviteData, role: e.target.value as 'admin' | 'user' })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned Clients
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                  {clients.length === 0 ? (
                    <p className="text-gray-500 text-sm">No clients available. Please create a client first.</p>
                  ) : (
                    clients.map((client) => (
                      <label key={client.id} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={inviteData.client_ids.includes(client.id)}
                          onChange={() => toggleInviteClient(client.id)}
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
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? 'Sending...' : 'Send Invitation'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Clients Modal */}
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Edit Clients - {editingUser.first_name} {editingUser.last_name}
            </h2>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned Clients
                </label>
                <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-3">
                  {clients.length === 0 ? (
                    <p className="text-gray-500 text-sm">No clients available.</p>
                  ) : (
                    clients.map((client) => (
                      <label key={client.id} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={selectedClientIds.includes(client.id)}
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
                <p className="text-xs text-gray-500 mt-1">
                  {selectedClientIds.length} client{selectedClientIds.length !== 1 ? 's' : ''} selected
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleUpdateUserClients}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingUser(null);
                    setSelectedClientIds([]);
                    setError('');
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
