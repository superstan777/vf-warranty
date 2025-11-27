"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/client";
import { auth } from "@/auth";

export async function addNote(claimId: string, content: string) {
  const session = await auth();
  const supabase = createClient();

  const { error } = await supabase.from("notes").insert({
    claim_id: claimId,
    content,
    user_name: session?.user?.name,
  });

  if (error) {
    console.error("Failed to add note:", error);
    throw new Error("Failed to add note");
  }

  revalidatePath(`/claims/${claimId}`);
}
