// resolve/helpers/graph.ts
export async function getDriveId(botToken: string) {
  const res = await fetch("https://graph.microsoft.com/v1.0/me/drive", {
    headers: { Authorization: `Bearer ${botToken}` },
  });

  if (!res.ok) throw new Error(`Graph error: cannot get drive ID`);

  const data = await res.json();
  return data.id;
}

export async function getTeamsChatFolderId(botToken: string) {
  const res = await fetch(
    "https://graph.microsoft.com/v1.0/me/drive/root/children?$filter=name eq 'Microsoft Teams Chat Files'",
    {
      headers: { Authorization: `Bearer ${botToken}` },
    }
  );

  if (!res.ok)
    throw new Error(`Graph error: cannot list root children for Teams folder`);

  const data = await res.json();

  if (!data.value?.length) throw new Error("Teams Chat Files folder not found");

  return data.value[0].id;
}

export async function downloadTeamsFile(botToken: string, fileName: string) {
  const folderId = await getTeamsChatFolderId(botToken);

  // list files in Teams Chat Files
  const filesRes = await fetch(
    `https://graph.microsoft.com/v1.0/me/drive/items/${folderId}/children`,
    {
      headers: { Authorization: `Bearer ${botToken}` },
    }
  );

  const files = await filesRes.json();

  const file = files.value.find((f: any) => f.name === fileName);

  if (!file) throw new Error(`File not found in Teams folder: ${fileName}`);

  // download actual content
  const contentRes = await fetch(
    `https://graph.microsoft.com/v1.0/me/drive/items/${file.id}/content`,
    {
      headers: { Authorization: `Bearer ${botToken}` },
    }
  );

  if (!contentRes.ok)
    throw new Error(
      `Cannot download file content: ${contentRes.status} ${contentRes.statusText}`
    );

  return await contentRes.arrayBuffer();
}
