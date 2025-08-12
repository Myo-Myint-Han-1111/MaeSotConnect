import { DefaultSession } from "next-auth";
import { Role, UserStatus } from "./roles";

declare module "next-auth" {
  interface User {
    role?: Role;
    image?: string;
    status?: UserStatus;
    organizationId?: string;
  }

  interface Session extends DefaultSession {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      role: Role;
      status?: UserStatus;
      organizationId?: string;
    } & DefaultSession["user"];
  }

  interface JWT {
    role?: Role;
    status?: UserStatus;
    organizationId?: string;
  }
}