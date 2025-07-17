import { Figtree } from 'next/font/google';

import './globals.css';

import { Toaster } from 'react-hot-toast';
// import { AuthProvider } from '../providers/AuthProvider';
import UserProvider from '@/providers/UserProvider';
import ModalProvider from '@/providers/ModalProvider';
import SupabaseProvider from '@/providers/SupabaseProvider';
import ToasterProvider from '@/providers/ToasterProvider';
import Player from '@/components/Player';

const font = Figtree({
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="">
        <ToasterProvider />
        <SupabaseProvider>
          <UserProvider>
            <ModalProvider />
            {children}
            <Player />
          </UserProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
