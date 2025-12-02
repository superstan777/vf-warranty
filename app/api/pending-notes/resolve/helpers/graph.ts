// resolve/helpers/graph.ts

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

export async function downloadTeamsFile(
  botToken: string,
  fileName: string
): Promise<ArrayBuffer> {
  const folderId = await getTeamsChatFolderId(botToken);

  const filesRes = await fetch(
    `https://graph.microsoft.com/v1.0/me/drive/items/${folderId}/children`,
    {
      headers: { Authorization: `Bearer ${botToken}` },
    }
  );

  if (!filesRes.ok)
    throw new Error(`Cannot list files in Teams folder: ${filesRes.status}`);

  const files = await filesRes.json();

  const file = files.value.find((f: any) => f.name === fileName);
  if (!file) {
    console.error("FILES IN FOLDER:", files.value); // debug
    throw new Error(`File not found in Teams folder: ${fileName}`);
  }

  const contentRes = await fetch(
    `https://graph.microsoft.com/v1.0/me/drive/items/${file.id}/content`,
    {
      headers: { Authorization: `Bearer ${botToken}` },
    }
  );

  if (!contentRes.ok)
    throw new Error(
      `Cannot download file: ${contentRes.status} ${contentRes.statusText}`
    );

  return await contentRes.arrayBuffer();
}
