// // hooks/useArtistProfile.ts
// import { useEffect, useState } from 'react';
// import { useSessionContext } from '@supabase/auth-helpers-react';
// import { useUser } from './useUser';

// const useGetArtistProfile = () => {
//   const { user } = useUser();
//   const { supabaseClient } = useSessionContext();
//   const [artistProfile, setArtistProfile] = useState<any>(null);

//   useEffect(() => {
//     if (!user) return;

//     const fetchArtist = async () => {
//       const { data, error } = await supabaseClient
//         .from('artists')
//         .select('*')
//         .eq('id', user.id)
//         .single();

//       if (error) {
//         console.error(error);
//       } else {
//         setArtistProfile(data);
//       }
//     };

//     fetchArtist();
//   }, [user, supabaseClient]);

//   return artistProfile;
// };

// export default useGetArtistProfile;
