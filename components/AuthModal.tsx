'use client';

import {
  useSessionContext,
  useSupabaseClient,
} from '@supabase/auth-helpers-react';

import { useRouter } from 'next/navigation';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useEffect } from 'react';

import useAuthModal from '@/hooks/useAuthModal';

import Modal from './Modal';

const localization = {
  variables: {
    sign_in: {
      email_label: 'Email',
      password_label: 'Password',
      button_label: 'Log In',
      //   link_text: 'Already have an account? Log in',
      //   social_provider_text: 'Continue with {{provider}}',
      email_input_placeholder: 'email@example.com',
      password_input_placeholder: '••••••••',
      loading_button_label: 'Logging in...',
      //   confirmation_text: 'Check your email for the login link!',
      //   heading: 'Welcome Back!', // 👈 change this
    },
    sign_up: {
      email_label: 'Email',
      password_label: 'Choose a password',
      button_label: 'Sign Up',
      //   link_text: 'Need an account? Sign up',
      email_input_placeholder: 'you@example.com',
      password_input_placeholder: '••••••••',
      //   loading_button_label: 'Creating account...',
      //   confirmation_text: 'Check your email for confirmation!',
      //   heading: 'Create an Account', // 👈 custom heading for sign up
    },
  },
};

const AuthModal = () => {
  const supabaseClient = useSupabaseClient();
  const router = useRouter();
  const { session } = useSessionContext();
  const { onClose, isOpen, view } = useAuthModal();

  useEffect(() => {
    if (session) {
      router.refresh();
      onClose();
    }
  }, [session, router, onClose]);

  const onChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Modal
      title={view === 'sign_in' ? 'Welcome Back!' : 'Join Bandz!'}
      description={view === 'sign_in' ? 'Hiya Buddy!' : 'Create an Account'}
      isOpen={isOpen}
      onChange={onChange}
    >
      <Auth
        key={view}
        localization={localization} // 👈 here
        theme="dark"
        // magicLink
        providers={[]}
        supabaseClient={supabaseClient}
        view={view}
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: '#404040',
                brandAccent: '#22c55e',
              },
            },
          },
        }}
      />
    </Modal>
  );
};

export default AuthModal;
