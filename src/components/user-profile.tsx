"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { createClient } from "../../supabase/client";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

export default function UserProfile() {
  const supabase = createClient();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setUser(data.user ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  const name = useMemo(() => {
    if (!user) return "";
    const meta: any = user.user_metadata ?? {};
    return (
      meta.full_name ||
      meta.name ||
      (typeof user.email === "string" ? user.email.split("@")[0] : "") ||
      "Account"
    );
  }, [user]);

  const initials = useMemo(() => {
    const base = (name || "").trim();
    if (!base) return "U";
    const parts = base.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
    const out = (first + last).toUpperCase();
    return out || "U";
  }, [name]);

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-10 w-10 rounded-full p-0 border border-zinc-200 bg-white hover:bg-zinc-50"
          aria-label="Open profile menu"
        >
          <span className="h-9 w-9 rounded-full bg-zinc-900 text-white flex items-center justify-center text-sm font-semibold">
            {initials}
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-[180px]">
        <DropdownMenuItem
          onClick={() => router.push("/profile")}
          className="cursor-pointer"
        >
          Your Profile
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={async () => {
            await supabase.auth.signOut();
            router.refresh();
            router.push("/");
          }}
          className="cursor-pointer"
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
