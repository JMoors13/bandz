'use client';

import { useRouter } from 'next/navigation';
// import { BiSearch } from 'react-icons/bi';
import { HiHome } from 'react-icons/hi';
// import { RxCaretLeft, RxCaretRight } from 'react-icons/rx';
import { twMerge } from 'tailwind-merge';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { FaUserAlt } from 'react-icons/fa';
// import toast from 'react-hot-toast';

import { useUser } from '@/hooks/useUser';

import Button from './Button';
import useUploadModal from '@/hooks/useUploadModal';
import { useEffect, useState } from 'react';
import { useAuthModal } from '@/providers/AuthProvider';
import useAuthForm from '@/hooks/useAuthForm';

interface HeaderProps {
  className?: string;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ className, onLogout }) => {
  // const { artistName, setEmail, setPassword, setArtistName, setListenerName } =
  //   useAuthModal();

  const { artistName } = useAuthModal();
  const router = useRouter();
  const authModal = useAuthModal();
  const uploadModal = useUploadModal();
  const { user } = useUser();
  const supabaseClient = useSupabaseClient();
  const [isArtist, setIsArtist] = useState(false);
  const { onOpen } = useAuthForm();

  useEffect(() => {
    if (!user) return;

    let attempts = 0;
    const maxAttempts = 10; // Try for 5 seconds (10 * 500ms)
    // console.log('polling');
    const pollProfile = async () => {
      const { data, error } = await supabaseClient
        .from('public_profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (data) {
        setIsArtist(data.role === 'artists');
        // console.log(data.role);
        return; // ✅ Success — stop polling
      }

      if (attempts < maxAttempts) {
        attempts++;
        setTimeout(pollProfile, 500); // retry in 500ms
      } else {
        console.error(
          '❌ Failed to fetch role after several attempts:',
          error?.message,
        );
      }
    };

    pollProfile();
  }, [user, supabaseClient]);

  useEffect(() => {
    console.log('[Header] artistName changed:', artistName);
  }, [artistName]);

  const onClick = () => {
    if (!user) {
      return onOpen();
    }
    return uploadModal.onOpen();
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
        px-6
        py-4
      "
      >
        {user ? 'Welcome ' + artistName + '!' : 'Hey There!'}
      </div>

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
          -mt-24
          "
        >
          {user ? (
            <div className=" flex gap-x-4 items-center ">
              <Button
                onClick={onLogout}
                className="bg-white px-6 py-2 cursor-pointer"
              >
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
                  onClick={() => onOpen('sign_up')}
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
                  onClick={() => onOpen('sign_in')}
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
      {/* {children} */}
    </div>
  );
};

export default Header;
