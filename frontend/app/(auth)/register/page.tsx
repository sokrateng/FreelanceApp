'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page immediately
    router.replace('/login');
  }, [router]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Registration Closed</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="text-center space-y-4">
          <p className="text-gray-600">
            New user registrations are by invitation only.
          </p>
          <p className="text-sm text-gray-500">
            If you have received an invitation email, please use the link in that email to set up your account.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to login page...
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
