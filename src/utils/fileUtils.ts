export function formatFileSize(
  bytes: number
): string {
  if (bytes === 0) {
    return "0 Bytes";
  }

  const units = [
    "Bytes",
    "KB",
    "MB",
    "GB",
  ];

  const index = Math.floor(
    Math.log(bytes) / Math.log(1024)
  );

  const size =
    bytes /
    Math.pow(1024, index);

  return `${size.toFixed(2)} ${
    units[index] || "GB"
  }`;
}

// --------------------------------
// GET FILE EXTENSION
// --------------------------------

export function getFileExtension(
  fileName: string
): string {
  const parts =
    fileName.split(".");

  if (parts.length <= 1) {
    return "";
  }

  return parts[
    parts.length - 1
  ].toLowerCase();
}

// --------------------------------
// CHECK IMAGE
// --------------------------------

export function isImageFile(
  fileName: string
): boolean {
  const extension =
    getFileExtension(fileName);

  return [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "webp",
    "heic",
    "heif",
  ].includes(extension);
}

// --------------------------------
// CHECK VIDEO
// --------------------------------

export function isVideoFile(
  fileName: string
): boolean {
  const extension =
    getFileExtension(fileName);

  return [
    "mp4",
    "mov",
    "mkv",
    "avi",
    "webm",
    "3gp",
    "m4v",
  ].includes(extension);
}

// --------------------------------
// CHECK MEDIA
// --------------------------------

export function isMediaFile(
  fileName: string
): boolean {
  return (
    isImageFile(fileName) ||
    isVideoFile(fileName)
  );
}