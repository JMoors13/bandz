'use client';
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useUser } from '@/hooks/useUser';

interface AuthFormContextType {
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  artistName: string;
  setArtistName: (val: string) => void;
  listenerName: string;
  setListenerName: (val: string) => void;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const AuthFormContext = createContext<AuthFormContextType | undefined>(
  undefined,
);

export const AuthFormProvider = ({ children }: { children: ReactNode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [artistName, setArtistName] = useState('');
  const [listenerName, setListenerName] = useState('');
  const [version, setVersion] = useState(0); // ✅ New

  const { user } = useUser();
  const supabaseClient = useSupabaseClient();

  useEffect(() => {
    if (!user) {
      console.log('[AuthProvider] No user yet');
      return;
    }

    const fetchArtistName = async () => {
      console.log('[AuthProvider] Fetching artist name for user:', user.id);

      // Wait for database creation of new account before retrieval
      await sleep(500);

      const { data, error } = await supabaseClient
        .from('artists')
        .select('artist_name')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Failed to fetch artist_name:', error.message);
        return;
      }

      if (data?.artist_name) {
        console.log('[AuthProvider] Fetched artist name:', data.artist_name);
        const formattedName =
          data.artist_name.charAt(0).toUpperCase() + data.artist_name.slice(1);
        setArtistName(formattedName);
        setVersion((prev) => prev + 1); // ✅ Trigger context update
      }
    };

    fetchArtistName();
  }, [user, supabaseClient]);

  // ✅ Recompute context when any part changes
  const contextValue = useMemo(
    () => ({
      email,
      setEmail,
      password,
      setPassword,
      artistName,
      setArtistName,
      listenerName,
      setListenerName,
    }),
    [email, password, artistName, listenerName],
  );

  return (
    <AuthFormContext.Provider value={contextValue}>
      {children}
    </AuthFormContext.Provider>
  );
};

export const useAuthModal = () => {
  const context = useContext(AuthFormContext);
  if (!context) {
    throw new Error('useAuthModal must be used within an AuthFormProvider');
  }
  return context;
};
