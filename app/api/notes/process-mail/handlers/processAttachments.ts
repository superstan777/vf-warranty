import {
  uploadToStorage,
  insertAttachment,
  getAttachmentsByGraphIds,
} from "@/utils/queries/attachments";
import type { IncomingAttachment } from "../route";

export async function processAttachments({
  attachments,
  claimId,
  noteId,
}: {
  attachments: IncomingAttachment[];
  claimId: string;
  noteId: string;
}) {
  if (!attachments.length) {
    return { completed: true };
  }

  const incomingIds = attachments.map((a) => a.graph_id);
  const { data: existing } = await getAttachmentsByGraphIds(incomingIds);

  const existingIds = new Set(existing?.map((a) => a.graph_id) || []);
  let added = 0;

  for (const att of attachments) {
    if (existingIds.has(att.graph_id)) continue;

    try {
      const buffer = Buffer.from(att.content_base_64, "base64");
      const path = `${claimId}/${noteId}/${att.file_name}`;

      const { error: uploadError } = await uploadToStorage(
        path,
        buffer,
        att.content_type
      );
      if (uploadError) throw uploadError;

      const { error: attachError } = await insertAttachment({
        note_id: noteId,
        path,
        graph_id: att.graph_id,
      });
      if (attachError) throw attachError;

      added++;
    } catch (err) {
      console.error("Attachment failed:", err);
    }
  }

  const total = existingIds.size + added;

  return {
    completed: total === attachments.length,
  };
}
