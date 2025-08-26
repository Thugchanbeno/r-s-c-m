// lib/convexServer.js
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
}

export const convex = new ConvexHttpClient(
  process.env.NEXT_PUBLIC_CONVEX_URL
);

export { api };