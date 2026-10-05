import StaticServer from "react-native-local-server";
import * as FileSystem from "expo-file-system/legacy";
import { getLocalIpAddress } from "../utils/networkUtils";
import { getWebDashboardHTML } from "./webDashboard";

let server: StaticServer | null = null;

const sharedDirectory =
  `${FileSystem.documentDirectory}shared-files/`;

/**
 * Make sure the shared directory exists
 */
async function ensureSharedDirectory() {
  const directoryInfo =
    await FileSystem.getInfoAsync(
      sharedDirectory
    );

  if (!directoryInfo.exists) {
    await FileSystem.makeDirectoryAsync(
      sharedDirectory,
      {
        intermediates: true,
      }
    );
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
    console.log("Web Dashboard created at:", indexPath);
  } catch (error) {
    console.log("Failed to write index.html:", error);
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

    const files =
      await FileSystem.readDirectoryAsync(
        sharedDirectory
      );

    await Promise.all(
      files.map((fileName) =>
        FileSystem.deleteAsync(`${sharedDirectory}${fileName}`, { idempotent: true })
      )
    );

    console.log("Shared directory cleared.");
  } catch (error) {
    console.log(
      "Failed to clear shared files:",
      error
    );

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

    // Write index.html Web Dashboard
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
        const newServer = new StaticServer(port, sharedDirectory);
        const startedUrl = await newServer.start();
        server = newServer;

        const finalUrl = (ipAddress && ipAddress !== "0.0.0.0")
          ? `http://${ipAddress}:${port}`
          : startedUrl;

        console.log(`Local server started successfully on port ${port}:`, finalUrl);
        return finalUrl;
      } catch (err: any) {
        console.log(`Port ${port} unavailable (${err?.message || err}), trying next port...`);
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
export async function copyFileToServer(
  sourceUri: string,
  fileName: string
) {
  try {
    await ensureSharedDirectory();

    const destinationUri =
      `${sharedDirectory}${fileName}`;

    await FileSystem.copyAsync({
      from: sourceUri,
      to: destinationUri,
    });

    console.log(
      "File copied to server:",
      destinationUri
    );

    return destinationUri;
  } catch (error) {
    console.log(
      "Failed to copy file:",
      error
    );

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

      console.log(
        "Local server stopped"
      );
    }
  } catch (error) {
    console.log(
      "Failed to stop local server:",
      error
    );
  }
}