import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    createdAt: v.number(),
  }).index("by_clerk_id", ["clerkId"]),

  learningObjectives: defineTable({
    subject: v.string(),
    topic: v.string(),
    title: v.string(),
    description: v.string(),
    createdAt: v.number(),
  }),

  questions: defineTable({
    learningObjectiveId: v.id("learningObjectives"),
    questionText: v.string(),
    questionType: v.string(),
    difficulty: v.number(),
    expectedAnswer: v.number(),
    tolerance: v.number(),
    explanation: v.string(),
    createdAt: v.number(),
  }).index("by_learning_objective", ["learningObjectiveId"]),

  attempts: defineTable({
    userId: v.id("users"),
    questionId: v.id("questions"),
    submittedAnswer: v.string(),
    correct: v.boolean(),
    timeTaken: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_question", ["questionId"])
    .index("by_user_created_at", ["userId", "createdAt"]),

  studentObjectiveProgress: defineTable({
    userId: v.id("users"),
    learningObjectiveId: v.id("learningObjectives"),
    masteryEstimate: v.number(),
    questionsAttempted: v.number(),
    questionsCorrect: v.number(),
    lastAttemptedAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_objective", ["userId", "learningObjectiveId"]),
});
