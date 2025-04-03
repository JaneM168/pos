
import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import pool from '@/lib/db'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const { rows } = await pool.query(
            'SELECT * FROM admin_users WHERE email = $1',
            [credentials.email]
          )

          const user = rows[0]

          if (!user) {
            return null
          }

          const passwordMatch = await bcrypt.compare(
            credentials.password,
            user.password_hash
          )

          if (!passwordMatch) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            isAdmin: true,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.isAdmin = user.isAdmin
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.isAdmin = token.isAdmin as boolean
      }
      return session
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
}
