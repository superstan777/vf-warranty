// import { NextRequest, NextResponse } from "next/server";
// import { createClient } from "@/utils/supabase/client";
// import {
//   normalizeIncNumber,
//   fetchPendingNoteWithAttachments,
// } from "./helpers/pending";
// import { insertNote } from "./helpers/notes";
// import { processAttachments } from "./helpers/attachments";

// export async function POST(req: NextRequest) {
//   const authHeader = req.headers.get("authorization");
//   if (authHeader !== `Bearer ${process.env.BOT_API_TOKEN}`) {
//     return NextResponse.json({ success: false, reason: "UNAUTHORIZED" });
//   }

//   try {
//     const { user_name, inc_number } = await req.json();
//     if (!user_name || !inc_number) {
//       return NextResponse.json({
//         success: false,
//         reason: "MISSING_FIELDS",
//       });
//     }

//     const supabase = createClient();
//     const cleanIncNumber = normalizeIncNumber(inc_number);

//     const { data: claim } = await supabase
//       .from("claims")
//       .select("id,status")
//       .eq("inc_number", cleanIncNumber)
//       .limit(1)
//       .single();

//     if (!claim) {
//       return NextResponse.json({
//         success: false,
//         reason: "INCIDENT_NOT_FOUND",
//         message: "Incident number does not exist",
//       });
//     }

//     if (["cancelled", "resolved"].includes(claim.status)) {
//       return NextResponse.json({
//         success: false,
//         status: claim.status,
//         message:
//           claim.status === "cancelled" ? "Claim cancelled" : "Claim resolved",
//       });
//     }

//     const { pendingNote, pendingAttachments } =
//       await fetchPendingNoteWithAttachments(user_name);

//     if (!pendingNote)
//       return NextResponse.json({
//         success: false,
//         reason: "NO_PENDING_NOTE",
//       });

//     const note = await insertNote(claim.id, pendingNote);
//     await processAttachments(note.id, pendingAttachments);

//     await supabase.from("pending_notes").delete().eq("user_name", user_name);

//     return NextResponse.json({ success: true, note });
//   } catch (err) {
//     console.error("Unhandled exception:", err);
//     return NextResponse.json({
//       success: false,
//       reason: "UNHANDLED_EXCEPTION",
//     });
//   }
// }
