'use client';

import { useRouter } from 'next/navigation';
import { BiSearch } from 'react-icons/bi';
import { HiHome } from 'react-icons/hi';
import { RxCaretLeft, RxCaretRight } from 'react-icons/rx';
import { twMerge } from 'tailwind-merge';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { FaUserAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';

import useAuthModal from '@/hooks/useAuthModal';
import { useUser } from '@/hooks/useUser';

import Button from './Button';
import useUploadModal from '@/hooks/useUploadModal';
import { useEffect, useState } from 'react';

interface HeaderProps {
  children: React.ReactNode;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ children, className }) => {
  const router = useRouter();
  const authModal = useAuthModal();
  const uploadModal = useUploadModal();
  const { user } = useUser();
  const supabaseClient = useSupabaseClient();
  const [isArtist, setIsArtist] = useState(false);

  useEffect(() => {
    const fetchRole = async () => {
      if (!user) return;
      const { data, error } = await supabaseClient
        .from('public_profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching role:', error.message);
        return;
      }

      setIsArtist(data?.role === 'artists');
    };

    fetchRole();
  }, [user, supabaseClient]);

  const onClick = () => {
    if (!user) {
      return authModal.onOpen();
    }
    return uploadModal.onOpen();
  };

  const handleLogout = async () => {
    const { error } = await supabaseClient.auth.signOut();
    // TODO: Reset any playing songs
    router.refresh();

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Logged out!');
    }
  };

  return (
    <div
      className={twMerge(
        `
    h-fit
    bg-gradient-to-b
    from-blue-700
    p-8
    `,
        className,
      )}
    >
      <div
        className="
        w-full
        mb-4
        flex
        items-center
        justify-between
        "
      >
        <div>
          {isArtist && user ? (
            <>
              {' '}
              <Button
                onClick={onClick}
                className="
              text-black
              cursor-pointer
              px-6
              py-2
            "
              >
                Add Song
              </Button>
            </>
          ) : (
            <></>
          )}
        </div>
        <div
          className="
            flex
            md:hidden
            gap-x-2
            items-center
          "
        >
          <button
            onClick={() => router.push('/')}
            className="
            rounded-full
            p-2
            bg-white
            flex
            items-center
            justify-center
            hover:opacity-75
            transition
            "
          >
            <HiHome className="text-black" size={20} />
          </button>
        </div>
        <div
          className="
          flex
          justify-between
          items-center
          gap-x-4
          ml-auto
          "
        >
          {user ? (
            <div className=" flex gap-x-4 items-center ">
              <Button onClick={handleLogout} className="bg-white px-6 py-2">
                Logout
              </Button>
              <Button
                // onClick={() => router.push('/account')}
                className="bg-white"
              >
                <FaUserAlt />
              </Button>
            </div>
          ) : (
            <>
              <div>
                <Button
                  onClick={() => authModal.onOpen('sign_up')}
                  className="
                    bg-white
                    text-black
                    cursor-pointer
                    px-6
                    py-2
                  "
                >
                  Sign Up
                </Button>
              </div>
              <div>
                <Button
                  onClick={() => authModal.onOpen('sign_in')}
                  className="
                    bg-white
                    text-black
                    cursor-pointer
                    px-6
                    py-2
                  "
                >
                  Log in
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
      {children}
    </div>
  );
};

export default Header;
