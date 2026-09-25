function sanitizeFilename(name: string) {
  const trimmed = name.trim() || "image";
  return trimmed.replace(/[^\w.\- ()[\]]+/g, "_");
}

function extensionFromUrl(url: string) {
  try {
    const pathname = new URL(url).pathname;
    const match = pathname.match(/\.([a-zA-Z0-9]+)$/);
    return match?.[1]?.toLowerCase();
  } catch {
    return undefined;
  }
}

export async function downloadImageFile(
  imageUrl: string,
  titleOrFilename: string,
) {
  const response = await fetch(imageUrl, { mode: "cors" });
  if (!response.ok) {
    throw new Error("Could not download image");
  }

  const blob = await response.blob();
  const ext =
    extensionFromUrl(imageUrl) ||
    blob.type.split("/")[1]?.replace("jpeg", "jpg") ||
    "webp";

  let filename = sanitizeFilename(titleOrFilename);
  if (!filename.includes(".")) {
    filename = `${filename}.${ext}`;
  }

  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}
