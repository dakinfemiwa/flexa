import type { QueryCtx, MutationCtx } from "../_generated/server";

export type AuthenticatedIdentity = {
  clerkId: string;
  name: string;
  email: string;
};

export async function requireIdentity(ctx: QueryCtx | MutationCtx): Promise<AuthenticatedIdentity> {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Unauthenticated");
  }

  return {
    clerkId: identity.subject,
    name: identity.name ?? "Flexa student",
    email: identity.email ?? "",
  };
}

export async function requireUser(ctx: QueryCtx | MutationCtx) {
  const identity = await requireIdentity(ctx);
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (query) => query.eq("clerkId", identity.clerkId))
    .unique();

  if (!user) {
    throw new Error("User profile has not been initialized");
  }

  return { identity, user };
}
