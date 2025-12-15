import { markNoteAsReady } from "@/utils/queries/notes";
import { apiResponse } from "@/utils/backendUtils";
import type { Tables } from "@/types/supabase";

type Note = Tables<"notes">;

export async function finalizeNote(noteId: string, note: Note) {
  await markNoteAsReady(noteId);
  return apiResponse("Note processed.", true, { note }, 200);
}
