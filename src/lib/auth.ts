import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import User, { IUser } from "@/models/User"; // Make sure this path is correct

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials");
          return null;
        }

        try {
          await connectToDatabase();

          // Debug: Log the email being searched
          console.log("Looking for user with email:", credentials.email);

          // Find user by email
          const user = (await User.findOne({
            email: credentials.email,
          }).lean()) as unknown as IUser;

          if (!user) {
            console.log("User not found with email:", credentials.email);
            return null;
          }

          console.log("User found:", { id: user._id, email: user.email });

          // Compare password
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          console.log("Password validation result:", isPasswordValid);

          if (!isPasswordValid) {
            console.log("Invalid password for user:", credentials.email);
            return null;
          }

          // Return user object
          return {
            id: user._id?.toString() || "",
            email: user.email,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === "development", // Enable debug logs in development
};
