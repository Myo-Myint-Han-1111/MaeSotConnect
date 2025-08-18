// src/lib/auth/auth.ts
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/db";
import { Role, UserStatus } from "./roles";

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

// Get user role and info from database
const getUserInfo = async (email: string): Promise<{
  role: Role | null;
  status: UserStatus;
  organizationId?: string;
  userId?: string;
} | null> => {
  try {
    // Check if user exists in database
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        role: true,
        status: true,
        organizationId: true,
      },
    });

    if (user) {
      return {
        role: user.role as Role,
        status: user.status as UserStatus,
        organizationId: user.organizationId || undefined,
        userId: user.id,
      };
    }

    // Check if user has pending invitation
    const invitation = await prisma.userInvitation.findUnique({
      where: { 
        email,
        status: "PENDING",
        expiresAt: { gt: new Date() }
      },
    });

    if (invitation) {
      return {
        role: invitation.role as Role,
        status: UserStatus.ACTIVE,
        organizationId: invitation.organizationId || undefined,
      };
    }

    return null;
  } catch (error) {
    console.error("Error getting user info:", error);
    return null;
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
        // First check if user is authorized admin (legacy support)
        const isAdmin = await isAuthorizedAdmin(user.email);
        
        if (isAdmin) {
          token.role = Role.PLATFORM_ADMIN;
          token.status = UserStatus.ACTIVE;
        } else {
          // Check if user has other roles (Youth Advocate, etc.)
          const userInfo = await getUserInfo(user.email);
          if (userInfo) {
            token.role = userInfo.role;
            token.status = userInfo.status;
            token.organizationId = userInfo.organizationId;
          } else {
            token.role = null;
            token.status = UserStatus.INACTIVE;
          }
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = token.role as Role;
        session.user.status = token.status as UserStatus;
        session.user.organizationId = token.organizationId as string;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // If redirecting after signin, redirect based on role
      if (url === baseUrl || url === `${baseUrl}/dashboard`) {
        // For role-based redirects after signin, we'll redirect to a landing page
        // that will handle the role-based routing
        return `${baseUrl}/auth/redirect`;
      }
      
      // If it's a relative URL, make it absolute
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      
      // If it's the same origin, allow it
      if (new URL(url).origin === baseUrl) return url;
      
      // Default to base URL
      return baseUrl;
    },

    async signIn({ user, account, profile }) {
      try {
        if (account?.provider === "google" && profile?.email) {
          // Check if the email is authorized as admin (legacy support)
          const isAdmin = await isAuthorizedAdmin(profile.email);

          if (isAdmin) {
            // Update user record and set role
            await prisma.user.upsert({
              where: { email: profile.email },
              update: {
                role: Role.PLATFORM_ADMIN,
                lastLoginAt: new Date(),
                name: profile.name || "",
                image: profile.picture,
              },
              create: {
                id: crypto.randomUUID(),
                email: profile.email,
                name: profile.name || "",
                image: profile.picture,
                role: Role.PLATFORM_ADMIN,
                lastLoginAt: new Date(),
                updatedAt: new Date(),
              },
            });
            
            user.role = Role.PLATFORM_ADMIN;
            user.status = UserStatus.ACTIVE;
            return true;
          }

          // Check if user has other roles (Youth Advocate, etc.)
          const userInfo = await getUserInfo(profile.email);
          
          if (userInfo && userInfo.status === UserStatus.ACTIVE) {
            // If user has invitation, accept it and create user record
            if (!userInfo.userId) {
              await prisma.user.create({
                data: {
                  id: crypto.randomUUID(),
                  email: profile.email,
                  name: profile.name || "",
                  image: profile.picture,
                  role: userInfo.role!,
                  organizationId: userInfo.organizationId,
                  lastLoginAt: new Date(),
                  status: UserStatus.ACTIVE,
                  updatedAt: new Date(),
                },
              });

              // Mark invitation as accepted
              await prisma.userInvitation.updateMany({
                where: { 
                  email: profile.email,
                  status: "PENDING" 
                },
                data: { 
                  status: "ACCEPTED" 
                },
              });
            } else {
              // Update existing user's last login
              await prisma.user.update({
                where: { id: userInfo.userId },
                data: { 
                  lastLoginAt: new Date(),
                  name: profile.name || "",
                  image: profile.picture,
                },
              });
            }

            if (userInfo.role) {
              user.role = userInfo.role;
            }
            if (userInfo.status) {
              user.status = userInfo.status;
            }
            user.organizationId = userInfo.organizationId;
            return true;
          }

          // Reject unauthorized users
          console.log(`Unauthorized sign-in attempt from: ${profile.email}`);
          return false;
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
    updateAge: 24 * 60 * 60, // Update session every 24 hours if user is active
  },
  
  // Enhanced security settings
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' 
        ? `__Secure-authjs.session-token` 
        : `authjs.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // Match session maxAge
      },
    },
  },
  
  debug: false,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

// Export for API route
export const authOptions = authConfig;
