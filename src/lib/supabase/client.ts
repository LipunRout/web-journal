import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { SUPABASE_KEY, SUPABASE_URL } from "./env";

export const supabase = createBrowserClient<Database>(SUPABASE_URL, SUPABASE_KEY);
