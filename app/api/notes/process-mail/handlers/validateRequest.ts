import { htmlToText } from "html-to-text";
import { apiResponse } from "@/utils/backendUtils";
import type { TablesInsert } from "@/types/supabase";
import type { IncomingAttachment } from "../route";

export type ProcessMailPayload = Pick<
  TablesInsert<"notes">,
  "content" | "user_name" | "origin" | "graph_id"
> & {
  inc_number: string;
  attachments?: IncomingAttachment[];
};

export function validateRequestPayload(payload: ProcessMailPayload) {
  const { inc_number, graph_id, content } = payload;

  if (!inc_number || !graph_id) {
    return {
      error: apiResponse(
        "Incident number and graph_id are required.",
        false,
        undefined,
        400,
        "MISSING_FIELDS"
      ),
    };
  }

  const cleanText = htmlToText(content || "", { wordwrap: false }).trim();

  if (!cleanText) {
    return {
      error: apiResponse(
        "Message has no meaningful content.",
        true,
        undefined,
        200,
        "EMPTY_NOTE_CONTENT"
      ),
    };
  }

  return {
    cleanText,
  };
}
