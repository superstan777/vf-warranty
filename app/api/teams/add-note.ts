import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/utils/supabase/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const authHeader = req.headers.authorization;
  if (
    !authHeader ||
    authHeader !== `Bearer ${process.env.TEAMS_BOT_API_TOKEN}`
  ) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: "Missing content" });
  }

  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("notes")
      .insert({
        claim_id: "4a839530-0555-42bb-89c1-b33a5f4b41e3",
        content,
        user_name: "Teams API",
        origin: "teams",
      })
      .select();

    if (error) {
      console.error("Failed to add note:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json({ success: true, note: data[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
