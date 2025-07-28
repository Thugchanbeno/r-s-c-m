import GoogleProvider from "next-auth/providers/google";
import connectDB from "@/lib/db";
import User from "@/models/User";

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
        await connectDB();
        let dbUser = await User.findOne({ email: user.email });

        if (dbUser) {
          if (
            !dbUser.authProviderId ||
            dbUser.authProviderId === "pending_invite"
          ) {
            dbUser.authProviderId = user.id || account.providerAccountId;
            dbUser.name = user.name || dbUser.name;
            dbUser.avatarUrl = user.image || dbUser.avatarUrl;
            await dbUser.save();
            console.log(
              `Admin-created user ${dbUser.email} has linked their Google account.`
            );
          }
        } else {
          console.log(`User not found (${user.email}). Creating new user...`);
          dbUser = await User.create({
            email: user.email,
            name: user.name || "New User",
            avatarUrl: user.image || "",
            authProviderId: user.id || account.providerAccountId,
            role: "employee",
          });
          console.log(
            `New user ${dbUser.email} created with role: ${dbUser.role}`
          );
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
          await connectDB();
          const dbUser = await User.findOne({ email: user.email });

          if (dbUser) {
            token.id = dbUser._id.toString();
            token.role = dbUser.role;
            token.email = dbUser.email;
            token.picture = dbUser.avatarUrl || user.image;
            token.name = dbUser.name || user.name;

            console.log("JWT token updated with user data, role:", token.role);
          } else {
            console.error("JWT Callback: User signed in but not found in DB");
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

        console.log("Session updated from token, role:", session.user.role);
      }

      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
};
