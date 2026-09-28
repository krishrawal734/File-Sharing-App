import StaticServer from "react-native-local-server";
import * as FileSystem from "expo-file-system/legacy";

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
 * Remove all files from the previous transfer
 */
export async function clearSharedFiles() {
  try {
    await ensureSharedDirectory();

    const files =
      await FileSystem.readDirectoryAsync(
        sharedDirectory
      );

    for (const fileName of files) {
      const fileUri =
        `${sharedDirectory}${fileName}`;

      await FileSystem.deleteAsync(
        fileUri,
        {
          idempotent: true,
        }
      );

      console.log(
        "Deleted old shared file:",
        fileName
      );
    }

    console.log(
      "Shared directory cleared."
    );
  } catch (error) {
    console.log(
      "Failed to clear shared files:",
      error
    );

    throw error;
  }
}

/**
 * Start local HTTP server
 */
export async function startLocalServer() {
  try {
    await ensureSharedDirectory();

    if (server) {
      const running =
        await server.isRunning();

      if (running) {
        return server.getURL();
      }
    }

    const newServer =
      new StaticServer(
        8080,
        sharedDirectory
      );

    const url =
      await newServer.start();

    server = newServer;

    console.log(
      "Local server started:",
      url
    );

    return url;
  } catch (error) {
    console.log(
      "Failed to start local server:",
      error
    );

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