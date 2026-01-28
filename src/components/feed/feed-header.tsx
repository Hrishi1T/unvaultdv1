"use client";

import { User } from "@supabase/supabase-js";
import Link from "next/link";
import { Upload, MessageCircle, User as UserIcon, LogOut } from "lucide-react";
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
  user: User;
}

export function FeedHeader({ user }: FeedHeaderProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/sign-in");
  };

  return (
    <header className="sticky top-0 z-50 border-b-[3px] border-foreground bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <h1 className="font-display text-3xl tracking-tight">UNVAULTD</h1>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/upload"
            className="flex items-center gap-2 px-6 py-3 bg-accent text-primary font-ui uppercase tracking-wide brutalist-border hover:translate-x-0.5 hover:translate-y-0.5 transition-transform"
          >
            <Upload className="w-5 h-5" />
            Upload
          </Link>

          <Link
            href="/messages"
            className="flex items-center gap-2 px-4 py-3 hover:bg-muted transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
              <Avatar className="w-10 h-10 border-2 border-foreground">
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-accent text-primary font-display">
                  {user.email?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 border-[3px] border-foreground">
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                  <UserIcon className="w-4 h-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 cursor-pointer">
                <LogOut className="w-4 h-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
}
