import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";
import { signUpAction } from "@/app/actions";
import { UrlProvider } from "@/components/url-provider";

export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  if ("message" in searchParams) {
    return (
      <div className="flex h-screen w-full flex-1 items-center justify-center p-4 sm:max-w-md">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center noise-texture p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="font-display text-7xl md:text-8xl mb-4 tracking-tight">UNVAULTD</h1>
          <p className="font-editorial text-xl md:text-2xl opacity-80">
            Join the exclusive fashion archive
          </p>
        </div>

        <div className="border-[3px] border-foreground bg-card p-8 md:p-12 shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
          <UrlProvider>
            <form className="space-y-8">
              <div className="space-y-2">
                <h2 className="font-display text-4xl uppercase">Sign Up</h2>
                <p className="font-editorial text-lg opacity-70">
                  Already a member?{" "}
                  <Link
                    href="/sign-in"
                    className="text-accent hover:underline font-semibold"
                  >
                    Sign in
                  </Link>
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="font-ui uppercase tracking-wide text-sm">
                    Full Name
                  </Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    type="text"
                    placeholder="John Doe"
                    required
                    className="border-[3px] border-foreground font-editorial text-lg py-6"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="font-ui uppercase tracking-wide text-sm">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    className="border-[3px] border-foreground font-editorial text-lg py-6"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="font-ui uppercase tracking-wide text-sm">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="Minimum 6 characters"
                    minLength={6}
                    required
                    className="border-[3px] border-foreground font-editorial text-lg py-6"
                  />
                </div>
              </div>

              <SubmitButton
                formAction={signUpAction}
                pendingText="Creating account..."
                className="w-full py-6 bg-accent text-primary font-display text-2xl uppercase tracking-wide brutalist-border hover:translate-x-1 hover:translate-y-1 transition-transform"
              >
                Join Unvaultd
              </SubmitButton>

              <FormMessage message={searchParams} />
            </form>
          </UrlProvider>
        </div>

        <div className="mt-8">
          <SmtpMessage />
        </div>

        <p className="text-center mt-8 font-editorial text-sm opacity-50">
          By signing up, you agree to our terms of service and privacy policy
        </p>
      </div>
    </div>
  );
}
