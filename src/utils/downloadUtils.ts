import FileSaver from "../../modules/file-saver/src/FileSaverModule";

export function getMimeType(
  fileName: string
): string {
  const extension =
    fileName
      .split(".")
      .pop()
      ?.toLowerCase();

  switch (extension) {
    case "pdf":
      return "application/pdf";

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

    default:
      return "application/octet-stream";
  }
}


export async function saveFileToDownloads(
  fileUri: string,
  fileName: string
) {
  const mimeType =
    getMimeType(fileName);

  console.log(
    "Saving to Android Downloads:",
    fileName
  );

  const result =
    await FileSaver.saveToDownloads(
      fileUri,
      fileName,
      mimeType
    );

  console.log(
    "Saved to Downloads:",
    result
  );

  return result;
}