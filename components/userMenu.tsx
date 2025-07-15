// // components/UserMenu.tsx
// 'use client';

// import { useEffect, useState } from 'react';
// import { supabase } from '@/providers/SupabaseBrowser'; // you’ll create this in step 2

// export default function UserMenu() {
//   const [email, setEmail] = useState<string | null>(null);

//   useEffect(() => {
//     // Get current user
//     supabase.auth.getUser().then(({ data: { user } }) => {
//       setEmail(user?.email ?? null);
//     });
//   }, []);

//   const handleLogout = async () => {
//     await supabase.auth.signOut();
//     location.reload(); // Or use router.push('/login') if you want to redirect
//   };

//   if (!email) return null;

//   return (
//     <div className="p-4 border rounded bg-gray-100">
//       <p className="mb-2">
//         Signed in as: <strong>{email}</strong>
//       </p>
//       <button
//         onClick={handleLogout}
//         className="px-4 py-2 bg-red-500 text-white rounded"
//       >
//         Log out
//       </button>
//     </div>
//   );
// }
