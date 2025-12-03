// import { createClient } from "@/utils/supabase/client";

// export function normalizeIncNumber(raw: string) {
//   const clean = raw.toUpperCase().trim();
//   const match = clean.match(/INC(\d+)/i);
//   if (!match) return clean;
//   return `INC${match[1].padStart(5, "0")}`;
// }

// export async function fetchPendingNoteWithAttachments(user_name: string) {
//   const supabase = createClient();

//   const { data: pendingNote } = await supabase
//     .from("pending_notes")
//     .select("*")
//     .eq("user_name", user_name)
//     .limit(1)
//     .single();

//   const { data: pendingAttachments } = pendingNote
//     ? await supabase
//         .from("pending_attachments")
//         .select("*")
//         .eq("pending_note_id", pendingNote.id)
//     : { data: [] }; // zawsze tablica

//   return { pendingNote, pendingAttachments: pendingAttachments || [] };
// }
