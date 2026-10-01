declare module "react-native-local-server" {
  export interface FileItem {
    name: string;
    path: string;
    url: string;
    size: number;
    mime: string;
    ext: string;
    modified: number;
  }

  export interface FilesAPIResponse {
    success: boolean;
    root: string;
    server: string;
    total: number;
    files: FileItem[];
  }

  export interface DirItem {
    name: string;
    path: string;
    type: "directory" | "file";
    children?: number;
    size?: number;
    mime?: string;
    ext?: string;
    url?: string;
    download?: string;
    modified?: number;
  }

  export interface DirAPIResponse {
    success: boolean;
    path: string;
    server: string;
    total: number;
    items: DirItem[];
  }

  export interface StaticServerOptions {
    localOnly?: boolean;
  }

  export default class StaticServer {
    port: number;
    root: string;
    localOnly: boolean;

    constructor(port?: number, root?: string, options?: StaticServerOptions);

    start(): Promise<string>;
    stop(): Promise<void>;
    isRunning(): Promise<boolean>;
    getURL(): string | null;
    getFilesAPIUrl(): string | null;
    getFiles(): Promise<FilesAPIResponse>;
    getDownloadURL(relativePath: string): string | null;
    getDirAPIUrl(dirPath?: string): string | null;
    getDir(dirPath?: string): Promise<DirAPIResponse>;
    getFileURL(relativePath: string): string | null;

    static getIPAddress(): Promise<string>;
  }
}
