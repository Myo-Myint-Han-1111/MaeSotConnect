import "next-auth";
import { Role } from "@prisma/client";

declare module "next-auth" {
  interface User {
    role?: Role;
    organizationId?: string | null;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      role: Role;
      organizationId?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
    organizationId?: string | null;
  }
}
