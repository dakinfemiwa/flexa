import { mutation, query } from "./_generated/server";
import { requireIdentity, requireUser } from "./lib/auth";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const { user } = await requireUser(ctx);
    return user;
  },
});

export const ensureCurrentUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (query) => query.eq("clerkId", identity.clerkId))
      .unique();

    if (existing) {
      if (existing.name !== identity.name || existing.email !== identity.email) {
        await ctx.db.patch(existing._id, {
          name: identity.name,
          email: identity.email,
        });
      }
      return existing._id;
    }

    return await ctx.db.insert("users", {
      ...identity,
      createdAt: Date.now(),
    });
  },
});
