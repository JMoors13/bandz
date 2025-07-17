'use client';

import { useState, useEffect } from 'react';
import {
  useSessionContext,
  useSupabaseClient,
} from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import useAuthModal from '@/hooks/useAuthModal';
import Modal from './Modal';

const AuthModal = () => {
  const supabase = useSupabaseClient();
  const router = useRouter();
  const { session } = useSessionContext();
  const { isOpen, onClose, view } = useAuthModal();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'artists' | 'listeners'>(
    'listeners',
  );
  const [artistName, setArtistName] = useState('');
  const [listenerName, setListenerName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setEmail('');
    setPassword('');
    setArtistName('');
    setListenerName('');

    //Set default selection
    setSelectedRole('listeners');
  }, [view, selectedRole]);

  const onChange = (open: boolean) => {
    if (!open) onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields.');
      return;
    }

    setLoading(true);

    if (view === 'sign_in') {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Logged in!');
        router.refresh();
        onClose();
      }
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error || !data.user) {
        toast.error(error?.message || 'Sign-up failed.');
        setLoading(false);
        return;
      }

      // Insert profile only if signup was successful
      const profile = {
        id: data.user.id,
        email,
        role: selectedRole,
      };

      const { error: profileError } = await supabase
        .from('public_profiles')
        .insert([profile]);

      if (profileError) {
        console.error('Profile insert failed:', profileError.message);
        toast.error('Failed to save profile.');
      } else {
      }

      // Insert into either artist or listener table
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
        setLoading(false);
        return;
      }
      toast.success('Account created! Check your email.');
      onClose();
    }

    setLoading(false);
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
          disabled={loading}
          className="cursor-pointer w-full py-2 rounded bg-blue-700 text-white hover:bg-blue-900"
        >
          {loading
            ? 'Processing...'
            : view === 'sign_in'
            ? 'Log In'
            : 'Sign Up'}
        </button>
      </form>

      <div className="mt-4 text-center text-sm text-neutral-400">
        {view === 'sign_in' ? (
          <>
            Don't have an account?{' '}
            <button
              type="button"
              className="cursor-pointer text-blue-700 underline hover:text-blue-700 "
              onClick={() => useAuthModal.getState().setView('sign_up')}
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
              onClick={() => useAuthModal.getState().setView('sign_in')}
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
