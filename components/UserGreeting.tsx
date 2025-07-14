'use client';

import { useUser } from '@/hooks/useUser';

export default function UserGreeting() {
  const { user } = useUser();

  return (
    <div className="text-white font-medium">
      {user ? `Welcome, ${user.email}` : 'Welcome!'}
    </div>
  );
}
