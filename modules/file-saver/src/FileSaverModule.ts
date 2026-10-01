import { NativeModule, requireNativeModule } from 'expo';

declare class FileSaverModule extends NativeModule<{}> {
  saveToDownloads(fileUri: string, fileName: string, mimeType: string): Promise<string>;
}

export default requireNativeModule<FileSaverModule>('FileSaver');
