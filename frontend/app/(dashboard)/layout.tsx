'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/authStore';
import { useAuth } from '@/lib/hooks/useAuth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();
  const { logout } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait for hydration to complete
    if (_hasHydrated) {
      setIsReady(true);
    }
  }, [_hasHydrated]);

  useEffect(() => {
    // Only redirect after hydration is complete
    if (isReady && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isReady, router]);

  // Show loading state while hydrating
  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // Show nothing if not authenticated after hydration
  if (!isAuthenticated || !user) {
    return null;
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Clients', href: '/clients', icon: '👥' },
    { name: 'Projects', href: '/projects', icon: '📁' },
    { name: 'Tasks', href: '/tasks', icon: '✅' },
    { name: 'Worklog', href: '/time', icon: '⏱️' },
    ...(user.role === 'admin' ? [{ name: 'Users', href: '/users', icon: '👥' }] : []),
    { name: 'Profile', href: '/profile', icon: '👤' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 border-b">
            <h1 className="text-xl font-bold text-gray-900">Freelance PM</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-lg transition ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className="flex-1"
              >
                <p className="text-sm font-medium text-gray-900 hover:text-blue-600">
                  {user.first_name} {user.last_name}
                </p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </Link>
              <button
                onClick={logout}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
