'use client';

import { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import Modal from './Modal';
import { useAuthModal } from '@/providers/AuthProvider';
import useAuthForm from '@/hooks/useAuthForm';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const AuthModal = () => {
  const supabase = useSupabaseClient();
  const router = useRouter();
  const {
    artistName,
    setArtistName,
    listenerName,
    setListenerName,
    email,
    setEmail,
    password,
    setPassword,
  } = useAuthModal();

  const { isOpen, onClose, view } = useAuthForm();

  // const [email, setEmail] = useState('');
  // const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'artists' | 'listeners'>(
    'listeners',
  );
  // const [artistName, setArtistName] = useState('');
  // const [listenerName, setListenerName] = useState('');

  // useEffect(() => {
  //   if (!isOpen) {
  //     return;
  //   }

  //   setEmail('');
  //   setPassword('');
  //   setArtistName('');
  //   setListenerName('');

  //   // Set default role when modal is opened
  //   setSelectedRole('listeners');
  // }, [isOpen, view]);

  const onChange = (open: boolean) => {
    if (!open) onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields.');
      return;
    }

    if (view === 'sign_in') {
      // ✅ Only sign in – doesn't create an account
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }
      // await sleep(1000); // Adjust to 1000ms if needed
      // console.log('Waited for DB propagation');
      toast.success('Logged in!');
      router.refresh();
      onClose();
      return;
    }

    // ✅ Sign-up flow
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error || !data.user) {
      toast.error(error?.message || 'Sign-up failed.');
      return;
    }

    // Insert into public_profiles
    const { error: profileError } = await supabase
      .from('public_profiles')
      .insert([{ id: data.user.id, email, role: selectedRole }]);

    if (profileError) {
      console.error('Profile insert failed:', profileError.message);
      toast.error('Failed to save profile.');
      return;
    }

    // Insert into artists or listeners table
    const table = selectedRole === 'artists' ? 'artists' : 'listeners';
    const roleInsertData =
      selectedRole === 'artists'
        ? { id: data.user.id, artist_name: artistName }
        : { id: data.user.id, display_name: listenerName };

    const { error: roleError } = await supabase
      .from(table)
      .insert([roleInsertData]);

    if (roleError) {
      console.error(`Insert failed in ${table} table:`, roleError.message);
      toast.error(`Failed to register in ${table} table.`);
      return;
    }

    // ✅ Optional wait to allow database state to settle (e.g., auth provider fetching artist name)
    await new Promise((res) => setTimeout(res, 500));

    toast.success('Account created! Check your email.');
    onClose();
    router.refresh(); // Refresh to load data that depends on the new session
  };

  return (
    <Modal
      title={view === 'sign_in' ? 'Welcome Back!' : 'Join Bandz!'}
      description={
        view === 'sign_in' ? 'Log in to your account' : 'Create your account'
      }
      isOpen={isOpen}
      onChange={onChange}
    >
      {view === 'sign_up' && (
        <>
          <div className="flex justify-center mb-4 gap-4">
            <button
              onClick={() => setSelectedRole('listeners')}
              className={`px-4 py-2 rounded ${
                selectedRole === 'listeners'
                  ? 'bg-blue-700 text-white '
                  : 'bg-neutral-800 text-gray-300 hover:bg-neutral-700 cursor-pointer'
              }`}
            >
              Listener
            </button>
            <button
              onClick={() => setSelectedRole('artists')}
              className={`px-4 py-2 rounded ${
                selectedRole === 'artists'
                  ? 'bg-blue-700 text-white'
                  : 'bg-neutral-800 text-gray-300 hover:bg-neutral-700 cursor-pointer'
              }`}
            >
              Artist
            </button>
          </div>
        </>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Only show this input when signing up */}
        {view === 'sign_up' && (
          <input
            type="text"
            value={selectedRole === 'artists' ? artistName : listenerName}
            onChange={(e) =>
              selectedRole === 'artists'
                ? setArtistName(e.target.value)
                : setListenerName(e.target.value)
            }
            placeholder={
              selectedRole === 'artists'
                ? 'e.g. The Red Hot Chili Peppers'
                : 'Username'
            }
            className="w-full px-3 py-2 rounded border border-neutral-700 bg-neutral-900 text-neutral-500"
          />
        )}

        <input
          type="email"
          placeholder="Email@email.com"
          className="w-full px-3 py-2 rounded border border-neutral-700 bg-neutral-900 text-neutral-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full px-3 py-2 rounded border border-neutral-700 bg-neutral-900 text-neutral-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="cursor-pointer w-full py-2 rounded bg-blue-700 text-white hover:bg-blue-900"
        >
          {view === 'sign_in' ? 'Log In' : 'Sign Up'}
        </button>
      </form>

      <div className="mt-4 text-center text-sm text-neutral-400">
        {view === 'sign_in' ? (
          <>
            Don't have an account?{' '}
            <button
              type="button"
              className="cursor-pointer text-blue-700 underline hover:text-blue-700 "
              onClick={() => useAuthForm.getState().setView('sign_up')}
            >
              Sign up.
            </button>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <button
              type="button"
              className="text-blue-700 cursor-pointer underline hover:text-blue-700"
              onClick={() => useAuthForm.getState().setView('sign_in')}
            >
              Log in.
            </button>
          </>
        )}
      </div>
    </Modal>
  );
};

export default AuthModal;
