import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";
import { signUpAction } from "@/app/actions";
import { UrlProvider } from "@/components/url-provider";
import GoogleAuth from "@/components/auth/GoogleAuth";

export default async function Signup(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;

  if ("message" in searchParams) {
    return (
      <div className="min-h-screen bg-white text-zinc-900 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <FormMessage message={searchParams} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* Top header (matches feed style) */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-zinc-200">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="font-display text-xl tracking-tight text-zinc-900"
          >
            UNVAULTD
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mx-auto w-full max-w-md">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <UrlProvider>
              <form className="space-y-4">
                <div className="space-y-1">
                  <h1 className="text-lg font-semibold tracking-tight">
                    Create your account
                  </h1>
                  <p className="text-sm text-zinc-500">
                    Already a member?{" "}
                    <Link
                      href="/sign_in_auth/sign-in"
                      className="text-zinc-900 underline underline-offset-4 hover:opacity-80"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>

                <GoogleAuth redirectTo="/" label="Sign up with Google" />

                <div className="my-1 flex items-center gap-3">
                  <div className="h-px flex-1 bg-zinc-200" />
                  <span className="text-xs text-zinc-500">or</span>
                  <div className="h-px flex-1 bg-zinc-200" />
                </div>

                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <Label
                      htmlFor="full_name"
                      className="text-xs font-medium text-zinc-700"
                    >
                      Full Name
                    </Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      type="text"
                      placeholder="John Doe"
                      required
                      className="
                        h-11 rounded-md bg-white text-zinc-900
                        border border-zinc-200
                        placeholder:text-zinc-400
                        focus-visible:ring-2 focus-visible:ring-zinc-900/10
                        focus-visible:border-zinc-300
                      "
                    />
                  </div>

                  <div className="space-y-1">
                    <Label
                      htmlFor="email"
                      className="text-xs font-medium text-zinc-700"
                    >
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      className="
                        h-11 rounded-md bg-white text-zinc-900
                        border border-zinc-200
                        placeholder:text-zinc-400
                        focus-visible:ring-2 focus-visible:ring-zinc-900/10
                        focus-visible:border-zinc-300
                      "
                    />
                  </div>

                  <div className="space-y-1">
                    <Label
                      htmlFor="password"
                      className="text-xs font-medium text-zinc-700"
                    >
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      name="password"
                      placeholder="Minimum 6 characters"
                      minLength={6}
                      required
                      className="
                        h-11 rounded-md bg-white text-zinc-900
                        border border-zinc-200
                        placeholder:text-zinc-400
                        focus-visible:ring-2 focus-visible:ring-zinc-900/10
                        focus-visible:border-zinc-300
                      "
                    />
                  </div>
                </div>

                {/* Keep your Supabase action exactly the same */}
                <SubmitButton
                  formAction={signUpAction}
                  pendingText="Creating account..."
                  className="w-full h-11 rounded-md bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800"
                >
                  Sign up
                </SubmitButton>

                <FormMessage message={searchParams} />
              </form>
            </UrlProvider>
          </div>

          <div className="mt-6">
            <SmtpMessage />
          </div>

          <p className="text-center mt-6 text-xs text-zinc-500">
            By signing up, you agree to our terms of service and privacy policy.
          </p>
        </div>
      </main>
    </div>
  );
}
