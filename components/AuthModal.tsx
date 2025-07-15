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
  const [selectedRole, setSelectedRole] = useState<'artist' | 'listener'>(
    'listener',
  );
  const [artistName, setArtistName] = useState('');
  const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   if (session) {
  //     const user = session.user;

  //     const profile: any = {
  //       id: user.id,
  //       email: user.email,
  //       role: selectedRole,
  //     };

  //     // if (selectedRole === 'artist') {
  //     //   profile.artist_name = artistName;
  //     // }
  //     // console.log(profile.artist_name);

  //     supabase
  //       .from('public_profiles')
  //       .insert([profile])
  //       .then(({ error }) => {
  //         if (error) {
  //           console.error('Profile insert failed:', error.message);
  //           toast.error('Failed to create profile.');
  //         }
  //       });

  //     router.refresh();
  //     onClose();
  //   }
  // }, [session, selectedRole, artistName, supabase, router, onClose]);

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
        // ...(selectedRole === 'artist' && { artist_name: artistName }),
      };

      const { error: profileError } = await supabase
        .from('public_profiles')
        .insert([profile]);

      if (profileError) {
        console.error('Profile insert failed:', profileError.message);
        toast.error('Failed to save profile.');
      } else {
        toast.success('Account created! Check your email.');
        router.refresh();
        onClose();
      }
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
              onClick={() => setSelectedRole('listener')}
              className={`px-4 py-2 rounded ${
                selectedRole === 'listener'
                  ? 'bg-blue-700 text-white'
                  : 'bg-neutral-800 text-gray-300'
              }`}
            >
              Listener
            </button>
            <button
              onClick={() => setSelectedRole('artist')}
              className={`px-4 py-2 rounded ${
                selectedRole === 'artist'
                  ? 'bg-blue-700 text-white'
                  : 'bg-neutral-800 text-gray-300'
              }`}
            >
              Artist
            </button>
          </div>

          {selectedRole === 'artist' && (
            <div className="mb-4">
              <label className="block mb-1 text-sm text-neutral-400">
                Artist Name
              </label>
              <input
                type="text"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                placeholder="e.g. The Hot Funk Band"
                className="w-full px-3 py-2 rounded border border-neutral-700 bg-neutral-900 text-white"
              />
            </div>
          )}
        </>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full px-3 py-2 rounded border border-neutral-700 bg-neutral-900 text-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full px-3 py-2 rounded border border-neutral-700 bg-neutral-900 text-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded bg-green-600 text-white hover:bg-green-700"
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
              className="text-green-500 underline hover:text-green-400"
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
              className="text-green-500 underline hover:text-green-400"
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
