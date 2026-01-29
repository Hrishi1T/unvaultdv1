"use client";

import { useState } from "react";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";
import { signInAction } from "@/app/actions";

type SignInFormProps = {
  variant?: "page" | "modal";
};

export default function SignInForm({ variant = "page" }: SignInFormProps) {
  // Local state for controlled inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div
      className={`w-full ${
        variant === "modal" ? "max-w-sm" : "max-w-md mx-auto"
      }`}
    >
      <h1 className="text-lg font-semibold tracking-tight text-zinc-900 mb-4">
        Sign in
      </h1>

      {/* IMPORTANT: server action lives on the form */}
      <form action={signInAction} className="space-y-3">
        <Input
          type="email"
          name="email"                 // ✅ REQUIRED for FormData
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          type="password"
          name="password"              // ✅ REQUIRED for FormData
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <SubmitButton
          className="w-full"
          pendingText="Signing in..."
        >
          Sign in
        </SubmitButton>

        <div className="flex items-center justify-between text-sm text-zinc-600 pt-1">
          <Link
            href="/sign_in_auth/forgot-password"
            className="hover:opacity-80 underline underline-offset-4"
          >
            Forgot password?
          </Link>

          <span>
            Don’t have an account?{" "}
            <Link
              href="/sign_in_auth/sign-up"
              className="text-zinc-900 underline underline-offset-4 hover:opacity-80"
            >
              Sign up
            </Link>
          </span>
        </div>
      </form>
    </div>
  );
}
