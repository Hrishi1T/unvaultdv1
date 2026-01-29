"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SignInFormProps = {
  variant?: "page" | "modal";
};

export default function SignInForm({ variant = "page" }: SignInFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className={`w-full ${variant === "modal" ? "max-w-sm" : "max-w-md mx-auto"}`}>
      <h1 className="text-lg font-semibold tracking-tight text-zinc-900 mb-4">
        Sign in
      </h1>

      <form className="space-y-3">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="
            h-11 rounded-md bg-white text-zinc-900
            border border-zinc-200
            placeholder:text-zinc-400
            focus-visible:ring-2 focus-visible:ring-zinc-900/10
            focus-visible:border-zinc-300
          "
        />

        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="
            h-11 rounded-md bg-white text-zinc-900
            border border-zinc-200
            placeholder:text-zinc-400
            focus-visible:ring-2 focus-visible:ring-zinc-900/10
            focus-visible:border-zinc-300
          "
        />

        <Button
          className="
            w-full h-11 rounded-md
            bg-zinc-900 text-white
            hover:bg-zinc-800
          "
          type="submit"
        >
          Sign in
        </Button>
      </form>

      <p className="text-sm text-zinc-500 mt-5 text-center">
        Don’t have an account?{" "}
        <Link
          href="/sign_in_auth/sign-up"
          className="text-zinc-900 underline underline-offset-4 hover:opacity-80"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
