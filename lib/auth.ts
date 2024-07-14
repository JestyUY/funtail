// lib/auth.ts
// lib/auth.ts

import NextAuth from "next-auth"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "../src/db"
import GitHubProvider from "next-auth/providers/github"


export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
 
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      console.log("Sign-in attempt:", { user, account, profile, email })
      return true
    },
  },
  debug: process.env.NODE_ENV === "development",
  logger: {
    error: (code) => {
      console.error(code)
    },
    warn: (code) => {
      console.warn(code)
    },
    debug: (code, metadata) => {
      console.debug(code, metadata)
    },
  },
})