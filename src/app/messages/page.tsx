import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/server";
import { MessagesView } from "@/components/messages/messages-view";

export default async function MessagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return <MessagesView userId={user.id} />;
}
