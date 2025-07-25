// import Header from '@/components/Header';
// import PageContent from './components/PageContents';
import getSongs from '@/actions/getSongs';
// import { useSupabaseClient } from '@supabase/auth-helpers-react';
// import { useRouter } from 'next/navigation';
// import toast from 'react-hot-toast';
import AccountPage from './components/AccountPage';

export const revalidate = 0;

export default async function Page() {
  const songs = await getSongs();

  // You'll need to move this logic into a client-side component!
  // This file is marked as `async`, so we can't use hooks here directly.

  return (
    <>
      <AccountPage />
    </>
  );
}
