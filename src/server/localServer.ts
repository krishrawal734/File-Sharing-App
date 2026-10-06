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
      path: string;
      size: number;
      ext: string;
      url: string;
      mime: string;
      addedAt: number;
    }[] = [];

    for (const name of entries) {
      if (
        name === "index.html" ||
        name === "files.json" ||
        name === "sample-file.txt" ||
        name === "airdropx"
      ) {
        continue;
      }

      const filePath = `${sharedDirectory}${name}`;
      const info = await FileSystem.getInfoAsync(filePath);

      if (info.exists && !info.isDirectory) {
        const parts = name.split(".");
        const ext = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";

        fileList.push({
          name: name,
          path: name,
          size: info.size || 0,
          ext: ext,
          url: `/${encodeURIComponent(name)}`,
          mime: getMimeTypeFromExt(ext),
          addedAt: info.modificationTime ? info.modificationTime * 1000 : Date.now(),
        });
      }
    }

    const indexPath = `${sharedDirectory}files.json`;
    await FileSystem.writeAsStringAsync(indexPath, JSON.stringify(fileList), {
      encoding: FileSystem.EncodingType.UTF8,
    });
    console.log(`[AirDropX] Updated files.json index (${fileList.length} files)`);
  } catch (error) {
    console.log("Failed to update files.json index:", error);
  }
}

/**
 * Ensure index.html Web Dashboard exists in shared directory
 */
export async function ensureWebDashboard() {
  try {
    await ensureSharedDirectory();
    const indexPath = `${sharedDirectory}index.html`;
    await FileSystem.writeAsStringAsync(indexPath, getWebDashboardHTML(), {
      encoding: FileSystem.EncodingType.UTF8,
    });
    await updateFilesJsonIndex();
    console.log("Web Dashboard created at:", indexPath);
  } catch (error) {
    console.log("Failed to write index.html:", error);
  }
}

/**
 * Ensure /airdropx/info discovery JSON file exists for mobile-to-mobile network discovery
 */
export async function ensureDeviceInfoFile(port: number = 8080) {
  try {
    await ensureSharedDirectory();
    const airdropxDir = `${sharedDirectory}airdropx/`;
    const dirInfo = await FileSystem.getInfoAsync(airdropxDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(airdropxDir, { intermediates: true });
    }

    const deviceName = Device.deviceName || `${Device.brand || "Android"} Phone`;
    const ip = await getLocalIpAddress();

    const infoPayload = {
      service: "air-dropx",
      deviceId: `device-${(ip || "0.0.0.0").replace(/\./g, "-")}`,
      deviceName: deviceName,
      platform: "android",
      deviceType: "phone",
      port: port,
      protocolVersion: "1.0",
      capabilities: {
        sendFiles: true,
        receiveFiles: true,
        sendFolders: true,
        receiveFolders: true,
      },
    };

    const infoPath = `${airdropxDir}info`;
    await FileSystem.writeAsStringAsync(infoPath, JSON.stringify(infoPayload), {
      encoding: FileSystem.EncodingType.UTF8,
    });
    console.log("Device discovery endpoint created at:", infoPath);
  } catch (error) {
    console.log("Failed to write device discovery info:", error);
  }
}

/**
 * Clean up legacy sample-file.txt if present
 */
async function removeLegacySampleFile() {
  try {
    const legacyPath = `${sharedDirectory}sample-file.txt`;
    const info = await FileSystem.getInfoAsync(legacyPath);
    if (info.exists) {
      await FileSystem.deleteAsync(legacyPath, { idempotent: true });
      console.log("Deleted legacy sample-file.txt");
    }
  } catch (e) {
    console.log("Error removing legacy sample file:", e);
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
            fileName !== "airdropx"
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
          const existingUrl = await server.getURL();
          if (existingUrl) {
            console.log("Reusing running local server:", existingUrl);
            return existingUrl;
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
        const newServer = new StaticServer(port, sharedDirectory);
        const startedUrl = await newServer.start();
        server = newServer;

        const finalUrl =
          ipAddress && ipAddress !== "0.0.0.0"
            ? `http://${ipAddress}:${port}`
            : startedUrl;

        console.log(
          `Local server started successfully on port ${port}:`,
          finalUrl
        );
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
 * Copy a selected file into the
 * current transfer directory
 */
export async function copyFileToServer(sourceUri: string, fileName: string) {
  try {
    await ensureSharedDirectory();

    const destinationUri = `${sharedDirectory}${fileName}`;

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