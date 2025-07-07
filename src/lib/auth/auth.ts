// src/lib/auth/auth.ts
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/db";
import { Role } from "@prisma/client";

// Simple admin emails function
const getAdminEmails = (): string[] => {
  const adminEmailsEnv = process.env.ADMIN_EMAILS || "";
  return adminEmailsEnv
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
};

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      // Place the option here in the provider config
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Always set role to PLATFORM_ADMIN
        token.role = Role.PLATFORM_ADMIN;
        token.organizationId = null; // No organization association
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = Role.PLATFORM_ADMIN; // Always PLATFORM_ADMIN
        session.user.organizationId = null; // No organization association
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      try {
        if (account?.provider === "google" && profile?.email) {
          // Check if email is in the admin emails list
          const adminEmails = getAdminEmails();

          if (adminEmails.includes(profile.email)) {
            user.role = Role.PLATFORM_ADMIN;
            return true; // Allow sign in
          } else {
            console.log(`Access denied for email: ${profile.email}`);
            return false; // Deny sign in
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
  // Add this section to use JWT sessions instead of database sessions
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: false,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

// Export for API route
export const authOptions = authConfig;
