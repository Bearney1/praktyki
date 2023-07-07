import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from '@prisma/client';
import NextAuth from 'next-auth'
import { Adapter } from "next-auth/adapters";
import GoogleProvider from 'next-auth/providers/google'
const prisma = new PrismaClient();

const handler=NextAuth({
    adapter: PrismaAdapter(prisma) as Adapter<boolean>,
    providers :[
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            profile(profile, tokens) {
                return {
                  id: profile.id,
                  name: profile.name,
                  email: profile.email,
                  image: profile.picture,
                }
            }
        
        })
    ],
    callbacks: {
        async jwt({token, user}) {
            return({...token, ...user})
        }
    }
})

export {handler as GET , handler as POST}
