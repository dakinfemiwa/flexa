"use client";

import { useUser } from "@clerk/nextjs";

export function UserGreeting() {
  const { user } = useUser();
  const name = user?.firstName ?? user?.fullName ?? "Student";
  const initial = name.charAt(0).toUpperCase();

  return (
    <>
      <div className="hidden lg:block">
        <p className="text-sm text-slate-500">Your adaptive learning space</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Good morning, {name}.</h1>
      </div>
      <div className="grid size-9 place-items-center rounded-full bg-violet-300 font-semibold text-slate-950">{initial}</div>
    </>
  );
}
