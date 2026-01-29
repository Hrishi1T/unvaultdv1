import { redirect } from "next/navigation";
import { createClient } from "../../../../supabase/server";
import { EditPostForm } from "@/components/upload/edit-post-form";

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign_in_auth/sign-in");
  }

  // Fetch the post to verify ownership
  const { data: post } = await supabase
    .from("posts")
    .select("*, post_images(*)")
    .eq("id", id)
    .single();

  if (!post || post.user_id !== user.id) {
    redirect("/");
  }

  return <EditPostForm post={post} userId={user.id} />;
}
