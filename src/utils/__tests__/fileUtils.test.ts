import { describe, expect, it } from "@jest/globals";
import {
  formatFileSize,
  getFileExtension,
  isImageFile,
  isVideoFile,
  isMediaFile,
} from "../fileUtils";

describe("fileUtils", () => {
  describe("formatFileSize", () => {
    it("formats 0 bytes correctly", () => {
      expect(formatFileSize(0)).toBe("0 Bytes");
    });

    it("formats bytes, KB, MB, and GB accurately", () => {
      expect(formatFileSize(500)).toBe("500.00 Bytes");
      expect(formatFileSize(1024)).toBe("1.00 KB");
      expect(formatFileSize(1048576)).toBe("1.00 MB");
      expect(formatFileSize(1073741824)).toBe("1.00 GB");
    });
  });

  describe("getFileExtension", () => {
    it("extracts simple file extensions in lowercase", () => {
      expect(getFileExtension("photo.jpg")).toBe("jpg");
      expect(getFileExtension("IMAGE.PNG")).toBe("png");
      expect(getFileExtension("document.PDF")).toBe("pdf");
    });

    it("handles files with multiple dots", () => {
      expect(getFileExtension("archive.tar.gz")).toBe("gz");
    });

    it("returns empty string when no extension is present", () => {
      expect(getFileExtension("README")).toBe("");
      expect(getFileExtension("file_without_ext")).toBe("");
    });

    it("strips size annotation suffix if present", () => {
      expect(getFileExtension("vacation_photo (4.2 MB).jpg")).toBe("jpg");
    });
  });

  describe("isImageFile", () => {
    it("returns true for image formats", () => {
      expect(isImageFile("photo.jpg")).toBe(true);
      expect(isImageFile("graphic.png")).toBe(true);
      expect(isImageFile("animation.gif")).toBe(true);
      expect(isImageFile("picture.webp")).toBe(true);
      expect(isImageFile("shot.heic")).toBe(true);
    });

    it("returns false for non-image formats", () => {
      expect(isImageFile("video.mp4")).toBe(false);
      expect(isImageFile("song.mp3")).toBe(false);
      expect(isImageFile("doc.pdf")).toBe(false);
    });
  });

  describe("isVideoFile", () => {
    it("returns true for video formats", () => {
      expect(isVideoFile("movie.mp4")).toBe(true);
      expect(isVideoFile("clip.mov")).toBe(true);
      expect(isVideoFile("film.mkv")).toBe(true);
      expect(isVideoFile("stream.webm")).toBe(true);
    });

    it("returns false for non-video formats", () => {
      expect(isVideoFile("photo.png")).toBe(false);
      expect(isVideoFile("notes.txt")).toBe(false);
    });
  });

  describe("isMediaFile", () => {
    it("returns true for both images and videos", () => {
      expect(isMediaFile("photo.jpg")).toBe(true);
      expect(isMediaFile("movie.mp4")).toBe(true);
    });

    it("returns false for documents and audio", () => {
      expect(isMediaFile("document.docx")).toBe(false);
      expect(isMediaFile("code.ts")).toBe(false);
    });
  });
});
