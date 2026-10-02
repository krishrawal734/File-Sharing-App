import { registerWebModule, NativeModule } from 'expo';

class FileSaverModule extends NativeModule<Record<string, never>> {}

export default registerWebModule(FileSaverModule, 'FileSaverModule');
