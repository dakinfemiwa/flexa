import { query } from "./_generated/server";
import { requireUser } from "./lib/auth";

export const getForCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const { user } = await requireUser(ctx);
    return await ctx.db
      .query("studentObjectiveProgress")
      .withIndex("by_user", (query) => query.eq("userId", user._id))
      .collect();
  },
});
