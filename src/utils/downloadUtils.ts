import { Platform } from "react-native";
import * as MediaLibrary from "expo-media-library";
import FileSaver from "../../modules/file-saver/src/FileSaverModule";
import { isMediaFile } from "./fileUtils";

export function getMimeType(fileName: string): string {
  const cleanName = fileName
    .replace(/\s*\([\d.]+\s*(?:Bytes|B|KB|MB|GB|TB)\)/gi, "")
    .split("?")[0]
    .trim();

  const extension = cleanName.split(".").pop()?.toLowerCase();

  switch (extension) {
    // Images
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "gif":
      return "image/gif";
    case "webp":
      return "image/webp";
    case "heic":
      return "image/heic";
    case "heif":
      return "image/heif";
    case "bmp":
      return "image/bmp";
    case "svg":
      return "image/svg+xml";

    // Videos
    case "mp4":
      return "video/mp4";
    case "mov":
      return "video/quicktime";
    case "mkv":
      return "video/x-matroska";
    case "avi":
      return "video/x-msvideo";
    case "webm":
      return "video/webm";
    case "3gp":
      return "video/3gpp";
    case "m4v":
      return "video/mp4";

    // Documents & PDFs
    case "pdf":
      return "application/pdf";
    case "doc":
      return "application/msword";
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "xls":
      return "application/vnd.ms-excel";
    case "xlsx":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    case "ppt":
      return "application/vnd.ms-powerpoint";
    case "pptx":
      return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    case "txt":
      return "text/plain";
    case "csv":
      return "text/csv";
    case "json":
      return "application/json";

    // Audio & Archives
    case "mp3":
      return "audio/mpeg";
    case "wav":
      return "audio/wav";
    case "m4a":
      return "audio/mp4";
    case "aac":
      return "audio/aac";
    case "flac":
      return "audio/flac";
    case "zip":
      return "application/zip";
    case "rar":
      return "application/vnd.rar";
    case "7z":
      return "application/x-7z-compressed";

    default:
      return "application/octet-stream";
  }
}

/**
 * Saves photo or video directly to the device gallery using FileSaver module with MediaLibrary fallback.
 */
export async function saveFileToGallery(
  fileUri: string,
  fileName: string
): Promise<string> {
  const mimeType = getMimeType(fileName);

  try {
    if (FileSaver && typeof FileSaver.saveToGallery === "function") {
      const result = await FileSaver.saveToGallery(fileUri, fileName, mimeType);
      console.log("Saved to Gallery via FileSaver module:", result);
      return result;
    }
  } catch (nativeError) {
    console.log("Native FileSaver saveToGallery error, falling back to MediaLibrary:", nativeError);
  }

  // Fallback to MediaLibrary (for Expo Go or if native module method fails)
  const ml: any = MediaLibrary;
  const createAsset = ml.createAssetAsync || ml.default?.createAssetAsync;
  const getPermissions = ml.getPermissionsAsync || ml.default?.getPermissionsAsync;
  const requestPermissions = ml.requestPermissionsAsync || ml.default?.requestPermissionsAsync;
  const getAlbum = ml.getAlbumAsync || ml.default?.getAlbumAsync;
  const createAlbum = ml.createAlbumAsync || ml.default?.createAlbumAsync;
  const addAssetsToAlbum = ml.addAssetsToAlbumAsync || ml.default?.addAssetsToAlbumAsync;

  let asset: any;
  try {
    asset = await createAsset(fileUri);
  } catch {
    let permission = await getPermissions?.(true);
    if (!permission?.granted) {
      permission = await getPermissions?.(false);
    }
    if (!permission?.granted) {
      permission = await requestPermissions?.(true);
    }
    if (!permission?.granted) {
      permission = await requestPermissions?.(false);
    }
    if (!permission?.granted) {
      throw new Error("Gallery permission was not granted.");
    }
    asset = await createAsset(fileUri);
  }

  try {
    let album = await getAlbum?.("File Sharing");
    if (!album) {
      await createAlbum?.("File Sharing", asset, false);
    } else {
      await addAssetsToAlbum?.([asset], album, false);
    }
  } catch (albumError) {
    console.log("Could not add to File Sharing album, saved to main gallery:", albumError);
  }

  return asset?.uri || fileUri;
}

/**
 * Saves PDFs and other documents locally to device file storage (Downloads).
 */
export async function saveFileToDownloads(
  fileUri: string,
  fileName: string
): Promise<string> {
  const mimeType = getMimeType(fileName);

  try {
    if (FileSaver && typeof FileSaver.saveToDownloads === "function") {
      if (Platform.OS === "android" && Number(Platform.Version) >= 29) {
        const result = await FileSaver.saveToDownloads(fileUri, fileName, mimeType);
        console.log("Saved to Downloads via FileSaver module:", result);
        return result;
      } else if (Platform.OS === "android" || Platform.OS === "ios") {
        try {
          const result = await FileSaver.saveToDownloads(fileUri, fileName, mimeType);
          console.log("Saved to storage via FileSaver module:", result);
          return result;
        } catch {
          if (FileSaver.saveToAppDocuments) {
            const fallbackResult = await FileSaver.saveToAppDocuments(fileUri, fileName);
            console.log("Saved to app Documents fallback:", fallbackResult);
            return fallbackResult;
          }
        }
      }
    }
  } catch (nativeError) {
    console.log("FileSaver saveToDownloads native error:", nativeError);
    if (FileSaver && typeof FileSaver.saveToAppDocuments === "function") {
      return await FileSaver.saveToAppDocuments(fileUri, fileName);
    }
  }

  throw new Error("Saving files to storage is not supported on this device/platform.");
}

/**
 * Unified file saving method using FileSaver module:
 * Photos and videos -> saved directly to device gallery
 * PDFs and other documents -> saved locally to device file storage
 */
export async function saveFile(
  fileUri: string,
  fileName: string
): Promise<{ uri: string; savedTo: "gallery" | "storage" }> {
  if (isMediaFile(fileName)) {
    const uri = await saveFileToGallery(fileUri, fileName);
    return { uri, savedTo: "gallery" };
  } else {
    const uri = await saveFileToDownloads(fileUri, fileName);
    return { uri, savedTo: "storage" };
  }
}