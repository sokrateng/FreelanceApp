'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Clock, Folder, Trash2, Pencil } from 'lucide-react';
import { projectApi } from '@/lib/api/projectApi';
import { taskApi } from '@/lib/api/taskApi';
import { Task, TaskStats, Project } from '@/lib/types';

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('');

  const loadTasks = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedProject) params.project_id = selectedProject;

      const data = await taskApi.getAll(params);
      setTasks(data.tasks);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await taskApi.getStats(selectedProject);
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

  const deleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await taskApi.delete(id);
      loadTasks();
      loadStats();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete task');
    }
  };

  const updateTaskStatus = async (id: string, status: string) => {
    try {
      await taskApi.update(id, { status: status as TaskStatus });
      loadTasks();
      loadStats();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update task');
    }
  };

  useEffect(() => {
    loadTasks();
    loadStats();
    loadProjects();
  }, [selectedProject]);

  const columns = [
    { id: 'todo', title: 'To Do', color: 'bg-gray-100' },
    { id: 'in_progress', title: 'In Progress', color: 'bg-blue-100' },
    { id: 'review', title: 'Review', color: 'bg-yellow-100' },
    { id: 'done', title: 'Done', color: 'bg-green-100' },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProjectName = (projectId: string | null) => {
    if (!projectId) return '-';
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Unknown';
  };

  const tasksByStatus = (status: string) => {
    return tasks.filter(t => t.status === status);
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
        </div>
        <Link
          href="/tasks/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Add Task
        </Link>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600">Total</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600">To Do</div>
            <div className="text-2xl font-bold text-gray-600">{stats.todo}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600">In Progress</div>
            <div className="text-2xl font-bold text-blue-600">{stats.in_progress}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600">Review</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.review}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600">Done</div>
            <div className="text-2xl font-bold text-green-600">{stats.done}</div>
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

      {/* Kanban Board */}
      <div className="grid grid-cols-4 gap-4">
        {columns.map((column) => (
          <div key={column.id} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-700">{column.title}</h2>
              <span className="bg-white px-2 py-1 rounded-full text-sm font-medium text-gray-600">
                {tasksByStatus(column.id).length}
              </span>
            </div>

            <div className="space-y-3">
              {tasksByStatus(column.id).map((task) => (
                <div
                  key={task.id}
                  className="bg-white rounded-lg shadow p-4 border-l-4"
                  style={{
                    borderLeftColor: task.priority === 'urgent' ? '#ef4444' :
                                     task.priority === 'high' ? '#f97316' :
                                     task.priority === 'medium' ? '#eab308' :
                                     '#22c55e'
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900 flex-1">{task.title}</h3>
                    <div className="flex gap-1 ml-2">
                      <select
                        value={task.status}
                        onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                        className="text-xs border rounded px-1 py-0.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="review">Review</option>
                        <option value="done">Done</option>
                      </select>
                      <Link
                        href={`/tasks/${task.id}`}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit task"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {task.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{task.description}</p>
                  )}

                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <span className={`px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    {task.due_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(task.due_date).toLocaleDateString()}
                      </span>
                    )}
                    {(task.estimated_hours || task.actual_hours) && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {task.estimated_hours || 0}h / {task.actual_hours || 0}h
                      </span>
                    )}
                  </div>

                  {task.project_id && (
                    <div className="text-xs text-blue-600 flex items-center gap-1">
                      <Folder className="w-3 h-3" />
                      {getProjectName(task.project_id)}
                    </div>
                  )}
                </div>
              ))}

              {tasksByStatus(column.id).length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No tasks
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
