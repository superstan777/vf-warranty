// resolve/helpers/attachments.ts
import { createClient } from "@/utils/supabase/client";
import { getBotAccessToken } from "@/utils/botToken";
import { downloadTeamsFile } from "./graph";

export async function processAttachments(noteId: string, attachments: any[]) {
  const supabase = createClient();
  const botToken = await getBotAccessToken();

  console.log(
    `Processing ${attachments.length} attachments for note ${noteId}`
  );

  for (const att of attachments) {
    try {
      // ---------------------------
      // 1. Forwardowane wiadomości
      // ---------------------------
      if (!att.content_url && !att.id) {
        console.log("Saving forwarded text message");

        const { error } = await supabase.from("attachments").insert([
          {
            note_id: noteId,
            content: att.content || "",
            content_url: "",
            file_name: "",
          },
        ]);

        if (error) console.error("DB error:", error);
        continue;
      }

      // ---------------------------
      // 2. Załączniki z Teams
      // ---------------------------
      if (att.name) {
        const fileName = att.name;
        console.log(`Downloading Teams file: ${fileName}`);

        let fileData: ArrayBuffer;
        try {
          fileData = await downloadTeamsFile(botToken, fileName);
        } catch (err) {
          console.error("Graph download failed:", err);
          continue;
        }

        const filePath = `attachments/note_${noteId}/${fileName}`;

        console.log(`Uploading ${filePath} to Supabase...`);

        const { error: uploadError } = await supabase.storage
          .from("attachments")
          .upload(filePath, Buffer.from(fileData), { upsert: true });

        if (uploadError) {
          console.error("Supabase upload failed:", uploadError);
          continue;
        }

        await supabase.from("attachments").insert([
          {
            note_id: noteId,
            content: "",
            content_url: filePath,
            file_name: fileName,
          },
        ]);

        console.log(`Attachment ${fileName} saved.`);
        continue;
      }

      // ---------------------------
      // 3. Unknown attachment type
      // ---------------------------
      console.log("Skipping unknown attachment format:", att);
    } catch (err) {
      console.error("Failed to process attachment:", err);
    }
  }

  console.log(`Finished processing attachments for note ${noteId}`);
}
