import { insertNote, getNoteByGraphId } from "@/utils/queries/notes";
import { dbErrorResponse } from "@/utils/backendUtils";
import type { TablesInsert } from "@/types/supabase";

type ResolveNoteInput = Pick<
  TablesInsert<"notes">,
  "claim_id" | "content" | "user_name" | "origin" | "graph_id"
>;

export async function resolveNote(noteData: ResolveNoteInput) {
  const { graph_id } = noteData;

  if (graph_id) {
    const { data: existing } = await getNoteByGraphId(graph_id);

    if (existing) {
      return { note: existing };
    }
  }

  const { data, error } = await insertNote(noteData);

  if (error || !data?.length) {
    return {
      error: dbErrorResponse("Supabase error (insertNote):", error),
    };
  }

  return { note: data[0] };
}
