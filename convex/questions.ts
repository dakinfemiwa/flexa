import { v } from "convex/values";
import { query } from "./_generated/server";
import { requireIdentity } from "./lib/auth";

export const listForObjective = query({
  args: { learningObjectiveId: v.id("learningObjectives") },
  handler: async (ctx, args) => {
    await requireIdentity(ctx);
    const questions = await ctx.db
      .query("questions")
      .withIndex("by_learning_objective", (query) => query.eq("learningObjectiveId", args.learningObjectiveId))
      .order("asc")
      .collect();

    return questions.map((question) => ({
      _id: question._id,
      _creationTime: question._creationTime,
      learningObjectiveId: question.learningObjectiveId,
      questionText: question.questionText,
      questionType: question.questionType,
      difficulty: question.difficulty,
    }));
  },
});
