package expo.modules.filesaver

import android.content.ContentValues
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File
import java.io.FileInputStream

class FileSaverModule : Module() {

    override fun definition() = ModuleDefinition {

        Name("FileSaver")

        AsyncFunction(
            "saveToDownloads"
        ) { sourceUri: String, fileName: String, mimeType: String ->

            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
                throw Exception(
                    "Saving directly to Downloads without a folder picker requires Android 10 or newer."
                )
            }

            val context =
                appContext.reactContext
                    ?: throw Exception(
                        "Android context is unavailable."
                    )

            val resolver =
                context.contentResolver

            val downloadsCollection =
                MediaStore.Downloads.getContentUri(
                    MediaStore.VOLUME_EXTERNAL_PRIMARY
                )

            val values =
                ContentValues().apply {

                    put(
                        MediaStore.Downloads.DISPLAY_NAME,
                        fileName
                    )

                    put(
                        MediaStore.Downloads.MIME_TYPE,
                        mimeType
                    )

                    put(
                        MediaStore.Downloads.RELATIVE_PATH,
                        Environment.DIRECTORY_DOWNLOADS +
                            "/File Sharing/"
                    )

                    put(
                        MediaStore.Downloads.IS_PENDING,
                        1
                    )
                }

            val destinationUri: Uri? =
                resolver.insert(
                    downloadsCollection,
                    values
                )

            if (destinationUri == null) {
                throw Exception(
                    "Could not create the destination file in Downloads."
                )
            }

            try {

                val inputFile =
                    getInputFile(
                        sourceUri,
                        context.cacheDir
                    )

                resolver.openOutputStream(
                    destinationUri,
                    "w"
                ).use { output ->

                    if (output == null) {
                        throw Exception(
                            "Could not open Downloads file for writing."
                        )
                    }

                    FileInputStream(
                        inputFile
                    ).use { input ->

                        val buffer =
                            ByteArray(
                                1024 * 1024
                            )

                        var bytesRead: Int

                        while (
                            input.read(
                                buffer
                            ).also {
                                bytesRead = it
                            } != -1
                        ) {

                            output.write(
                                buffer,
                                0,
                                bytesRead
                            )
                        }

                        output.flush()
                    }
                }

                val completedValues =
                    ContentValues().apply {
                        put(
                            MediaStore.Downloads.IS_PENDING,
                            0
                        )
                    }

                resolver.update(
                    destinationUri,
                    completedValues,
                    null,
                    null
                )

                destinationUri.toString()

            } catch (error: Exception) {

                resolver.delete(
                    destinationUri,
                    null,
                    null
                )

                throw error
            }
        }
    }

    private fun getInputFile(
        sourceUri: String,
        cacheDirectory: File
    ): File {

        if (
            sourceUri.startsWith(
                "file://"
            )
        ) {
            return File(
                Uri.parse(sourceUri)
                    .path
                    ?: throw Exception(
                        "Invalid file URI."
                    )
            )
        }

        if (
            sourceUri.startsWith("/")
        ) {
            return File(
                sourceUri
            )
        }

        throw Exception(
            "Unsupported source URI: $sourceUri"
        )
    }
}