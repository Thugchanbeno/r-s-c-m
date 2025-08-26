import { mutation } from "./_generated/server";
import { v } from "convex/values";

async function getActor(ctx, email) {
  if (!email) throw new Error("Unauthorized: missing email");
  const actor = await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", email))
    .first();
  if (!actor) throw new Error("User not found");
  return actor;
}

export const generateUploadUrl = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    await getActor(ctx, args.email);
    return await ctx.storage.generateUploadUrl();
  },
});

export const getUrl = mutation({
  args: { 
    email: v.string(),
    storageId: v.id("_storage") 
  },
  handler: async (ctx, args) => {
    await getActor(ctx, args.email);
    return await ctx.storage.getUrl(args.storageId);
  },
});