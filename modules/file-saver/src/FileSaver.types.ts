// Define your exported module types here.
import {
  requireNativeModule,
} from "expo-modules-core";

type FileSaverModuleType = {
  saveToDownloads(
    sourceUri: string,
    fileName: string,
    mimeType: string
  ): Promise<string>;
};

const FileSaver =
  requireNativeModule<FileSaverModuleType>(
    "FileSaver"
  );

export default FileSaver;