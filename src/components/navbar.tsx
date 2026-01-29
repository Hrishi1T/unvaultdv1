import Link from "next/link";
import { createClient } from "../../supabase/server";
import UserProfile from "./user-profile";
import { SignInModal } from "@/app/sign_in_auth/sign-in-modal";

export default async function Navbar() {
  const supabase = createClient();
  const {
    data: { user },
  } = await (await supabase).auth.getUser();

  return (
    <nav className="w-full border-b border-gray-200 bg-white py-2">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" prefetch className="text-xl font-bold">
          UNVAULTD
        </Link>

        <div className="flex gap-4 items-center">
          {user ? (
            <UserProfile />
          ) : (
            <>
              <SignInModal triggerClassName="text-sm font-medium" />
              <Link
                href="/sign_in_auth/sign-up"
                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
