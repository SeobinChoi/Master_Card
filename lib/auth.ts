import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import { UserRole } from "@prisma/client"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user && user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
        })

        session.user.id = user.id
        session.user.role = dbUser?.role || UserRole.BUYER
        session.user.sellerApproved = dbUser?.sellerApproved || false
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
})
