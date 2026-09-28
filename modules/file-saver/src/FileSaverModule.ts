import { NativeModule, requireNativeModule } from 'expo';

declare class FileSaverModule extends NativeModule<{}> {}

export default requireNativeModule<FileSaverModule>('FileSaver');
