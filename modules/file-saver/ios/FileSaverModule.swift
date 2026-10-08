import ExpoModulesCore
import Photos

public class FileSaverModule: Module {
  public func definition() -> ModuleDefinition {
    Name("FileSaver")

    AsyncFunction("saveToGallery") { (sourceUri: String, fileName: String, mimeType: String) -> String in
      guard let url = URL(string: sourceUri.hasPrefix("file://") || sourceUri.hasPrefix("/") ? sourceUri : "file://" + sourceUri) else {
        throw NSError(domain: "FileSaver", code: 400, userInfo: [NSLocalizedDescriptionKey: "Invalid file URI"])
      }

      let fileUrl = url.isFileURL ? url : URL(fileURLWithPath: url.path)
      guard FileManager.default.fileExists(atPath: fileUrl.path) else {
        throw NSError(domain: "FileSaver", code: 404, userInfo: [NSLocalizedDescriptionKey: "File does not exist: \(sourceUri)"])
      }

      let isVideo = mimeType.hasPrefix("video/") || ["mp4", "mov", "mkv", "avi", "webm", "3gp", "m4v"].contains(fileUrl.pathExtension.lowercased())

      var placeholder: PHObjectPlaceholder?

      try PHPhotoLibrary.shared().performChangesAndWait {
        if isVideo {
          let request = PHAssetChangeRequest.creationRequestForAssetFromVideo(atFileURL: fileUrl)
          placeholder = request?.placeholderForCreatedAsset
        } else {
          let request = PHAssetChangeRequest.creationRequestForAssetFromImage(atFileURL: fileUrl)
          placeholder = request?.placeholderForCreatedAsset
        }
      }

      guard let localIdentifier = placeholder?.localIdentifier else {
        throw NSError(domain: "FileSaver", code: 500, userInfo: [NSLocalizedDescriptionKey: "Failed to create gallery asset"])
      }

      return "ph://" + localIdentifier
    }

    // Kept for compatibility; iOS has no public Downloads folder available to apps.
    AsyncFunction("saveToDownloads") { (sourceUri: String, fileName: String, _: String) -> String in
      return try self.copyToAppDocuments(sourceUri: sourceUri, fileName: fileName)
    }

    AsyncFunction("saveToAppDocuments") { (sourceUri: String, fileName: String) -> String in
      return try self.copyToAppDocuments(sourceUri: sourceUri, fileName: fileName)
    }
  }

  private func copyToAppDocuments(sourceUri: String, fileName: String) throws -> String {
    guard !fileName.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty,
          fileName != ".", fileName != "..", !fileName.contains("/"), !fileName.contains("\\"),
          !fileName.unicodeScalars.contains(where: { CharacterSet.controlCharacters.contains($0) }) else {
      throw NSError(domain: "FileSaver", code: 1, userInfo: [NSLocalizedDescriptionKey: "Invalid file name."])
    }

    let source: URL
    if sourceUri.hasPrefix("/") {
      source = URL(fileURLWithPath: sourceUri)
    } else if let url = URL(string: sourceUri), url.isFileURL {
      source = url
    } else {
      throw NSError(domain: "FileSaver", code: 2, userInfo: [NSLocalizedDescriptionKey: "Only local file URIs are supported."])
    }

    let manager = FileManager.default
    var isDirectory: ObjCBool = false
    guard manager.fileExists(atPath: source.path, isDirectory: &isDirectory), !isDirectory.boolValue else {
      throw NSError(domain: "FileSaver", code: 3, userInfo: [NSLocalizedDescriptionKey: "Source file does not exist."])
    }

    // Existing app.json file-sharing settings expose Documents in Files (On My iPhone/iPad).
    let documents = manager.urls(for: .documentDirectory, in: .userDomainMask)[0]
      .appendingPathComponent("File Sharing", isDirectory: true)
    try manager.createDirectory(at: documents, withIntermediateDirectories: true)

    let dot = fileName.lastIndex(of: ".")
    let stem: String
    let ext: String
    if let dot, dot != fileName.startIndex {
      stem = String(fileName[..<dot])
      ext = String(fileName[dot...])
    } else {
      stem = fileName
      ext = ""
    }
    var suffix = 0
    var destination: URL
    repeat {
      let name = suffix == 0 ? fileName : "\(stem) (\(suffix))\(ext)"
      destination = documents.appendingPathComponent(name, isDirectory: false)
      suffix += 1
    } while manager.fileExists(atPath: destination.path)

    // copyItem fails rather than overwriting an existing file if another save raced us.
    try manager.copyItem(at: source, to: destination)
    return destination.absoluteString
  }
}
