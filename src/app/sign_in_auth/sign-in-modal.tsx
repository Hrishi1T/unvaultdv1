"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import SignInForm from "./sign-in-form";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { OPEN_SIGN_IN_MODAL_EVENT } from "@/lib/open-sign-in-modal";

type SignInModalProps = {
  triggerClassName?: string;
};

export function SignInModal({ triggerClassName }: SignInModalProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener(OPEN_SIGN_IN_MODAL_EVENT, handleOpen);
    return () => window.removeEventListener(OPEN_SIGN_IN_MODAL_EVENT, handleOpen);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        onClick={() => setOpen(true)}
        className={triggerClassName ?? "text-sm font-medium hover:opacity-80"}
      >
        Sign in
      </button>

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
