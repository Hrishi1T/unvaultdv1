import { createClient } from "../../../../supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirect_to = requestUrl.searchParams.get("redirect_to");

  if (code) {
    const supabase = await createClient();

    // Exchange OAuth code for session
    await supabase.auth.exchangeCodeForSession(code);

    // Get the signed-in user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const fullName =
        (user.user_metadata?.full_name as string) ||
        (user.user_metadata?.name as string) ||
        "";

      // Ensure user exists in your users table
      await supabase.from("users").upsert(
        {
          id: user.id,
          user_id: user.id,
          email: user.email,
          name: fullName,
          full_name: fullName,
          token_identifier: user.id,
          created_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );
    }
  }

  // Redirect back to where the user came from
  const redirectTo = redirect_to || "/";
  return NextResponse.redirect(new URL(redirectTo, requestUrl.origin));
}
