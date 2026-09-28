import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import * as FileSystem from "expo-file-system/legacy";

import * as MediaLibrary from "expo-media-library";

import {
  isMediaFile,
} from "../../utils/fileUtils";

import {
  saveFileToDownloads,
} from "../../utils/downloadUtils";

import {
  addTransferHistory,
} from "../../database/database";


type ServerFile = {
  name: string;
  size: number;
};


export default function ReceiveTransferScreen() {
  const params =
    useLocalSearchParams<{
      serverUrl?: string;
    }>();

  const serverUrl =
    typeof params.serverUrl === "string"
      ? params.serverUrl
      : "";

  const [files, setFiles] =
    useState<ServerFile[]>([]);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [progress, setProgress] =
    useState(0);

  const [downloadedBytes, setDownloadedBytes] =
    useState(0);

  const [totalBytes, setTotalBytes] =
    useState(0);

  const [speed, setSpeed] =
    useState(0);

  const [eta, setEta] =
    useState(0);

  const [downloading, setDownloading] =
    useState(false);

  const [paused, setPaused] =
    useState(false);

  const [cancelled, setCancelled] =
    useState(false);

  const [completed, setCompleted] =
    useState(false);

  const [message, setMessage] =
    useState("Connecting...");

  const downloadTaskRef =
    useRef<any>(null);

  const currentFileRef =
    useRef<ServerFile | null>(null);

  const pausedRef =
    useRef(false);

  const cancelledRef =
    useRef(false);

  const startTimeRef =
    useRef<number>(0);

  const lastTimeRef =
    useRef<number>(0);

  const lastBytesRef =
    useRef<number>(0);

  const historySavedRef =
    useRef<Set<string>>(
      new Set()
    );


  /*
   * --------------------------------
   * FORMAT FILE SIZE
   * --------------------------------
   */

  const formatBytes = (
    bytes: number
  ) => {
    if (
      !bytes ||
      bytes <= 0
    ) {
      return "0 B";
    }

    const units = [
      "B",
      "KB",
      "MB",
      "GB",
    ];

    const index = Math.floor(
      Math.log(bytes) /
        Math.log(1024)
    );

    const value =
      bytes /
      Math.pow(
        1024,
        index
      );

    return `${value.toFixed(2)} ${
      units[index] || "GB"
    }`;
  };


  /*
   * --------------------------------
   * FORMAT TIME
   * --------------------------------
   */

  const formatTime = (
    seconds: number
  ) => {
    if (
      !seconds ||
      seconds <= 0 ||
      !Number.isFinite(seconds)
    ) {
      return "--";
    }

    const totalSeconds =
      Math.round(seconds);

    const minutes =
      Math.floor(
        totalSeconds / 60
      );

    const remainingSeconds =
      totalSeconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }

    return `${remainingSeconds}s`;
  };


  /*
   * --------------------------------
   * SAVE HISTORY
   * --------------------------------
   */

  const saveTransferHistory =
    async (
      fileName: string,
      fileSize: number
    ) => {
      try {
        const historyKey =
          `${fileName}-${fileSize}`;

        if (
          historySavedRef.current.has(
            historyKey
          )
        ) {
          console.log(
            "History already saved:",
            fileName
          );

          return;
        }

        historySavedRef.current.add(
          historyKey
        );

        await addTransferHistory(
          fileName,
          fileSize,
          "completed",
          "received"
        );

        console.log(
          "Transfer history saved:",
          fileName
        );
      } catch (error) {
        console.log(
          "History save error:",
          error
        );
      }
    };


  /*
   * --------------------------------
   * SAVE MEDIA TO GALLERY
   * --------------------------------
   */

  const saveMediaToGallery =
    async (
      fileUri: string,
      fileName: string
    ) => {
      try {
        console.log(
          "Requesting media permission..."
        );

        const permission =
          await MediaLibrary.requestPermissionsAsync();

        if (!permission.granted) {
          throw new Error(
            "Gallery permission was not granted."
          );
        }

        console.log(
          "Creating gallery asset:",
          fileName
        );

        const asset =
          await MediaLibrary.createAssetAsync(
            fileUri
          );

        console.log(
          "Gallery asset created:",
          asset.uri
        );

        /*
         * Try to put the media inside
         * a File Sharing folder.
         */

        let album =
          await MediaLibrary.getAlbumAsync(
            "File Sharing"
          );

        if (!album) {
          album =
            await MediaLibrary.createAlbumAsync(
              "File Sharing",
              asset,
              false
            );

          console.log(
            "File Sharing album created."
          );
        } else {
          await MediaLibrary.addAssetsToAlbumAsync(
            [asset],
            album,
            false
          );

          console.log(
            "Asset added to File Sharing album."
          );
        }

        return asset.uri;
      } catch (error) {
        console.log(
          "Gallery save error:",
          error
        );

        throw error;
      }
    };


  /*
   * --------------------------------
   * PARSE SERVER HTML
   * --------------------------------
   */

  const parseServerFiles = (
    html: string
  ): ServerFile[] => {
    const result: ServerFile[] = [];

    /*
     * Example:
     *
     * <a href='photo.jpg'>
     * photo.jpg
     * <small>(2.4 MB)</small>
     * </a>
     */

    const linkRegex =
      /<a\s+href=['"]([^'"]+)['"][^>]*>([\s\S]*?)<\/a>/gi;

    let match;

    while (
      (match =
        linkRegex.exec(html)) !==
      null
    ) {
      const href =
        match[1];

      const content =
        match[2]
          .replace(
            /<[^>]+>/g,
            ""
          )
          .replace(
            /&#\d+;/g,
            ""
          )
          .trim();

      if (
        !href ||
        href === "/" ||
        href.endsWith("/")
      ) {
        continue;
      }

      let fileName =
        decodeURIComponent(
          href
        );

      /*
       * Remove possible path.
       */

      fileName =
        fileName.split("/").pop() ||
        fileName;

      /*
       * Try to find displayed file name.
       */

      if (content) {
        const cleanContent =
          content
            .replace(
              /\([^)]*MB\)/gi,
              ""
            )
            .trim();

        if (
          cleanContent &&
          !cleanContent.startsWith(
            "Index"
          )
        ) {
          fileName =
            cleanContent;
        }
      }

      /*
       * Extract size.
       */

      const sizeMatch =
        content.match(
          /\(([\d.]+)\s*(B|KB|MB|GB)\)/i
        );

      let size = 0;

      if (sizeMatch) {
        const value =
          parseFloat(
            sizeMatch[1]
          );

        const unit =
          sizeMatch[2].toUpperCase();

        if (unit === "B") {
          size = value;
        }

        if (unit === "KB") {
          size =
            value * 1024;
        }

        if (unit === "MB") {
          size =
            value *
            1024 *
            1024;
        }

        if (unit === "GB") {
          size =
            value *
            1024 *
            1024 *
            1024;
        }
      }

      result.push({
        name: fileName,
        size,
      });
    }

    return result;
  };


  /*
   * --------------------------------
   * GET SERVER FILES
   * --------------------------------
   */

  const loadServerFiles =
    async () => {
      try {
        setMessage(
          "Connecting to sender..."
        );

        console.log(
          "Receiver connecting to:",
          serverUrl
        );

        if (!serverUrl) {
          throw new Error(
            "Server URL is missing."
          );
        }

        const response =
          await fetch(
            serverUrl
          );

        console.log(
          "Server status:",
          response.status
        );

        if (!response.ok) {
          throw new Error(
            `Server returned ${response.status}`
          );
        }

        const html =
          await response.text();

        console.log(
          "Server HTML:",
          html
        );

        const serverFiles =
          parseServerFiles(
            html
          );

        console.log(
          "Server files:",
          serverFiles
        );

        if (
          serverFiles.length === 0
        ) {
          throw new Error(
            "No files found on sender."
          );
        }

        setFiles(
          serverFiles
        );

        setTotalBytes(
          serverFiles.reduce(
            (
              total,
              file
            ) =>
              total +
              file.size,
            0
          )
        );

        setMessage(
          `${serverFiles.length} file${
            serverFiles.length !== 1
              ? "s"
              : ""
          } ready to download.`
        );
      } catch (error: any) {
        console.log(
          "Server connection error:",
          error
        );

        setMessage(
          error?.message ||
            "Could not connect to sender."
        );
      }
    };


  /*
   * --------------------------------
   * DOWNLOAD FILE
   * --------------------------------
   */

  const downloadFile =
    async (
      file: ServerFile,
      index: number
    ) => {
      try {
        currentFileRef.current =
          file;

        cancelledRef.current =
          false;

        pausedRef.current =
          false;

        setCancelled(false);
        setPaused(false);
        setDownloading(true);
        setCompleted(false);

        setCurrentIndex(
          index
        );

        setProgress(0);
        setDownloadedBytes(0);

        setSpeed(0);
        setEta(0);

        setMessage(
          `Downloading ${file.name}...`
        );

        const encodedFileName =
          encodeURIComponent(
            file.name
          );

        const downloadUrl =
          `${serverUrl.replace(
            /\/$/,
            ""
          )}/${encodedFileName}`;

        console.log(
          "Starting download:",
          downloadUrl
        );

        const temporaryUri =
          `${FileSystem.cacheDirectory}${file.name}`;

        startTimeRef.current =
          Date.now();

        lastTimeRef.current =
          Date.now();

        lastBytesRef.current =
          0;

        const downloadResumable =
          FileSystem.createDownloadResumable(
            downloadUrl,
            temporaryUri,
            {},
            (
              downloadProgress
            ) => {
              const total =
                downloadProgress.totalBytesExpectedToWrite;

              const written =
                downloadProgress.totalBytesWritten;

              if (
                total > 0
              ) {
                const percent =
                  written /
                  total;

                setProgress(
                  percent
                );
              }

              setDownloadedBytes(
                written
              );

              /*
               * Speed calculation
               */

              const now =
                Date.now();

              const elapsed =
                (
                  now -
                  lastTimeRef.current
                ) / 1000;

              if (
                elapsed >= 0.5
              ) {
                const bytesSinceLast =
                  written -
                  lastBytesRef.current;

                const currentSpeed =
                  bytesSinceLast /
                  elapsed;

                setSpeed(
                  currentSpeed
                );

                const remaining =
                  total -
                  written;

                if (
                  currentSpeed > 0
                ) {
                  setEta(
                    remaining /
                      currentSpeed
                  );
                }

                lastTimeRef.current =
                  now;

                lastBytesRef.current =
                  written;
              }
            }
          );

        downloadTaskRef.current =
          downloadResumable;

        const result =
          await downloadResumable.downloadAsync();

        /*
         * If paused,
         * don't continue processing.
         */

        if (
          pausedRef.current
        ) {
          console.log(
            "Download paused."
          );

          return;
        }

        /*
         * If cancelled,
         * don't process the file.
         */

        if (
          cancelledRef.current
        ) {
          console.log(
            "Download cancelled."
          );

          return;
        }

        if (
          !result ||
          !result.uri
        ) {
          throw new Error(
            "Download did not return a file."
          );
        }

        const downloadedUri =
          result.uri;

        console.log(
          "Downloaded temporary file:",
          downloadedUri
        );

        /*
         * --------------------------------
         * SAVE FILE
         * --------------------------------
         */

        if (
          isMediaFile(
            file.name
          )
        ) {
          /*
           * IMAGE / VIDEO
           * → Gallery
           */

          setMessage(
            `Saving ${file.name} to Gallery...`
          );

          await saveMediaToGallery(
            downloadedUri,
            file.name
          );

          console.log(
            "Media saved to Gallery:",
            file.name
          );
        } else {
          /*
           * PDF / MUSIC / ZIP / DOC
           * → Downloads
           */

          setMessage(
            `Saving ${file.name} to Downloads...`
          );

          const savedUri =
            await saveFileToDownloads(
              downloadedUri,
              file.name
            );

          console.log(
            "File saved to Downloads:",
            savedUri
          );
        }

        /*
         * Save history only
         * after successful save.
         */

        await saveTransferHistory(
          file.name,
          file.size
        );

        /*
         * Delete temporary file.
         */

        try {
          await FileSystem.deleteAsync(
            downloadedUri,
            {
              idempotent: true,
            }
          );

          console.log(
            "Temporary file deleted:",
            file.name
          );
        } catch (deleteError) {
          console.log(
            "Temporary file cleanup error:",
            deleteError
          );
        }

        setProgress(1);

        setDownloadedBytes(
          file.size
        );

        setDownloading(false);

        setMessage(
          `${file.name} saved successfully.`
        );

        /*
         * Automatically download
         * the next file.
         */

        if (
          index <
          files.length - 1
        ) {
          const nextIndex =
            index + 1;

          setTimeout(() => {
            downloadFile(
              files[nextIndex],
              nextIndex
            );
          }, 700);
        } else {
          setCompleted(true);

          setMessage(
            "All files downloaded successfully."
          );
        }
      } catch (error: any) {
        console.log(
          "Download error:",
          error
        );

        setDownloading(false);

        if (
          cancelledRef.current
        ) {
          setMessage(
            "Download cancelled."
          );

          return;
        }

        if (
          pausedRef.current
        ) {
          setMessage(
            "Download paused."
          );

          return;
        }

        setMessage(
          error?.message ||
            "Download failed."
        );
      }
    };


  /*
   * --------------------------------
   * PAUSE
   * --------------------------------
   */

  const pauseDownload =
    async () => {
      try {
        if (
          !downloadTaskRef.current ||
          pausedRef.current
        ) {
          return;
        }

        pausedRef.current =
          true;

        setPaused(true);
        setDownloading(false);

        setMessage(
          "Download paused."
        );

        await downloadTaskRef.current.pauseAsync();

        console.log(
          "Download paused successfully."
        );
      } catch (error) {
        console.log(
          "Pause error:",
          error
        );

        pausedRef.current =
          false;

        setPaused(false);
      }
    };


  /*
   * --------------------------------
   * RESUME
   * --------------------------------
   */

  const resumeDownload =
    async () => {
      try {
        if (
          !downloadTaskRef.current ||
          !pausedRef.current
        ) {
          return;
        }

        pausedRef.current =
          false;

        setPaused(false);
        setDownloading(true);

        setMessage(
          "Resuming download..."
        );

        const result =
          await downloadTaskRef.current.resumeAsync();

        if (
          !result ||
          !result.uri
        ) {
          /*
           * Some Expo versions may
           * continue the task without
           * immediately returning result.
           */

          console.log(
            "Resume returned without result."
          );

          return;
        }

        const downloadedUri =
          result.uri;

        const currentFile =
          currentFileRef.current;

        if (!currentFile) {
          return;
        }

        /*
         * Save after resume completes.
         */

        if (
          isMediaFile(
            currentFile.name
          )
        ) {
          setMessage(
            `Saving ${currentFile.name} to Gallery...`
          );

          await saveMediaToGallery(
            downloadedUri,
            currentFile.name
          );
        } else {
          setMessage(
            `Saving ${currentFile.name} to Downloads...`
          );

          await saveFileToDownloads(
            downloadedUri,
            currentFile.name
          );
        }

        await saveTransferHistory(
          currentFile.name,
          currentFile.size
        );

        try {
          await FileSystem.deleteAsync(
            downloadedUri,
            {
              idempotent: true,
            }
          );
        } catch (error) {
          console.log(
            "Cleanup error:",
            error
          );
        }

        setProgress(1);

        setDownloadedBytes(
          currentFile.size
        );

        setDownloading(false);

        setMessage(
          `${currentFile.name} saved successfully.`
        );

        if (
          currentIndex <
          files.length - 1
        ) {
          const nextIndex =
            currentIndex + 1;

          setTimeout(() => {
            downloadFile(
              files[nextIndex],
              nextIndex
            );
          }, 700);
        } else {
          setCompleted(true);

          setMessage(
            "All files downloaded successfully."
          );
        }
      } catch (error: any) {
        console.log(
          "Resume error:",
          error
        );

        setDownloading(false);

        setMessage(
          error?.message ||
            "Resume failed."
        );
      }
    };


  /*
   * --------------------------------
   * CANCEL
   * --------------------------------
   */

  const cancelDownload =
    async () => {
      try {
        cancelledRef.current =
          true;

        pausedRef.current =
          false;

        setCancelled(true);
        setPaused(false);
        setDownloading(false);

        if (
          downloadTaskRef.current
        ) {
          await downloadTaskRef.current.cancelAsync();

          downloadTaskRef.current =
            null;
        }

        setMessage(
          "Download cancelled."
        );

        console.log(
          "Download cancelled successfully."
        );
      } catch (error) {
        console.log(
          "Cancel error:",
          error
        );
      }
    };


  /*
   * --------------------------------
   * RETRY
   * --------------------------------
   */

  const retryDownload =
    () => {
      if (
        !currentFileRef.current
      ) {
        return;
      }

      const currentFile =
        currentFileRef.current;

      downloadFile(
        currentFile,
        currentIndex
      );
    };


  /*
   * --------------------------------
   * START
   * --------------------------------
   */

  useEffect(() => {
    if (!serverUrl) {
      setMessage(
        "Server URL is missing."
      );

      return;
    }

    loadServerFiles();
  }, [serverUrl]);


  /*
   * --------------------------------
   * CURRENT FILE
   * --------------------------------
   */

  const currentFile =
    files[currentIndex];


  /*
   * --------------------------------
   * DOWNLOAD ALL
   * --------------------------------
   */

  const startDownload =
    () => {
      if (
        files.length === 0
      ) {
        Alert.alert(
          "No Files",
          "There are no files available."
        );

        return;
      }

      downloadFile(
        files[0],
        0
      );
    };


  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-1 px-5 pt-6">

        {/* HEADER */}

        <View className="mb-5">
          <Text className="text-2xl font-bold text-slate-900">
            Receive Files
          </Text>

          <Text className="mt-1 text-slate-500">
            Download files from the sender
          </Text>
        </View>


        {/* FILE LIST */}

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
        >
          {files.map(
            (
              file,
              index
            ) => (
              <View
                key={`${file.name}-${index}`}
                className="mb-3 rounded-2xl bg-white p-4"
              >
                <View className="flex-row items-center">

                  <View className="mr-4 h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                    <Text className="text-xl">
                      {isMediaFile(
                        file.name
                      )
                        ? "🎬"
                        : "📄"}
                    </Text>
                  </View>

                  <View className="flex-1">

                    <Text
                      className="font-semibold text-slate-900"
                      numberOfLines={1}
                    >
                      {file.name}
                    </Text>

                    <Text className="mt-1 text-sm text-slate-500">
                      {formatBytes(
                        file.size
                      )}
                    </Text>

                    <Text className="mt-1 text-xs text-slate-400">
                      {isMediaFile(
                        file.name
                      )
                        ? "Will be saved to Gallery"
                        : "Will be saved to Downloads"}
                    </Text>

                  </View>

                </View>
              </View>
            )
          )}
        </ScrollView>


        {/* PROGRESS */}

        {files.length > 0 &&
          !completed && (
            <View className="mt-4 rounded-2xl bg-white p-5">

              <View className="mb-3 flex-row items-center justify-between">

                <Text
                  className="flex-1 font-semibold text-slate-900"
                  numberOfLines={1}
                >
                  {currentFile?.name ||
                    "Ready"}
                </Text>

                <Text className="ml-3 font-semibold text-blue-600">
                  {Math.round(
                    progress * 100
                  )}%
                </Text>

              </View>


              {/* PROGRESS BAR */}

              <View className="h-3 overflow-hidden rounded-full bg-slate-200">

                <View
                  className="h-full rounded-full bg-blue-600"
                  style={{
                    width: `${Math.max(
                      0,
                      Math.min(
                        progress * 100,
                        100
                      )
                    )}%`,
                  }}
                />

              </View>


              {/* DOWNLOAD INFO */}

              <View className="mt-3 flex-row justify-between">

                <Text className="text-xs text-slate-500">
                  {formatBytes(
                    downloadedBytes
                  )}{" "}
                  /{" "}
                  {formatBytes(
                    totalBytes ||
                      currentFile?.size ||
                      0
                  )}
                </Text>

                <Text className="text-xs text-slate-500">
                  {formatBytes(
                    speed
                  )}
                  /s
                </Text>

              </View>


              {speed > 0 && (
                <Text className="mt-1 text-xs text-slate-400">
                  ETA:{" "}
                  {formatTime(
                    eta
                  )}
                </Text>
              )}


              {/* PAUSE / RESUME / CANCEL */}

              <View className="mt-4 flex-row">

                {downloading &&
                  !paused && (
                    <Pressable
                      onPress={
                        pauseDownload
                      }
                      className="mr-2 flex-1 rounded-xl bg-orange-500 py-3"
                    >
                      <Text className="text-center font-semibold text-white">
                        Pause
                      </Text>
                    </Pressable>
                  )}


                {paused && (
                  <Pressable
                    onPress={
                      resumeDownload
                    }
                    className="mr-2 flex-1 rounded-xl bg-blue-600 py-3"
                  >
                    <Text className="text-center font-semibold text-white">
                      Resume
                    </Text>
                  </Pressable>
                )}


                {(downloading ||
                  paused) && (
                  <Pressable
                    onPress={
                      cancelDownload
                    }
                    className="flex-1 rounded-xl bg-red-500 py-3"
                  >
                    <Text className="text-center font-semibold text-white">
                      Cancel
                    </Text>
                  </Pressable>
                )}

              </View>

            </View>
          )}


        {/* MESSAGE */}

        <View className="mt-4 items-center">

          {downloading && (
            <ActivityIndicator
              size="small"
              color="#2563EB"
            />
          )}

          <Text className="mt-2 text-center text-sm text-slate-500">
            {message}
          </Text>

        </View>


        {/* START DOWNLOAD */}

        {!downloading &&
          !paused &&
          !completed &&
          files.length > 0 &&
          !cancelled &&
          currentIndex === 0 &&
          progress === 0 && (
            <Pressable
              onPress={
                startDownload
              }
              className="mb-4 mt-4 rounded-2xl bg-blue-600 py-4"
            >
              <Text className="text-center text-base font-semibold text-white">
                Download All Files
              </Text>
            </Pressable>
          )}


        {/* RETRY */}

        {!downloading &&
          !paused &&
          !completed &&
          message
            .toLowerCase()
            .includes("failed") && (
            <Pressable
              onPress={
                retryDownload
              }
              className="mb-4 mt-4 rounded-2xl bg-orange-500 py-4"
            >
              <Text className="text-center text-base font-semibold text-white">
                Retry
              </Text>
            </Pressable>
          )}


        {/* COMPLETED */}

        {completed && (
          <View className="mb-4 mt-4">

            <View className="mb-4 items-center rounded-2xl bg-green-50 p-5">

              <Text className="text-4xl">
                ✅
              </Text>

              <Text className="mt-2 text-lg font-bold text-green-700">
                Transfer Complete
              </Text>

              <Text className="mt-1 text-center text-sm text-green-600">
                All files have been saved successfully.
              </Text>

            </View>


            <Pressable
              onPress={() =>
                router.replace("/")
              }
              className="rounded-2xl bg-blue-600 py-4"
            >
              <Text className="text-center text-base font-semibold text-white">
                Done
              </Text>
            </Pressable>

          </View>
        )}

      </View>
    </SafeAreaView>
  );
}