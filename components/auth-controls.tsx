"use client";

import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AuthControls() {
  return (
    <div className="flex items-center gap-2">
      <SignedOut>
        <SignInButton mode="modal">
          <button className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>Sign in</button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button className={cn(buttonVariants({ size: "sm" }))}>Create account</button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </div>
  );
}
