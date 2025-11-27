"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/client";

export async function addNote(claimId: string, content: string) {
  const supabase = createClient();

  const { error } = await supabase.from("notes").insert({
    claim_id: claimId,
    content,
  });

  if (error) {
    console.error("Failed to add note:", error);
    throw new Error("Failed to add note");
  }

  // Odśwież stronę po dodaniu notatki
  revalidatePath(`/claims/${claimId}`);
}
