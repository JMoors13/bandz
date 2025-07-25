'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/hooks/useUser';
import { useAuthModal } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

const AccountPage = () => {
  const { user } = useUser();
  const { email, artistName, listenerName } = useAuthModal();
  const [role, setRole] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/'); // Redirect if not logged in
    }

    // Determine role from which name exists
    if (artistName) setRole('Artist');
    else if (listenerName) setRole('Listener');
  }, [user, artistName, listenerName, router]);

  if (!user) return null;

  return (
    <>
      <Header onLogout={() => {}} />
      <div className="p-6 max-w-xl mx-auto text-white">
        <h1 className="text-3xl font-bold mb-4">Your Profile</h1>

        <div className="space-y-4">
          <div>
            <span className="font-semibold">Email:</span> {email}
          </div>

          <div>
            <span className="font-semibold">Role:</span> {role}
          </div>

          <div>
            <span className="font-semibold">
              {role === 'Artist' ? 'Artist Name:' : 'Listener Name:'}
            </span>{' '}
            {role === 'Artist' ? artistName : listenerName}
          </div>
        </div>
      </div>
    </>
  );
};

export default AccountPage;
