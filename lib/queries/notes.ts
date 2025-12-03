import { createClient } from "@/utils/supabase/client";
import type { Tables } from "@/types/supabase";

type Attachment = Tables<"attachments">;

export async function getNotesWithAttachmentsByClaimId(claimId: string) {
  const supabase = createClient();

  // 1. Pobieramy notatki
  const { data: notes, error: notesError } = await supabase
    .from("notes")
    .select("*")
    .eq("claim_id", claimId)
    .order("created_at", { ascending: false });

  if (notesError) return { notes: null, error: notesError };

  // 2. Pobieramy wszystkie attachmenty dla tych notatek
  const noteIds = notes.map((n) => n.id);
  const { data: attachments, error: attachmentsError } = await supabase
    .from("attachments")
    .select("*")
    .in("note_id", noteIds);

  if (attachmentsError || !attachments)
    return { notes: null, error: attachmentsError };

  type AttachmentWithUrl = Attachment & { url: string };

  const groupedAttachments = attachments.reduce((acc, att) => {
    if (!acc[att.note_id]) acc[att.note_id] = [];

    // Poprawne pobranie URL
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
