/**
 * Pobiera plik z Microsoft Teams / SharePoint na podstawie pełnego URL
 */

export async function downloadTeamsFile(
  botToken: string,
  fileUrl: string
): Promise<ArrayBuffer> {
  try {
    const url = new URL(fileUrl);

    // Host SharePoint, np. maxgore-my.sharepoint.com
    const host = url.host;

    // Ścieżka po /personal/... -> identyfikujemy usera i folder
    const parts = url.pathname.split("/").filter(Boolean);

    if (parts[0] !== "personal") {
      throw new Error("URL is not a SharePoint personal site");
    }

    const personalSite = `/personal/${parts[1]}`;
    const filePath = parts.slice(2).join("/"); // Documents/.../plik.png

    // 1️⃣ Pobieramy ID site
    const siteRes = await fetch(
      `https://graph.microsoft.com/v1.0/sites/${host}:${personalSite}`,
      {
        headers: { Authorization: `Bearer ${botToken}` },
      }
    );

    if (!siteRes.ok)
      throw new Error(`Cannot resolve SharePoint site ID: ${siteRes.status}`);

    const siteData = await siteRes.json();
    const siteId = siteData.id;
    if (!siteId) throw new Error("SharePoint site ID not found");

    // 2️⃣ Pobieramy plik po ścieżce
    const fileRes = await fetch(
      `https://graph.microsoft.com/v1.0/sites/${siteId}/drive/root:/${filePath}:/content`,
      { headers: { Authorization: `Bearer ${botToken}` } }
    );

    if (!fileRes.ok)
      throw new Error(
        `Cannot download file content: ${fileRes.status} ${fileRes.statusText}`
      );

    return await fileRes.arrayBuffer();
  } catch (err) {
    console.error("Graph download failed:", err);
    throw err;
  }
}
