import { registerWebModule, NativeModule } from 'expo';

class FileSaverModule extends NativeModule<{}> {}

export default registerWebModule(FileSaverModule, 'FileSaverModule');
