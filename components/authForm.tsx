// 'use client';

// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { supabase } from '@/providers/SupabaseBrowser';
// import toast from 'react-hot-toast';

// export default function AuthForm() {
//   const [isRegistering, setIsRegistering] = useState(false);
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [role, setRole] = useState<'artist' | 'listener'>('listener');
//   const [loading, setLoading] = useState(false);
//   const router = useRouter();

//   const toggleMode = () => {
//     setIsRegistering(!isRegistering);
//   };

//   const handleSubmit = async () => {
//     if (!email || !password) {
//       toast.error('Please enter both email and password.');
//       return;
//     }

//     setLoading(true);

//     if (isRegistering) {
//       const { data, error } = await supabase.auth.signUp({ email, password });

//       if (error || !data.user) {
//         toast.error(error?.message || 'Sign-up failed.');
//         setLoading(false);
//         return;
//       }

//       const user = data.user;

//       const { error: profileError } = await supabase
//         .from('public_profiles')
//         .insert({
//           id: user.id,
//           email,
//           role,
//         });

//       if (profileError) {
//         toast.error('Failed to save profile.');
//         setLoading(false);
//         return;
//       }

//       const table = role === 'artist' ? 'artists' : 'listeners';
//       const { error: roleError } = await supabase
//         .from(table)
//         .insert({ id: user.id });

//       if (roleError) {
//         toast.error(`Failed to insert into ${table}.`);
//         setLoading(false);
//         return;
//       }

//       toast.success('Account created! You are now signed in.');
//     } else {
//       const { error } = await supabase.auth.signInWithPassword({
//         email,
//         password,
//       });

//       if (error) {
//         toast.error('Login failed: ' + error.message);
//         setLoading(false);
//         return;
//       }

//       toast.success('Logged in!');
//     }

//     setLoading(false);
//   };

//   return (
//     <div className="p-6 max-w-md mx-auto border rounded shadow">
//       <div className="flex justify-between mb-4">
//         <button
//           className={`px-4 py-2 rounded-full ${
//             !isRegistering ? 'bg-blue-500 text-black' : 'bg-gray-200 text-black'
//           }`}
//           onClick={() => setIsRegistering(false)}
//         >
//           Login
//         </button>
//         <button
//           className={`px-4 py-2 rounded-full ${
//             isRegistering ? 'bg-blue-500 text-black' : 'bg-gray-200 text-black'
//           }`}
//           onClick={() => setIsRegistering(true)}
//         >
//           Register
//         </button>
//       </div>

//       <input
//         type="email"
//         placeholder="Email"
//         className="w-full border p-2 mb-2"
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//       />
//       <input
//         type="password"
//         placeholder="Password"
//         className="w-full border p-2 mb-4"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//       />

//       {isRegistering && (
//         <select
//           value={role}
//           onChange={(e) => setRole(e.target.value as 'artist' | 'listener')}
//           className="w-full border p-2 mb-4"
//         >
//           <option value="listener">Listener</option>
//           <option value="artist">Artist</option>
//         </select>
//       )}

//       <button
//         onClick={handleSubmit}
//         disabled={loading}
//         className="w-full bg-green-600 text-black py-2 rounded-full "
//       >
//         {loading ? 'Processing...' : isRegistering ? 'Register' : 'Login'}
//       </button>
//     </div>
//   );
// }
