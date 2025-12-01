import { createClient } from "@/utils/supabase/client";
import { getBotAccessToken } from "@/utils/botToken";

export async function processAttachments(noteId: string, attachments: any[]) {
  const supabase = createClient();
  const botToken = await getBotAccessToken();

  console.log(
    `Processing ${attachments.length} attachments for note ${noteId}`
  );

  for (const att of attachments) {
    try {
      // Tekstowy forwarded message – content_url jest null
      if (!att.content_url) {
        console.log(
          `Forwarded message detected, saving content as is for note ${noteId}`
        );
        const { error } = await supabase.from("attachments").insert([
          {
            note_id: noteId,
            content: att.content || "",
            content_url: "",
            file_name: "",
          },
        ]);

        if (error)
          console.error("DB error inserting forwarded message:", error);
        else console.log("Forwarded message saved successfully");

        // Plik / obrazek – content_url istnieje
      } else {
        console.log(`Downloading file from ${att.content_url}`);
        const fileData = await fetch(att.content_url, {
          headers: { Authorization: `Bearer ${botToken}` },
        }).then((res) => res.arrayBuffer());

        const fileName = att.file_name || `file_${Date.now()}`;
        const filePath = `attachments/note_${noteId}/${fileName}`;
        console.log(`Uploading file to Supabase Storage at path: ${filePath}`);

        const { error: uploadError } = await supabase.storage
          .from("attachments")
          .upload(filePath, Buffer.from(fileData), { upsert: true });

        if (uploadError) {
          console.error(
            "Failed to upload file to Supabase Storage:",
            uploadError
          );
          continue;
        } else {
          console.log("File uploaded successfully");
        }

        const { error: dbError } = await supabase.from("attachments").insert([
          {
            note_id: noteId,
            content: "",
            content_url: filePath,
            file_name: fileName,
          },
        ]);

        if (dbError)
          console.error("Failed to insert attachment record:", dbError);
        else console.log("Attachment record inserted into DB successfully");
      }
    } catch (err) {
      console.error("Failed to process attachment:", err);
    }
  }

  console.log(`Finished processing attachments for note ${noteId}`);
}
