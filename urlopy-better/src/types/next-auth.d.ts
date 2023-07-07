import { Session } from "next-auth";

declare module "next-auth" {
    interface Session {
        id: string;
        role: number;
      }
    interface User {
      id: string;
      role: number;
    }
  }

  declare module "next-auth/jwt" {
    interface JWT {
      id: string;
      role: number;
    }
  }
  