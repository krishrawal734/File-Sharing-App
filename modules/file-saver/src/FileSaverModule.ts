import { NativeModule, requireNativeModule } from 'expo';

declare class FileSaverModule extends NativeModule<Record<string, never>> {
  saveToGallery(fileUri: string, fileName: string, mimeType: string): Promise<string>;
  saveToDownloads(fileUri: string, fileName: string, mimeType: string): Promise<string>;
  saveToAppDocuments?(fileUri: string, fileName: string): Promise<string>;
}

export default requireNativeModule<FileSaverModule>('FileSaver');
