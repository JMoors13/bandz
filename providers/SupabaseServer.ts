// import { createServerClient } from '@supabase/ssr'
// import { cookies as nextCookies } from 'next/headers'

// export const createSupabaseServerClient = () => {
//   const cookieStore = nextCookies()

//   return createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         async get(name) {
//           const value = (await cookieStore).get(name)
//           return value?.value
//         },
//         set(name, value, options) {
//           // Note: setting cookies from server components is not allowed directly
//           // If needed, use middleware or route handlers for setting
//         },
//         remove(name) {
//           // Same as above: to remove cookies, use a route handler or middleware
//         },
//       },
//     }
//   )
// }
