export type FileType =
  | "image"
  | "video"
  | "audio"
  | "document"
  | "other";

export type SelectedFile = {
  id: string;
  name: string;
  size: number;
  uri: string;
  type: FileType;
  mimeType?: string;
};