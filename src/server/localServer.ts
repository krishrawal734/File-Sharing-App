import StaticServer from "react-native-local-server";
import * as FileSystem from "expo-file-system/legacy";
import * as Device from "expo-device";
import { getLocalIpAddress } from "../utils/networkUtils";
import { getWebDashboardHTML } from "./webDashboard";

let server: StaticServer | null = null;

const sharedDirectory = `${FileSystem.documentDirectory}shared-files/`;

/**
 * Make sure the shared directory exists
 */
async function ensureSharedDirectory() {
  const directoryInfo = await FileSystem.getInfoAsync(sharedDirectory);

  if (!directoryInfo.exists) {
    await FileSystem.makeDirectoryAsync(sharedDirectory, {
      intermediates: true,
    });
  }
}

function getMimeTypeFromExt(ext: string): string {
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    heic: "image/heic",
    mp4: "video/mp4",
    mov: "video/quicktime",
    avi: "video/x-msvideo",
    mkv: "video/x-matroska",
    webm: "video/webm",
    mp3: "audio/mpeg",
    wav: "audio/wav",
    m4a: "audio/m4a",
    aac: "audio/aac",
    pdf: "application/pdf",
    txt: "text/plain",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    zip: "application/zip",
    json: "application/json",
  };
  return map[ext] || "application/octet-stream";
}

/**
 * Scans sharedDirectory for shared user files and writes files.json index
 */
export async function updateFilesJsonIndex() {
  try {
    await ensureSharedDirectory();
    const entries = await FileSystem.readDirectoryAsync(sharedDirectory);

    const fileList: {
      name: string;
      size: number;
      mimeType: string;
      downloadUrl: string;
    }[] = [];

    for (const entry of entries) {
      if (
        entry === "index.html" ||
        entry === "files.json" ||
        entry === "airdropx" ||
        entry.startsWith("airdropx") ||
        entry.startsWith(".")
      ) {
        continue;
      }

      const filePath = `${sharedDirectory}${entry}`;
      const info = await FileSystem.getInfoAsync(filePath);

      if (info.exists && !info.isDirectory) {
        const ext = entry.split(".").pop()?.toLowerCase() || "";
        fileList.push({
          name: entry,
          size: info.size || 0,
          mimeType: getMimeTypeFromExt(ext),
          downloadUrl: `/${encodeURIComponent(entry)}`,
          addedAt: (info as any).modificationTime ? (info as any).modificationTime * 1000 : Date.now(),
        });
      }
    }

    const filesJsonPath = `${sharedDirectory}files.json`;
    await FileSystem.writeAsStringAsync(
      filesJsonPath,
      JSON.stringify({ files: fileList }, null, 2)
    );
  } catch (error) {
    console.log("Failed to update files.json index:", error);
  }
}

/**
 * Ensures index.html Web Dashboard exists
 */
export async function ensureWebDashboard() {
  try {
    await ensureSharedDirectory();
    const indexPath = `${sharedDirectory}index.html`;
    const htmlContent = getWebDashboardHTML();
    await FileSystem.writeAsStringAsync(indexPath, htmlContent);
  } catch (error) {
    console.log("Failed to write web dashboard HTML:", error);
  }
}

/**
 * Generates deviceInfo file for server discovery
 */
export async function ensureDeviceInfoFile(port: number = 8080) {
  try {
    await ensureSharedDirectory();
    const deviceInfoDir = `${sharedDirectory}airdropx`;
    const deviceInfoPath = `${sharedDirectory}airdropx/info`;
    const ip = (await getLocalIpAddress()) || "127.0.0.1";
    const info = {
      name: Device.deviceName || "Air-DropX Device",
      ip,
      port,
      protocolVersion: "1.0",
      capabilities: {
        sendFiles: true,
        receiveFiles: true,
        sendFolders: true,
        receiveFolders: true,
      },
    };

    const existing = await FileSystem.getInfoAsync(deviceInfoDir);
    if (existing.exists && !existing.isDirectory) {
      await FileSystem.deleteAsync(deviceInfoDir, { idempotent: true });
    }

    const dirCheck = await FileSystem.getInfoAsync(deviceInfoDir);
    if (!dirCheck.exists) {
      await FileSystem.makeDirectoryAsync(deviceInfoDir, { intermediates: true });
    }

    await FileSystem.writeAsStringAsync(deviceInfoPath, JSON.stringify(info));
  } catch (error) {
    console.log("Failed to write deviceInfo file:", error);
  }
}

/**
 * Remove legacy sample file if present
 */
async function removeLegacySampleFile() {
  try {
    const samplePath = `${sharedDirectory}sample-file.txt`;
    const info = await FileSystem.getInfoAsync(samplePath);
    if (info.exists) {
      await FileSystem.deleteAsync(samplePath, { idempotent: true });
    }
  } catch {
    // Ignore error
  }
}

/**
 * Finds a unique filename in sharedDirectory if collision occurs
 */
async function getUniqueDestinationFileName(fileName: string): Promise<string> {
  const dot = fileName.lastIndexOf(".");
  const stem = dot > 0 ? fileName.substring(0, dot) : fileName;
  const ext = dot > 0 ? fileName.substring(dot) : "";

  let targetName = fileName;
  let counter = 1;

  while (true) {
    const info = await FileSystem.getInfoAsync(`${sharedDirectory}${targetName}`);
    if (!info.exists) {
      return targetName;
    }
    targetName = `${stem} (${counter})${ext}`;
    counter++;
  }
}

/**
 * Remove all files from the previous transfer
 */
export async function clearSharedFiles() {
  try {
    await ensureSharedDirectory();

    const files = await FileSystem.readDirectoryAsync(sharedDirectory);

    await Promise.all(
      files
        .filter(
          (fileName) =>
            fileName !== "index.html" &&
            fileName !== "files.json" &&
            fileName !== "airdropx" &&
            !fileName.startsWith("airdropx")
        )
        .map((fileName) =>
          FileSystem.deleteAsync(`${sharedDirectory}${fileName}`, {
            idempotent: true,
          })
        )
    );

    await ensureWebDashboard();
    await updateFilesJsonIndex();
    console.log("Shared directory cleared.");
  } catch (error) {
    console.log("Failed to clear shared files:", error);
    throw error;
  }
}

/**
 * Remove a single shared file by name
 */
export async function removeSharedFile(fileName: string) {
  try {
    await ensureSharedDirectory();
    await FileSystem.deleteAsync(`${sharedDirectory}${fileName}`, {
      idempotent: true,
    });
    await updateFilesJsonIndex();
    console.log(`Shared file removed: ${fileName}`);
  } catch (error) {
    console.log(`Failed to remove shared file ${fileName}:`, error);
    throw error;
  }
}

/**
 * Start local HTTP server with automatic port fallback to prevent EADDRINUSE errors
 */
export async function startLocalServer() {
  try {
    await ensureSharedDirectory();
    await removeLegacySampleFile();

    // Write index.html Web Dashboard and files.json index
    await ensureWebDashboard();

    if (server) {
      try {
        const running = await server.isRunning();
        if (running) {
          const existingUrl = server.getURL();
          if (existingUrl) {
            const currentIp = await getLocalIpAddress();
            return currentIp && currentIp !== "0.0.0.0"
              ? `http://${currentIp}:${server.port}`
              : existingUrl;
          }
        }
      } catch (e) {
        console.log("Error checking server state, resetting server instance:", e);
      }

      try {
        await server.stop();
      } catch {
        // Ignore stop error during reset
      }
      server = null;
    }

    const candidatePorts = [8080, 8085, 8090, 8888, 9090];
    let lastError: any = null;
    const ipAddress = await getLocalIpAddress();

    for (const port of candidatePorts) {
      try {
        console.log(`Attempting to start StaticServer on port ${port}...`);
        await ensureDeviceInfoFile(port);
        const newServer = new StaticServer(port, sharedDirectory, { localOnly: false });
        const startedUrl = await newServer.start();
        server = newServer;
        const finalUrl = ipAddress && ipAddress !== "0.0.0.0"
          ? `http://${ipAddress}:${port}`
          : startedUrl || `http://localhost:${port}`;
        console.log(`Local server started on port ${port}: ${finalUrl}`);
        return finalUrl;
      } catch (err: any) {
        console.log(
          `Port ${port} unavailable (${err?.message || err}), trying next port...`
        );
        lastError = err;
      }
    }

    throw lastError || new Error("Failed to bind local server to any candidate port.");
  } catch (error) {
    console.log("Failed to start local server:", error);
    throw error;
  }
}

/**
 * Copy a single selected file into the transfer directory (with auto collision handling)
 */
export async function copyFileToServer(sourceUri: string, fileName: string) {
  try {
    await ensureSharedDirectory();
    let cleanName = fileName.replace(/[\/\\]/g, "_").trim();
    if (!cleanName || cleanName === "." || cleanName === ".." ||
        ["index.html", "files.json", "airdropx"].includes(cleanName.toLowerCase())) {
      cleanName = `shared_file_${Date.now()}`;
    }

    const uniqueName = await getUniqueDestinationFileName(cleanName);
    const destinationUri = `${sharedDirectory}${uniqueName}`;

    await FileSystem.copyAsync({
      from: sourceUri,
      to: destinationUri,
    });

    await updateFilesJsonIndex();
    console.log("File copied to server:", destinationUri);
    return destinationUri;
  } catch (error) {
    console.log("Failed to copy file:", error);
    throw error;
  }
}

/**
 * Copy multiple files into the transfer directory in batch
 */
export async function copyMultipleFilesToServer(files: { uri: string; name: string }[]) {
  try {
    await ensureSharedDirectory();
    for (const file of files) {
      let cleanName = file.name.replace(/[\/\\]/g, "_").trim();
      if (!cleanName || cleanName === "." || cleanName === ".." ||
          ["index.html", "files.json", "airdropx"].includes(cleanName.toLowerCase())) {
        cleanName = `shared_file_${Date.now()}`;
      }
      const uniqueName = await getUniqueDestinationFileName(cleanName);
      const destinationUri = `${sharedDirectory}${uniqueName}`;
      await FileSystem.copyAsync({
        from: file.uri,
        to: destinationUri,
      });
    }
    await updateFilesJsonIndex();
    console.log(`Successfully copied batch of ${files.length} files to server.`);
  } catch (error) {
    console.log("Failed to copy multiple files batch:", error);
    throw error;
  }
}

/**
 * Stop local server
 */
export async function stopLocalServer() {
  try {
    if (server) {
      await server.stop();
      server = null;
      console.log("Local server stopped");
    }
  } catch (error) {
    console.log("Failed to stop local server:", error);
  }
}