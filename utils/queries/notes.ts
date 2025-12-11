import { createClient } from "@/utils/supabase/client";
import type { Tables, TablesInsert } from "@/types/supabase";

type Attachment = Tables<"attachments">;
type InsertNote = TablesInsert<"notes">;
export type AttachmentWithUrl = Attachment & { url: string };

const supabase = createClient();

export async function getNotesWithAttachmentsByClaimId(claimId: string) {
  const { data: notes, error: notesError } = await supabase
    .from("notes")
    .select("*")
    .eq("claim_id", claimId)
    .order("created_at", { ascending: false });

  if (notesError) return { notes: null, error: notesError };

  const noteIds = notes.map((n) => n.id);
  const { data: attachments, error: attachmentsError } = await supabase
    .from("attachments")
    .select("*")
    .in("note_id", noteIds);

  if (attachmentsError || !attachments)
    return { notes: null, error: attachmentsError };

  const groupedAttachments = attachments.reduce((acc, att) => {
    if (!acc[att.note_id]) acc[att.note_id] = [];

    const {
      data: { publicUrl },
    } = supabase.storage.from("attachments").getPublicUrl(att.path);

    acc[att.note_id].push({
      ...att,
      url: publicUrl,
    } as AttachmentWithUrl);

    return acc;
  }, {} as Record<string, AttachmentWithUrl[]>);

  return { notes, attachments: groupedAttachments, error: null };
}

export const insertNote = async ({
  claim_id,
  content,
  user_name,
  origin,
  graph_id,
}: InsertNote) => {
  const { data, error } = await supabase
    .from("notes")
    .insert({ claim_id, content, user_name, origin, graph_id })
    .select();

  return { data, error };
};
