"use client";

import { useEffect, useMemo, useState } from "react";
import { UserCircle } from "lucide-react";
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

  const avatarUrl = useMemo(() => {
    if (!user) return "";
    const meta: any = user.user_metadata ?? {};
    return meta.avatar_url || meta.picture || "";
  }, [user]);

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-10 px-2 rounded-full">
          <span className="flex items-center gap-2">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                className="h-7 w-7 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <UserCircle className="h-7 w-7" />
            )}
            <span className="text-sm font-medium text-zinc-900 max-w-[140px] truncate">
              {name}
            </span>
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-[180px]">
        <DropdownMenuItem
          onClick={() => router.push("/dashboard")}
          className="cursor-pointer"
        >
          Dashboard
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={async () => {
            await supabase.auth.signOut();
            router.refresh();
            router.push("/"); // ✅ always homepage after signout
          }}
          className="cursor-pointer"
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
