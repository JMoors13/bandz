import { Song } from "@/types";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const getSongs = async (): Promise<Song[]> => {
    const cookieStore = cookies(); // ✅ await it

    const supabase = createServerComponentClient({
        cookies: () => cookieStore // ✅ pass a function that returns the cookies
    });

    const { data, error } = await supabase
        .from("songs")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error(error);
    }

    return data || [];
};

export default getSongs;
