import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { getMimeType, saveFile } from "../downloadUtils";
import { isPhotoOrVideo } from "../../../modules/file-saver";

// Mock Native FileSaver module
jest.mock("../../../modules/file-saver/src/FileSaverModule", () => ({
  __esModule: true,
  default: {
    saveToGallery: jest.fn().mockImplementation((_uri: any, name: any) => Promise.resolve(`gallery://${name}`)),
    saveToDownloads: jest.fn().mockImplementation((_uri: any, name: any) => Promise.resolve(`file:///downloads/${name}`)),
    saveToAppDocuments: jest.fn().mockImplementation((_uri: any, name: any) => Promise.resolve(`file:///documents/${name}`)),
  },
}));

// Mock Expo MediaLibrary
jest.mock("expo-media-library", () => ({
  createAssetAsync: jest.fn().mockImplementation((uri: any) => Promise.resolve({ uri })),
  getPermissionsAsync: jest.fn().mockImplementation(() => Promise.resolve({ granted: true })),
  requestPermissionsAsync: jest.fn().mockImplementation(() => Promise.resolve({ granted: true })),
  getAlbumAsync: jest.fn().mockImplementation(() => Promise.resolve(null)),
  createAlbumAsync: jest.fn().mockImplementation(() => Promise.resolve({})),
  addAssetsToAlbumAsync: jest.fn().mockImplementation(() => Promise.resolve({})),
}));

describe("downloadUtils & file-saver module", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getMimeType", () => {
    it("returns correct MIME types for photo formats", () => {
      expect(getMimeType("photo.jpg")).toBe("image/jpeg");
      expect(getMimeType("image.png")).toBe("image/png");
      expect(getMimeType("graphic.gif")).toBe("image/gif");
      expect(getMimeType("pic.webp")).toBe("image/webp");
      expect(getMimeType("shot.heic")).toBe("image/heic");
    });

    it("returns correct MIME types for video formats", () => {
      expect(getMimeType("clip.mp4")).toBe("video/mp4");
      expect(getMimeType("movie.mov")).toBe("video/quicktime");
      expect(getMimeType("film.mkv")).toBe("video/x-matroska");
      expect(getMimeType("video.webm")).toBe("video/webm");
    });

    it("returns correct MIME types for PDFs and documents", () => {
      expect(getMimeType("document.pdf")).toBe("application/pdf");
      expect(getMimeType("notes.txt")).toBe("text/plain");
      expect(getMimeType("paper.docx")).toBe("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      expect(getMimeType("sheet.xlsx")).toBe("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      expect(getMimeType("archive.zip")).toBe("application/zip");
    });

    it("returns default application/octet-stream for unknown extensions", () => {
      expect(getMimeType("data.unknownext")).toBe("application/octet-stream");
    });
  });

  describe("isPhotoOrVideo helper", () => {
    it("identifies photos and videos correctly by extension and mimeType", () => {
      expect(isPhotoOrVideo("vacation.jpg")).toBe(true);
      expect(isPhotoOrVideo("video.mp4")).toBe(true);
      expect(isPhotoOrVideo("file.bin", "image/png")).toBe(true);
      expect(isPhotoOrVideo("file.bin", "video/mp4")).toBe(true);
    });

    it("identifies PDFs and documents as non-media", () => {
      expect(isPhotoOrVideo("report.pdf")).toBe(false);
      expect(isPhotoOrVideo("data.csv")).toBe(false);
      expect(isPhotoOrVideo("file.bin", "application/pdf")).toBe(false);
    });
  });

  describe("saveFile routing", () => {
    it("routes photos and videos to device gallery", async () => {
      const photoResult = await saveFile("/tmp/photo.jpg", "photo.jpg");
      expect(photoResult.savedTo).toBe("gallery");

      const videoResult = await saveFile("/tmp/video.mp4", "video.mp4");
      expect(videoResult.savedTo).toBe("gallery");
    });

    it("routes PDFs and documents to device file storage", async () => {
      const pdfResult = await saveFile("/tmp/document.pdf", "document.pdf");
      expect(pdfResult.savedTo).toBe("storage");

      const docxResult = await saveFile("/tmp/notes.docx", "notes.docx");
      expect(docxResult.savedTo).toBe("storage");
    });
  });
});
