import FileSaver from "./src/FileSaverModule";
import { SaveFileResult } from "./src/FileSaver.types";

export * from "./src/FileSaver.types";

/**
 * Determines whether a file is a photo or video based on mime type or file extension.
 */
export function isPhotoOrVideo(fileName: string, mimeType?: string): boolean {
  if (mimeType) {
    const lowerMime = mimeType.toLowerCase();
    if (lowerMime.startsWith("image/") || lowerMime.startsWith("video/")) {
      return true;
    }
  }

  const cleanName = fileName
    .replace(/\s*\([\d.]+\s*(?:Bytes|B|KB|MB|GB|TB)\)/gi, "")
    .split("?")[0]
    .trim();

  const parts = cleanName.split(".");
  if (parts.length <= 1) return false;

  const ext = parts[parts.length - 1].toLowerCase();
  const mediaExtensions = [
    "jpg", "jpeg", "png", "gif", "webp", "heic", "heif", "bmp", "svg",
    "mp4", "mov", "mkv", "avi", "webm", "3gp", "m4v"
  ];

  return mediaExtensions.includes(ext);
}

/**
 * Saves a photo or video directly to the device gallery.
 */
export async function saveToGallery(
  fileUri: string,
  fileName: string,
  mimeType: string = ""
): Promise<string> {
  return await FileSaver.saveToGallery(fileUri, fileName, mimeType);
}

/**
 * Saves a PDF or other document locally to device file storage (Downloads directory).
 */
export async function saveToDownloads(
  fileUri: string,
  fileName: string,
  mimeType: string = ""
): Promise<string> {
  return await FileSaver.saveToDownloads(fileUri, fileName, mimeType);
}

/**
 * Intelligently saves a file: photos and videos to device gallery, PDFs and documents to file storage.
 */
export async function saveFile(
  fileUri: string,
  fileName: string,
  mimeType: string = ""
): Promise<SaveFileResult> {
  const isMedia = isPhotoOrVideo(fileName, mimeType);
  if (isMedia) {
    const uri = await saveToGallery(fileUri, fileName, mimeType);
    return { uri, savedTo: "gallery" };
  } else {
    const uri = await saveToDownloads(fileUri, fileName, mimeType);
    return { uri, savedTo: "storage" };
  }
}

export default {
  saveToGallery,
  saveToDownloads,
  saveFile,
  isPhotoOrVideo,
};
