import { NativeModule, requireNativeModule } from 'expo';

declare class FileSaverModule extends NativeModule<Record<string, never>> {
  saveToDownloads(fileUri: string, fileName: string, mimeType: string): Promise<string>;
}

export default requireNativeModule<FileSaverModule>('FileSaver');
