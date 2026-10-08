import { registerWebModule, NativeModule } from 'expo';

class FileSaverModule extends NativeModule<Record<string, never>> {
  async saveToGallery(fileUri: string, fileName: string, mimeType?: string): Promise<string> {
    return this.saveToDownloads(fileUri, fileName, mimeType);
  }

  async saveToDownloads(fileUri: string, fileName: string, _mimeType?: string): Promise<string> {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const link = document.createElement('a');
      link.href = fileUri;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    return fileUri;
  }
}

export default registerWebModule(FileSaverModule, 'FileSaverModule');
