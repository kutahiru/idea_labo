// src/auth.ts
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/db"
//sessionsはJWTでするし、verificationTokensは不要
//import { users, accounts, sessions, verificationTokens } from "@/db/schema"
import { users, accounts } from "@/db/schema"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
  }),
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.name = user.name
      }

      // update()が呼ばれた時の処理
      if (trigger === "update" && session?.name) {
        token.name = session.name
      }

      return token
    },
    session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string
      }
      if (token.name) {
        session.user.name = token.name as string
      }
      return session
    },
  },
})