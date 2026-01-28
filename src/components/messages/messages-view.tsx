"use client";

import { ArrowLeft, MessageCircle } from "lucide-react";
import Link from "next/link";

interface MessagesViewProps {
  userId: string;
}

export function MessagesView({ userId }: MessagesViewProps) {
  return (
    <div className="min-h-screen noise-texture">
      <header className="border-b-[3px] border-foreground bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-ui font-semibold">Back to Feed</span>
          </Link>
          <h1 className="font-display text-2xl uppercase">Messages</h1>
          <div className="w-24" />
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center py-16">
          <div className="inline-flex items-center justify-center w-24 h-24 border-[3px] border-foreground mb-6">
            <MessageCircle className="w-12 h-12 opacity-50" />
          </div>
          <h2 className="font-display text-4xl uppercase mb-4">Coming Soon</h2>
          <p className="font-editorial text-xl opacity-70 mb-8">
            Direct messaging functionality is currently in development.
            Soon you'll be able to connect with other fashion enthusiasts.
          </p>
          <Link
            href="/"
            className="inline-block px-8 py-4 bg-accent text-primary font-display text-lg uppercase tracking-wide brutalist-border hover:translate-x-1 hover:translate-y-1 transition-transform"
          >
            Back to Feed
          </Link>
        </div>
      </div>
    </div>
  );
}
