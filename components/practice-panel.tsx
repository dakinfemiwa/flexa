"use client";

import { useEffect, useState } from "react";
import { Authenticated, AuthLoading, Unauthenticated, useMutation, useQuery } from "convex/react";
import type { Id } from "@/convex/_generated/dataModel";

import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function AuthenticatedPractice() {
  const objectives = useQuery(api.learningObjectives.list);
  const progress = useQuery(api.progress.getForCurrentUser);
  const ensureCurrentUser = useMutation(api.users.ensureCurrentUser);
  const recordAttempt = useMutation(api.attempts.record);
  const [objectiveId, setObjectiveId] = useState<Id<"learningObjectives"> | undefined>(undefined);
  const questions = useQuery(
    api.questions.listForObjective,
    objectiveId ? { learningObjectiveId: objectiveId } : "skip",
  );
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void ensureCurrentUser();
  }, [ensureCurrentUser]);

  const question = questions?.[0];

  async function submitAnswer() {
    if (!question || !answer.trim()) return;
    setSaving(true);
    try {
      const result = await recordAttempt({ questionId: question._id, submittedAnswer: answer });
      setFeedback({ correct: result.correct, explanation: result.explanation });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card id="practice" className="mt-8 border-cyan-300/20 bg-slate-900/80">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div><CardTitle>Practice with your saved progress</CardTitle><CardDescription className="mt-1">Choose an objective, answer a question, and Flexa records the attempt to your account.</CardDescription></div>
          <Badge variant="success">{progress ? `${progress.reduce((total, item) => total + item.questionsAttempted, 0)} saved attempts` : "Syncing"}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {objectives?.map((objective) => <button key={objective._id} type="button" className={cn(buttonVariants({ variant: objective._id === objectiveId ? "default" : "outline", size: "sm" }))} onClick={() => { setObjectiveId(objective._id); setFeedback(null); setAnswer(""); }}>{objective.title}</button>)}
        </div>
        {objectiveId && question ? <div className="mt-5 rounded-lg border border-slate-800 bg-slate-950/60 p-4"><p className="text-sm leading-6 text-slate-200">{question.questionText}</p><div className="mt-4 flex flex-col gap-3 sm:flex-row"><input value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Your numerical answer" className="h-10 flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm text-slate-100 outline-none ring-cyan-300 focus:ring-2" /><button type="button" disabled={saving || !answer.trim()} onClick={submitAnswer} className={buttonVariants({ size: "sm" })}>{saving ? "Saving..." : "Submit answer"}</button></div>{feedback && <div className="mt-4 border-t border-slate-800 pt-4"><p className={feedback.correct ? "text-sm font-semibold text-emerald-300" : "text-sm font-semibold text-amber-300"}>{feedback.correct ? "Correct" : "Not quite"}</p><p className="mt-1 text-sm text-slate-400">{feedback.explanation}</p></div>}</div> : <p className="mt-5 text-sm text-slate-500">{objectives?.length ? "Select an objective to begin." : "Loading your learning objectives..."}</p>}
      </CardContent>
    </Card>
  );
}

export function PracticePanel() {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    return <p className="mt-8 text-sm text-slate-500">Add NEXT_PUBLIC_CONVEX_URL to enable saved practice.</p>;
  }

  return <><AuthLoading><p className="mt-8 text-sm text-slate-500">Loading your learning space...</p></AuthLoading><Unauthenticated><p className="mt-8 text-sm text-slate-500">Sign in to save practice and progress.</p></Unauthenticated><Authenticated><AuthenticatedPractice /></Authenticated></>;
}
