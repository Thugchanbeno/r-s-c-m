import GoogleProvider from "next-auth/providers/google";
import { convex, api } from "./convexServer";

if (!process.env.GOOGLE_CLIENT_ID) {
  throw new Error("Missing environment variable: GOOGLE_CLIENT_ID");
}
if (!process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error("Missing environment variable: GOOGLE_CLIENT_SECRET");
}
if (!process.env.NEXT_AUTH_SECRET) {
  console.warn(
    "WARN: Missing environment variable NEXTAUTH_SECRET. Using a generated secret in development is possible but insecure for production."
  );
}
if (!process.env.NEXT_AUTH_URL) {
  console.warn(
    "WARN: Missing environment variable NEXTAUTH_URL. This may cause issues with redirects, especially in production/non-localhost environments."
  );
}

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXT_AUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user || !account || !user.email) {
        console.error("Missing user or account information during sign-in.");
        return false;
      }

      try {
        // Check if user exists in Convex
        let dbUser = await convex.query(api.users.getUserByEmail, {
          email: user.email
        });

        if (dbUser) {
          // Update existing user if needed
          if (
            !dbUser.authProviderId ||
            dbUser.authProviderId === "pending_invite"
          ) {
            await convex.mutation(api.users.updateUserAuth, {
              userId: dbUser._id,
              authProviderId: user.id || account.providerAccountId,
              name: user.name || dbUser.name,
              avatarUrl: user.image || dbUser.avatarUrl,
            });
            console.log(
              `Admin-created user ${dbUser.email} has linked their Google account.`
            );
          }
        } else {
          // Create new user
          console.log(`User not found (${user.email}). Creating new user...`);
          await convex.mutation(api.users.createUserFromAuth, {
            email: user.email,
            name: user.name || "New User",
            avatarUrl: user.image || "",
            authProviderId: user.id || account.providerAccountId,
          });
          console.log(`New user ${user.email} created with role: employee`);
        }
        return true;
      } catch (error) {
        console.error("Error during sign-in:", error);
        return false;
      }
    },

    async jwt({ token, user, account, profile, trigger }) {
      if (account && user) {
        console.log("JWT callback: Initial sign-in");

        try {
          // Get user from Convex
          const dbUser = await convex.query(api.users.getUserByEmail, {
            email: user.email
          });

          if (dbUser) {
            token.id = dbUser._id;
            token.role = dbUser.role;
            token.email = dbUser.email;
            token.picture = dbUser.avatarUrl || user.image;
            token.name = dbUser.name || user.name;
            token.department = dbUser.department;
            token.function = dbUser.function;
            token.weeklyHours = dbUser.weeklyHours;

            console.log("JWT token updated with user data, role:", token.role);
          } else {
            console.error("JWT Callback: User signed in but not found in Convex");
          }
        } catch (error) {
          console.error("Error fetching user for JWT:", error);
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.image = token.picture;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.department = token.department;
        session.user.function = token.function;
        session.user.weeklyHours = token.weeklyHours;

        console.log("Session updated from token, role:", session.user.role);
      }

      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
};