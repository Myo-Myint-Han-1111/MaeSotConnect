// src/lib/auth/password.ts

// Since we're using Google OAuth exclusively, we don't need password functions
// These are non-functional placeholders for type compatibility only
export async function hashPassword(password: string): Promise<string> {
  console.log("Password hashing not implemented - using Google OAuth only");
  // Return a dummy string that will never be used
  return "GOOGLE_OAUTH_ONLY";
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  console.log("Password verification not implemented - using Google OAuth only");
  // Always return false as we never validate passwords
  return false;
}