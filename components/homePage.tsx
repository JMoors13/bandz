'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/providers/SupabaseBrowser';
import AuthForm from './authForm';
import toast from 'react-hot-toast';

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      },
    );

    return () => listener?.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    toast.success('Logged out!');
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="bg-black min-h-screen flex items-center justify-center">
      {user ? (
        <div className="p-6 border rounded text-center">
          <p className="mb-4">
            Signed in as: <strong>{user.email}</strong>
          </p>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Log out
          </button>
        </div>
      ) : (
        <AuthForm />
      )}
    </div>
  );
}
