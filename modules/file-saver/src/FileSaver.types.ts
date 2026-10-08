export type FileSaverModuleType = {
  saveToGallery(
    sourceUri: string,
    fileName: string,
    mimeType: string
  ): Promise<string>;

  saveToDownloads(
    sourceUri: string,
    fileName: string,
    mimeType: string
  ): Promise<string>;

  saveToAppDocuments?(
    sourceUri: string,
    fileName: string
  ): Promise<string>;
};

export type SaveFileResult = {
  uri: string;
  savedTo: "gallery" | "storage";
};