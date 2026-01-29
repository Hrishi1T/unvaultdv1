import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/server";
import Link from "next/link";


export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign_in_auth/sign-in");

  const meta: any = user.user_metadata ?? {};
  const name =
    meta.full_name ||
    meta.name ||
    (typeof user.email === "string" ? user.email.split("@")[0] : "Account");

  return (
    <div className="min-h-screen bg-white">
<header>
  <div className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between">
    <a
      href="/"
      className="font-display text-xl tracking-tight text-zinc-900"
    >
      UNVAULTD
    </a>
  </div>
</header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              Welcome back, <span className="font-medium text-zinc-900">{name}</span>
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-zinc-500">Account</p>
            <p className="mt-2 text-base font-medium text-zinc-900">
              {user.email}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Signed in via {user.app_metadata?.provider ?? "auth"}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-zinc-500">Quick actions</p>
            <div className="mt-3 flex flex-col gap-2">
              <a
                href="/upload"
                className="inline-flex items-center justify-center rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
              >
                Upload a post
              </a>
              <a
                href="/profile"
                className="inline-flex items-center justify-center rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
              >
                View profile
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-zinc-500">Status</p>
            <p className="mt-2 text-base font-medium text-zinc-900">
              Authenticated
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              This page is protected and only visible to signed-in users.
            </p>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-zinc-900">Coming next</h2>
          <p className="mt-2 text-sm text-zinc-600">
            This is where you’ll show saved posts, uploads, messages, and profile
            stats — in the same minimal Unvaultd style as your homepage.
          </p>
        </div>
      </div>
    </div>
  );
}
