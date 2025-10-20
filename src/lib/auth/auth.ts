// src/lib/auth/auth.ts
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/db";
import { Role, UserStatus } from "./roles";

const _getAdminEmails = (): string[] => {
  const adminEmailsEnv = process.env.ADMIN_EMAILS || "";
  return adminEmailsEnv
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
};

const isAuthorizedAdmin = async (email: string): Promise<boolean> => {
  const adminEmails = _getAdminEmails();
  if (adminEmails.includes(email)) {
    return true;
  }

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

const getUserInfo = async (
  email: string
): Promise<{
  role: Role | null;
  status: UserStatus;
  organizationId?: string;
  userId?: string;
} | null> => {
  try {
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

    const invitation = await prisma.userInvitation.findUnique({
      where: {
        email,
        status: "PENDING",
        expiresAt: { gt: new Date() },
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

// ✅ NEW: Check if user is authorized (has invitation OR is admin OR exists)
const isUserAuthorized = async (email: string): Promise<boolean> => {
  // Check admin first
  const isAdmin = await isAuthorizedAdmin(email);
  if (isAdmin) return true;

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true, status: true },
  });

  if (existingUser && existingUser.status === UserStatus.ACTIVE) {
    return true;
  }

  // Check if has valid invitation
  const invitation = await prisma.userInvitation.findUnique({
    where: {
      email,
      status: "PENDING",
      expiresAt: { gt: new Date() },
    },
  });

  return !!invitation;
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
    async jwt({ token, user, trigger }) {
      if (user?.email || trigger === "update") {
        const email = (user?.email || token.email) as string;
        const isAdmin = await isAuthorizedAdmin(email);

        if (isAdmin) {
          token.role = Role.PLATFORM_ADMIN;
          token.status = UserStatus.ACTIVE;
        } else {
          const userInfo = await getUserInfo(email);
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
      if (url === baseUrl || url === `${baseUrl}/dashboard`) {
        return `${baseUrl}/auth/redirect`;
      }
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },

    // ✅ CRITICAL FIX: Just check authorization, NOTHING ELSE
    async signIn({ user: _user, account, profile }) {
      try {
        if (account?.provider === "google" && profile?.email) {
          const authorized = await isUserAuthorized(profile.email);

          if (!authorized) {
            console.log(`Unauthorized sign-in attempt from: ${profile.email}`);
            return false;
          }

          // ✅ Return true immediately - let PrismaAdapter handle EVERYTHING
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
  },

  events: {
    async createUser({ user }) {
      if (!user.email) return;

      try {
        const isAdmin = await isAuthorizedAdmin(user.email);

        if (isAdmin) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              role: Role.PLATFORM_ADMIN,
              status: UserStatus.ACTIVE,
              lastLoginAt: new Date(),
            },
          });
          return;
        }

        // Check for invitation
        const invitation = await prisma.userInvitation.findFirst({
          where: {
            email: user.email,
            status: "PENDING",
          },
        });

        if (invitation) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              role: invitation.role as Role,
              status: UserStatus.ACTIVE,
              organizationId: invitation.organizationId,
              lastLoginAt: new Date(),
            },
          });

          // Mark invitation as accepted
          await prisma.userInvitation.update({
            where: { id: invitation.id },
            data: {
              status: "ACCEPTED",
            },
          });
        }
      } catch (error) {
        console.error("Error in createUser event:", error);
      }
    },

    async signIn({ user }) {
      if (user?.id) {
        try {
          await prisma.user
            .update({
              where: { id: user.id },
              data: { lastLoginAt: new Date() },
            })
            .catch(() => {
              // Ignore if user doesn't exist yet (will be created by createUser event)
            });
        } catch {
          // Ignore errors
        }
      }
    },
  },

  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },

  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? `__Secure-authjs.session-token`
          : `authjs.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60,
      },
    },
  },

  debug: true, // ✅ Enable debug to see what's happening
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
export const authOptions = authConfig;
