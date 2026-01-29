"use client";

import { User } from "@supabase/supabase-js";
import Link from "next/link";
import { Upload, MessageCircle, User as UserIcon, LogOut, Search } from "lucide-react";
import { createClient } from "../../../supabase/client";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FeedHeaderProps {
  user?: User | null;
}

export function FeedHeader({ user }: FeedHeaderProps) {
  const router = useRouter();
  const supabase = createClient();

  // ✅ Supabase logic unchanged (just guarded)
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/sign-in");
  };

  const avatarUrl =
    (user?.user_metadata as any)?.avatar_url ||
    (user?.user_metadata as any)?.picture ||
    "";

  const initial = (user?.email?.charAt(0) || "U").toUpperCase();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-zinc-200">
      <div className="mx-auto max-w-6xl px-4 py-3 grid grid-cols-3 items-center gap-3">
        {/* Left: brand */}
        <div className="flex items-center">
          <Link href="/" className="font-display text-xl tracking-tight text-zinc-900">
            UNVAULTD
          </Link>
        </div>

        {/* Center: search placeholder */}
        <div className="flex justify-center">
          <div className="w-full max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              placeholder="Search (coming soon)"
              className="w-full pl-9 pr-4 py-2 rounded-full border border-zinc-300 bg-white text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-black/10"
            />
          </div>
        </div>

        {/* Right: nav */}
        <nav className="flex items-center justify-end gap-3">
          {/* Only show these when logged in (otherwise they lead to protected actions) */}
          {user ? (
            <>
              <Link
                href="/upload"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-zinc-300 bg-white text-sm text-zinc-900 hover:bg-zinc-50 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Upload
              </Link>

              <Link
                href="/messages"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50 transition-colors"
                aria-label="Messages"
              >
                <MessageCircle className="w-5 h-5" />
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger className="outline-none">
                  <Avatar className="w-10 h-10 border border-zinc-300">
                    {/* AvatarImage expects string; empty string is safe */}
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback className="bg-zinc-100 text-zinc-900 font-display">
                      {initial}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56 border border-zinc-200">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                      <UserIcon className="w-4 h-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-zinc-300 bg-white text-sm text-zinc-900 hover:bg-zinc-50 transition-colors"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
