import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isAuthPage =
        nextUrl.pathname.startsWith("/sign-in") ||
        nextUrl.pathname.startsWith("/sign-up") ||
        nextUrl.pathname.startsWith("/forgot-password")
      const isLandingPage = nextUrl.pathname.startsWith("/landing")

      if (isAuthPage) {
        return true
      }

      if (isLandingPage) {
        return true
      }

      // For all other pages (including / and dashboard pages), require login
      return isLoggedIn
    },
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id
        token.roles = user.roles
        token.isAdmin = user.isAdmin
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.uid as string
        session.user.roles = token.roles ?? []
        session.user.isAdmin = token.isAdmin ?? false
      }
      return session
    },
  },
  providers: [], // Will be populated with actual providers in auth.ts
} satisfies NextAuthConfig
