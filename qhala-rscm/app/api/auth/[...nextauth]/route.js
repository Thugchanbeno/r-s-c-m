import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions";
//handles all things authentication
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
