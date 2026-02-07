import { createClient } from "../../../../supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirect_to = requestUrl.searchParams.get("redirect_to");

  if (code) {
    const supabase = await createClient();

    await supabase.auth.exchangeCodeForSession(code);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const meta: any = user.user_metadata ?? {};

      const fullName =
        (meta.full_name as string) ||
        (meta.name as string) ||
        null;

      // ✅ check if row exists
      const { data: existing, error: existingErr } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (existingErr) {
        // optional: handle/log error
      }

      // ✅ only create if missing — NEVER overwrite on login
      if (!existing) {
        await supabase.from("users").insert({
          id: user.id,
          user_id: user.id,
          email: user.email,
          name: fullName,
          full_name: fullName,
          username: `user_${user.id.slice(0, 8)}`,
          token_identifier: user.email, // or user.id if you prefer
          created_at: new Date().toISOString(),
        });
      } else {
        // ✅ only keep email in sync (safe), do NOT touch avatar/name/username
        await supabase
          .from("users")
          .update({ email: user.email })
          .eq("id", user.id);
      }
    }
  }

const redirectTo = redirect_to || "/";

// Prefer explicit public URL if you set it (recommended)
const publicOrigin = process.env.NEXT_PUBLIC_SITE_URL;

// Otherwise derive from proxy headers (Render sets these)
const proto = request.headers.get("x-forwarded-proto") || "http";
const host =
  request.headers.get("x-forwarded-host") ||
  request.headers.get("host") ||
  new URL(request.url).host;

const origin = publicOrigin || `${proto}://${host}`;

// If redirectTo is absolute, keep it. If relative, resolve against origin.
const target =
  redirectTo.startsWith("http://") || redirectTo.startsWith("https://")
    ? redirectTo
    : new URL(redirectTo, origin).toString();

return NextResponse.redirect(target);

}
