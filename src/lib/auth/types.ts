import NextAuth, { DefaultSession } from "next-auth";
import { Role } from "@prisma/client";

declare module "next-auth" {
  interface User {
    role?: Role;
    organizationId?: string | null;
    image?: string;
  }

  interface Session extends DefaultSession {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      role: Role;
      organizationId?: string | null;
    } & DefaultSession["user"];
    
    // Add administrator with the same shape as user
    administrator: {
      id: string;
      name: string;
      email: string;
      image?: string;
      role: Role;
      organizationId?: string | null;
    } & DefaultSession["user"];
  }

  interface JWT {
    role?: Role;
    organizationId?: string | null;
  }
}