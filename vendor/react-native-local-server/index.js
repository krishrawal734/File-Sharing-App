import { NativeModules, Platform , } from 'react-native';

const LINKING_ERROR =
  `The package 'react-native-local-server' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const LocalServer = NativeModules.LocalServer
  ? NativeModules.LocalServer
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export default class StaticServer {
  constructor(port = 8080, root = '', options = {}) {
    this.port = port;
    this.root = root;
    this.localOnly = options.localOnly || false;
    this._url = null;
    this._running = false;
  }

  /**
   * Start the static file server.
   * @returns {Promise<string>} The URL of the running server (e.g. "http://192.168.1.10:8080")
   */
  async start() {
    if (this._running) {
      return this._url;
    }
    const url = await LocalServer.start(this.port, this.root, this.localOnly);
    this._url = url;
    this._running = true;
    return url;
  }

  /**
   * Stop the static file server.
   * @returns {Promise<void>}
   */
  async stop() {
    if (!this._running) return;
    await LocalServer.stop();
    this._running = false;
    this._url = null;
  }

  /**
   * Check if the server is running.
   * @returns {Promise<boolean>}
   */
  async isRunning() {
    const running = await LocalServer.isRunning();
    this._running = running;
    return running;
  }

  /**
   * Get the URL of the running server.
   * @returns {string|null}
   */
  getURL() {
    return this._url;
  }

  /**
   * Recursive directory APIs are disabled in this protected fork.
   * @returns {string|null}
   */
  getFilesAPIUrl() {
    return null; // Recursive directory APIs are disabled in the protected fork.
  }

  /**
   * Not available: use the protected files.json written by the application.
   */
  async getFiles() {
    throw new Error('Recursive directory APIs are disabled in the protected fork');
  }

  /**
   * Get the protected direct URL for a flat shared file.
   * @param {string} relativePath - e.g. "image.png"
   * @returns {string|null}
   */
  getDownloadURL(relativePath) {
    if (!this._url || !relativePath || /[/\\]/.test(relativePath)) return null;
    return `${this._url}${encodeURIComponent(relativePath)}`;
  }

  /**
   * Directory APIs are disabled in this protected fork.
   * @returns {string|null}
   */
  getDirAPIUrl(dirPath = '/') {
    return null;
  }

  /**
   * Not available: directory browsing is disabled.
   */
  async getDir(dirPath = '/') {
    throw new Error('Directory APIs are disabled in the protected fork');
  }

  /**
   * Get the protected URL for a flat shared file.
   * @param {string} relativePath - e.g. "photo.png"
   * @returns {string|null}
   */
  getFileURL(relativePath) {
    return this.getDownloadURL(relativePath);
  }

  /**
   * Get the local IP address of the device.
   * @returns {Promise<string>}
   */
  static async getIPAddress() {
    return LocalServer.getIPAddress();
  }
}
