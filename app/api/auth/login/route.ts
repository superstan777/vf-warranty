// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const clientId = process.env.GRAPH_CLIENT_ID;
  const tenantId = process.env.GRAPH_TENANT;
  const redirectUri = process.env.REDIRECT_URI;

  const scope = encodeURIComponent(
    "offline_access Chat.ReadWrite Mail.ReadWrite Files.Read"
  );
  const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&response_mode=query&scope=${scope}`;

  return NextResponse.json({ authUrl });
}
