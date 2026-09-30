import { internalMutation } from "./_generated/server";

const starterObjectives = [
  {
    subject: "A-level Maths",
    topic: "Mechanics",
    title: "SUVAT fundamentals",
    description: "Choose and use the right constant-acceleration equation.",
    questionText: "A car accelerates from rest at 3 m/s² for 4 seconds. Find its final speed.",
    expectedAnswer: 12,
    explanation: "Use v = u + at with u = 0, a = 3 and t = 4.",
  },
  {
    subject: "A-level Maths",
    topic: "Mechanics",
    title: "Motion graphs",
    description: "Read and interpret position, velocity, and acceleration representations.",
    questionText: "A velocity-time graph shows a constant velocity of 8 m/s for 5 seconds. Find the displacement.",
    expectedAnswer: 40,
    explanation: "Displacement is the area under the velocity-time graph: 8 x 5.",
  },
];

export const seedStarterData = internalMutation({
  args: {},
  handler: async (ctx) => {
    const createdAt = Date.now();
    const existingObjectives = await ctx.db.query("learningObjectives").collect();
    const created = [];

    for (const starter of starterObjectives) {
      let objective = existingObjectives.find((item) => item.title === starter.title);
      if (!objective) {
        const objectiveId = await ctx.db.insert("learningObjectives", {
          subject: starter.subject,
          topic: starter.topic,
          title: starter.title,
          description: starter.description,
          createdAt,
        });
        objective = await ctx.db.get(objectiveId);
      }

      if (!objective) continue;
      const questions = await ctx.db
        .query("questions")
        .withIndex("by_learning_objective", (query) => query.eq("learningObjectiveId", objective._id))
        .collect();
      if (questions.length === 0) {
        await ctx.db.insert("questions", {
          learningObjectiveId: objective._id,
          questionText: starter.questionText,
          questionType: "numerical",
          difficulty: 1,
          expectedAnswer: starter.expectedAnswer,
          tolerance: 0.01,
          explanation: starter.explanation,
          createdAt,
        });
        created.push(starter.title);
      }
    }

    return { created };
  },
});
