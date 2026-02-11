"use client";

export const OPEN_SIGN_IN_MODAL_EVENT = "unvaultd:open-sign-in-modal";

export function openSignInModal() {
  if (typeof window === "undefined") return false;
  window.dispatchEvent(new Event(OPEN_SIGN_IN_MODAL_EVENT));
  return true;
}
