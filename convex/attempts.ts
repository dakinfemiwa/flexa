import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser } from "./lib/auth";

export const getForCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const { user } = await requireUser(ctx);
    return await ctx.db
      .query("attempts")
      .withIndex("by_user_created_at", (query) => query.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const record = mutation({
  args: {
    questionId: v.id("questions"),
    submittedAnswer: v.string(),
    timeTaken: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { user } = await requireUser(ctx);
    const question = await ctx.db.get(args.questionId);

    if (!question) {
      throw new Error("Question not found");
    }

    const parsedAnswer = Number(args.submittedAnswer.trim());
    const correct = Number.isFinite(parsedAnswer)
      && Math.abs(parsedAnswer - question.expectedAnswer) <= question.tolerance;
    const createdAt = Date.now();

    const attemptId = await ctx.db.insert("attempts", {
      userId: user._id,
      questionId: question._id,
      submittedAnswer: args.submittedAnswer,
      correct,
      timeTaken: args.timeTaken,
      createdAt,
    });

    const previousProgress = await ctx.db
      .query("studentObjectiveProgress")
      .withIndex("by_user_objective", (query) =>
        query.eq("userId", user._id).eq("learningObjectiveId", question.learningObjectiveId),
      )
      .unique();
    const questionsAttempted = (previousProgress?.questionsAttempted ?? 0) + 1;
    const questionsCorrect = (previousProgress?.questionsCorrect ?? 0) + (correct ? 1 : 0);

    const progress = {
      userId: user._id,
      learningObjectiveId: question.learningObjectiveId,
      masteryEstimate: questionsCorrect / questionsAttempted,
      questionsAttempted,
      questionsCorrect,
      lastAttemptedAt: createdAt,
      updatedAt: createdAt,
    };

    if (previousProgress) {
      await ctx.db.patch(previousProgress._id, progress);
    } else {
      await ctx.db.insert("studentObjectiveProgress", progress);
    }

    return { attemptId, correct, explanation: question.explanation, progress };
  },
});
