import { createClient } from "@/utils/supabase/client";

// Pobranie aktualnego access tokena, odświeżenie jeśli wygasł
export async function getBotAccessToken(): Promise<string> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("bot_tokens")
    .select("refresh_token, access_token, expires_in, updated_at")
    .eq("user_id", "bot_user")
    .single();

  if (error || !data) throw new Error("No bot token found");

  if (!data.updated_at || !data.expires_in) {
    throw new Error("Bot token record missing updated_at or expires_in");
  }

  const updatedAt = new Date(data.updated_at).getTime(); // teraz na pewno string
  const expiresAt = updatedAt + data.expires_in * 1000;

  if (Date.now() >= expiresAt - 60_000) {
    // odświeżamy token 1 min przed wygaśnięciem
    return await refreshBotToken(data.refresh_token);
  }

  return data.access_token!;
}

// Funkcja odświeżania tokena
async function refreshBotToken(refreshToken: string): Promise<string> {
  const supabase = createClient();
  const clientId = process.env.GRAPH_CLIENT_ID!;
  const clientSecret = process.env.GRAPH_CLIENT_SECRET!;
  const tenantId = process.env.GRAPH_TENANT!;
  const redirectUri = process.env.REDIRECT_URI!;

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("client_secret", clientSecret);
  params.append("grant_type", "refresh_token");
  params.append("refresh_token", refreshToken);
  params.append("redirect_uri", redirectUri);

  const res = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    }
  );

  const data = await res.json();
  if (!data.access_token || !data.refresh_token)
    throw new Error("Failed to refresh token");

  await supabase.from("bot_tokens").upsert({
    user_id: "bot_user",
    refresh_token: data.refresh_token,
    access_token: data.access_token,
    scope: data.scope,
    token_type: data.token_type,
    expires_in: data.expires_in,
    updated_at: new Date().toISOString(),
  });

  return data.access_token;
}
