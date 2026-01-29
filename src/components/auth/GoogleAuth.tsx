"use client";

import * as React from "react";
import { createClient } from "../../../supabase/client";
import { Button } from "@/components/ui/button";

type GoogleAuthProps = {
  redirectTo?: string; // where to send user AFTER /auth/callback completes
  className?: string;
  label?: string;
};

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" {...props}>
      <path
        d="M44.5 20H24v8.5h11.8C34.4 33.7 29.7 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.5 0 6.4 1.3 8.7 3.4l6-6C34.9 4.9 29.8 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.6 20-21 0-1.3-.2-2.7-.5-4z"
        fill="currentColor"
        opacity="0.2"
      />
      <path d="M6.3 14.7l6.9 5.1C15 16 19.2 13 24 13c3.5 0 6.4 1.3 8.7 3.4l6-6C34.9 6.9 29.8 5 24 5 16 5 9.1 9.3 6.3 14.7z" />
      <path d="M24 43c5.6 0 10.6-1.9 14.5-5.2l-6.7-5.5C29.9 33.8 27.2 35 24 35c-5.7 0-10.5-3.3-12.6-8.1l-7 5.4C7.2 38.6 14.9 43 24 43z" />
      <path d="M44.5 20H24v8.5h11.8c-1 3-3.1 5.3-6 6.8l6.7 5.5C40.4 37.6 44 32.2 44 24c0-1.3-.2-2.7-.5-4z" />
      <path d="M4.4 32.3l7-5.4C10.7 25.3 10.3 23.7 10.3 22c0-1.8.4-3.5 1.1-5.1l-6.9-5.1C3 14.9 2 18.3 2 22c0 3.8 1 7.3 2.4 10.3z" />
    </svg>
  );
}

export default function GoogleAuth({
  redirectTo = "/",
  className,
  label = "Continue with Google",
}: GoogleAuthProps) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onGoogle = async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Send the user to Supabase -> Google, then back to /auth/callback
      const callbackUrl =
        `${window.location.origin}/auth/callback?redirect_to=` +
        encodeURIComponent(redirectTo);

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl,
        },
      });

      if (oauthError) setError(oauthError.message);
      // If successful, browser will redirect away to Google automatically.
    } catch (e: any) {
      setError(e?.message ?? "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <Button
        type="button"
        variant="outline"
        className="w-full h-11 bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-50"
        onClick={onGoogle}
        disabled={loading}
      >
        <GoogleIcon className="h-4 w-4" />
        {loading ? "Connecting..." : label}
      </Button>

      {error ? (
        <p className="mt-2 text-xs text-red-600">{error}</p>
      ) : null}
    </div>
  );
}
