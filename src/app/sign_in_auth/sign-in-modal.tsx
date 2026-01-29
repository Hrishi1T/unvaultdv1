"use client";

import {
  Dialog,
  DialogContent,
  DialogTrigger,
   DialogTitle,
} from "@/components/ui/dialog";
import SignInForm from "./sign-in-form";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

type SignInModalProps = {
  triggerClassName?: string;
};

export function SignInModal({ triggerClassName }: SignInModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className={
            triggerClassName ??
            "text-sm font-medium hover:opacity-80"
          }
        >
          Sign in
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md bg-white border border-zinc-200 rounded-xl p-0 shadow-2xl">
        <VisuallyHidden>
          <DialogTitle>Sign in</DialogTitle>
        </VisuallyHidden>
        <div className="p-6">
          <SignInForm variant="modal" />
        </div>

      </DialogContent>
    </Dialog>
  );
}
