import { query } from "./_generated/server";
import { requireIdentity } from "./lib/auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireIdentity(ctx);
    return await ctx.db.query("learningObjectives").order("asc").collect();
  },
});
