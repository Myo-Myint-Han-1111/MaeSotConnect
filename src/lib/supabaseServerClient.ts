// src/lib/supabaseServerClient.ts
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import { auth } from '@/lib/auth/auth';

// Create a server-side Supabase client with NextAuth session
export async function createSupabaseServerClient() {
  const session = await auth();
  console.log("NextAuth session:", session ? "Found" : "Not found");
  
  if (!session) return null;
  
  try {
    const payload = {
      aud: 'authenticated',
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
      sub: session.user.id,
      email: session.user.email,
      role: session.user.role,
      user_metadata: {
        role: session.user.role
      }
    };
    
    console.log("Creating JWT with payload:", JSON.stringify(payload));
    
    const token = jwt.sign(payload, process.env.SUPABASE_JWT_SECRET || '');
    
    console.log("JWT created successfully");
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    );
    
    // Test authentication
    const { data: { user } } = await supabase.auth.getUser();
    console.log("Authenticated user:", user ? "Found" : "Not found");
    
    return supabase;
  } catch (error) {
    console.error("Error creating Supabase client:", error);
    return null;
  }
}

// Add a service role client
export function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      }
    }
  );
}