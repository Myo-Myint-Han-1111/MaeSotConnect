import { createClient } from "@supabase/supabase-js";

// Simple environment variable access function
function getEnvVariable(key: string): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value;
}

// Create the Supabase client with proper types
const supabaseUrl = getEnvVariable("NEXT_PUBLIC_SUPABASE_URL");
const supabaseAnonKey = getEnvVariable("NEXT_PUBLIC_SUPABASE_ANON_KEY");

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
