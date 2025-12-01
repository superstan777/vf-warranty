import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/client";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  if (!code) return NextResponse.json({ success: false, reason: "NO_CODE" });

  const clientId = process.env.GRAPH_CLIENT_ID;
  const clientSecret = process.env.GRAPH_CLIENT_SECRET; // dodajemy secret
  const tenantId = process.env.GRAPH_TENANT;
  const redirectUri = process.env.REDIRECT_URI;

  if (!clientId || !clientSecret || !tenantId || !redirectUri) {
    return NextResponse.json({ success: false, reason: "MISSING_ENV" });
  }

  // Wymiana code na token
  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("client_secret", clientSecret); // dodajemy secret
  params.append(
    "scope",
    "offline_access Chat.ReadWrite Mail.ReadWrite Files.Read"
  );
  params.append("code", code);
  params.append("redirect_uri", redirectUri);
  params.append("grant_type", "authorization_code");

  const res = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    }
  );

  const data = await res.json();

  if (!data.access_token || !data.refresh_token) {
    return NextResponse.json({ success: false, data });
  }

  // Pobranie informacji o użytkowniku
  //   const meRes = await fetch("https://graph.microsoft.com/v1.0/me", {
  //     headers: { Authorization: `Bearer ${data.access_token}` },
  //   });
  //   const meData = await meRes.json();
  //   console.log("Logged in user:", meData.displayName, meData.userPrincipalName);

  const supabase = createClient();

  // Zapisz token w Supabase zgodnie z nowym schematem
  const { error } = await supabase.from("bot_tokens").upsert({
    user_id: "bot_user", // stały user
    refresh_token: data.refresh_token,
    access_token: data.access_token, // teraz też zapisujemy access_token
    scope: data.scope,
    token_type: data.token_type,
    expires_in: data.expires_in,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Failed to upsert bot token:", error);
    return NextResponse.json({ success: false, reason: "DB_ERROR" });
  }

  return NextResponse.redirect("https://vf-warranty.vercel.app/"); // lub strona potwierdzenia
}
