// src/lib/auth/auth.ts
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/db";
import { Role } from "./roles";

// Simple admin emails function
const _getAdminEmails = (): string[] => {
  const adminEmailsEnv = process.env.ADMIN_EMAILS || "";
  return adminEmailsEnv
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
};

// Check if email is authorized as admin
const isAuthorizedAdmin = async (email: string): Promise<boolean> => {
  // Check environment variable first
  const adminEmails = _getAdminEmails();
  if (adminEmails.includes(email)) {
    return true;
  }

  // Check database allowlist
  try {
    const allowlistEntry = await prisma.adminAllowList.findUnique({
      where: { email },
    });
    return !!allowlistEntry;
  } catch (error) {
    console.error("Error checking admin allowlist:", error);
    return false;
  }
};

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user && user.email) {
        // Check if user is authorized admin
        const isAdmin = await isAuthorizedAdmin(user.email);

        if (isAdmin) {
          token.role = Role.PLATFORM_ADMIN;
        } else {
          token.role = null;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = token.role as Role;
      }
      return session;
    },

    async signIn({ user, account, profile }) {
      try {
        if (account?.provider === "google" && profile?.email) {
          // Check if the email is authorized as admin
          const isAdmin = await isAuthorizedAdmin(profile.email);

          if (isAdmin) {
            // Set the role for authorized admins
            user.role = Role.PLATFORM_ADMIN;
            return true;
          } else {
            // Reject non-admin users
            console.log(`Unauthorized sign-in attempt from: ${profile.email}`);
            return false;
          }
        }
        return false;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: false,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

// Export for API route
export const authOptions = authConfig;
