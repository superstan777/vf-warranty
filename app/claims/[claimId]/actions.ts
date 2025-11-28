"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/client";
import { auth } from "@/auth";

type origin = "app" | "teams" | "mail";

export async function addNote(
  claimId: string,
  content: string,
  origin: origin
) {
  const session = await auth();
  const supabase = createClient();

  if (!session?.user?.name) {
    throw new Error("User name is missing");
  }
  const { error } = await supabase.from("notes").insert({
    claim_id: claimId,
    content,
    user_name: session.user.name,
    origin: origin,
  });

  if (error) {
    console.error("Failed to add note:", error);
    throw new Error("Failed to add note");
  }

  revalidatePath(`/claims/${claimId}`);
}
