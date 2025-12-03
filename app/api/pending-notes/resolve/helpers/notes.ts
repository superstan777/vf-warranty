// import { createClient } from "@/utils/supabase/client";

// export async function insertNote(claimId: string, pendingNote: any) {
//   const supabase = createClient();
//   const { data: noteData, error } = await supabase
//     .from("notes")
//     .insert({
//       claim_id: claimId,
//       content: pendingNote.content,
//       user_name: pendingNote.user_name,
//       origin: "teams",
//     })
//     .select()
//     .single();

//   if (error || !noteData) throw new Error("Failed to insert note");
//   return noteData;
// }
