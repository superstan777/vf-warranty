"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { insertNote } from "@/utils/queries/notes";
import { Tables } from "@/types/supabase";

type Note = Tables<"notes">;

export async function addNote(
  claimId: string,
  content: string,
  origin: Note["origin"]
) {
  const session = await auth();

  if (!session?.user?.name) {
    throw new Error("User name is missing");
  }

  const { data, error } = await insertNote({
    claim_id: claimId,
    content,
    user_name: session.user.name,
    origin,
  });

  if (error || !data || data.length === 0) {
    console.error("Failed to add note:", error);
    throw new Error("Failed to add note");
  }

  revalidatePath(`/claims/${claimId}`);
  return data[0];
}
