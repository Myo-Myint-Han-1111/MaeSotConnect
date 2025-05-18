import { handlers } from "@/lib/auth/auth";
export const runtime = "nodejs"; // Force Node.js runtime for this route

export const { GET, POST } = handlers;