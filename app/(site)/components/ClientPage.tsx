'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import toast from 'react-hot-toast';

import Header from '@/components/Header';
import PageContent from './PageContents';
import { useAuthModal } from '@/providers/AuthProvider';

interface ClientPageProps {
  songs: any[];
}

export default function ClientPage({ songs }: ClientPageProps) {
  const { artistName, setEmail, setPassword, setArtistName, setListenerName } =
    useAuthModal();

  const supabaseClient = useSupabaseClient();
  const router = useRouter();

  const handleLogout = async () => {
    const { error } = await supabaseClient.auth.signOut();
    setEmail('');
    setPassword('');
    setArtistName('');
    setListenerName('');
    router.refresh();

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Logged out!');
    }
  };

  return (
    <>
      <Header onLogout={handleLogout} />
      <div className="mt-2 mb-7 px-6">
        <div className="flex justify-between items-center">
          <h1 className="text-white text-2xl font-semibold">Newest Songs</h1>
        </div>
        <PageContent songs={songs} />
      </div>
    </>
  );
}
