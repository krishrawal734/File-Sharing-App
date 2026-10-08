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
import java.io.FileOutputStream
import java.io.OutputStream

class FileSaverModule : Module() {

    override fun definition() = ModuleDefinition {

        Name("FileSaver")

        AsyncFunction("saveToGallery") { sourceUri: String, fileName: String, mimeType: String ->
            validateFileName(fileName)
            val context = appContext.reactContext
                ?: throw Exception("Android context is unavailable.")
            val inputFile = getInputFile(sourceUri)
            val resolver = context.contentResolver

            val isVideo = mimeType.startsWith("video/") || isVideoExtension(fileName)
            val contentUri = if (isVideo) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    MediaStore.Video.Media.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY)
                } else {
                    MediaStore.Video.Media.EXTERNAL_CONTENT_URI
                }
            } else {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    MediaStore.Images.Media.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY)
                } else {
                    MediaStore.Images.Media.EXTERNAL_CONTENT_URI
                }
            }

            val relativePath = if (isVideo) {
                Environment.DIRECTORY_MOVIES + "/File Sharing/"
            } else {
                Environment.DIRECTORY_PICTURES + "/File Sharing/"
            }

            val effectiveMime = if (mimeType.isNotBlank()) mimeType else (if (isVideo) "video/mp4" else "image/jpeg")

            val values = ContentValues().apply {
                put(MediaStore.MediaColumns.DISPLAY_NAME, fileName)
                put(MediaStore.MediaColumns.MIME_TYPE, effectiveMime)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    put(MediaStore.MediaColumns.RELATIVE_PATH, relativePath)
                    put(MediaStore.MediaColumns.IS_PENDING, 1)
                }
            }

            val destinationUri: Uri = resolver.insert(contentUri, values)
                ?: throw Exception("Could not create destination file in Gallery.")

            try {
                resolver.openOutputStream(destinationUri, "w").use { output ->
                    if (output == null) {
                        throw Exception("Could not open Gallery file for writing.")
                    }
                    copyFile(inputFile, output)
                }

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    val completedValues = ContentValues().apply {
                        put(MediaStore.MediaColumns.IS_PENDING, 0)
                    }
                    resolver.update(destinationUri, completedValues, null, null)
                }

                destinationUri.toString()
            } catch (error: Exception) {
                try {
                    resolver.delete(destinationUri, null, null)
                } catch (_: Exception) {
                }
                throw error
            }
        }

        AsyncFunction("saveToDownloads") { sourceUri: String, fileName: String, mimeType: String ->
            validateFileName(fileName)
            val context = appContext.reactContext
                ?: throw Exception("Android context is unavailable.")
            val inputFile = getInputFile(sourceUri)
            val resolver = context.contentResolver

            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
                throw Exception("Public Downloads requires Android 10 or newer; use saveToAppDocuments instead.")
            }

            val downloadsCollection = MediaStore.Downloads.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY)
            val effectiveMime = if (mimeType.isNotBlank()) mimeType else "application/octet-stream"

            val values = ContentValues().apply {
                put(MediaStore.Downloads.DISPLAY_NAME, fileName)
                put(MediaStore.Downloads.MIME_TYPE, effectiveMime)
                put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/File Sharing/")
                put(MediaStore.Downloads.IS_PENDING, 1)
            }

            val destinationUri: Uri = resolver.insert(downloadsCollection, values)
                ?: throw Exception("Could not create destination file in Downloads.")

            try {
                resolver.openOutputStream(destinationUri, "w").use { output ->
                    if (output == null) {
                        throw Exception("Could not open Downloads file for writing.")
                    }
                    copyFile(inputFile, output)
                }

                val completedValues = ContentValues().apply {
                    put(MediaStore.Downloads.IS_PENDING, 0)
                }

                if (resolver.update(destinationUri, completedValues, null, null) != 1) {
                    throw Exception("Could not finalize the Downloads file.")
                }

                destinationUri.toString()
            } catch (error: Exception) {
                try {
                    resolver.delete(destinationUri, null, null)
                } catch (_: Exception) {
                }
                throw error
            }
        }

        AsyncFunction("saveToAppDocuments") { sourceUri: String, fileName: String ->
            validateFileName(fileName)
            val context = appContext.reactContext
                ?: throw Exception("Android context is unavailable.")
            val inputFile = getInputFile(sourceUri)
            saveToAppDocumentsInternal(inputFile, fileName, context)
        }
    }

    private fun saveToAppDocumentsInternal(inputFile: File, fileName: String, context: android.content.Context): String {
        val documents = File(
            context.getExternalFilesDir(Environment.DIRECTORY_DOCUMENTS)
                ?: File(context.filesDir, "Documents"),
            "File Sharing"
        )
        if (!documents.isDirectory && !documents.mkdirs()) {
            throw Exception("Could not create app Documents directory.")
        }

        val dot = fileName.lastIndexOf('.')
        val stem = if (dot > 0) fileName.substring(0, dot) else fileName
        val extension = if (dot > 0) fileName.substring(dot) else ""
        var suffix = 0
        var destination: File
        do {
            val name = if (suffix == 0) fileName else "$stem ($suffix)$extension"
            destination = File(documents, name)
            suffix++
        } while (!destination.createNewFile())

        try {
            FileOutputStream(destination).use { output -> copyFile(inputFile, output) }
            return Uri.fromFile(destination).toString()
        } catch (error: Exception) {
            destination.delete()
            throw error
        }
    }

    private fun validateFileName(fileName: String) {
        if (fileName.isBlank() || fileName == "." || fileName == ".." ||
            fileName.contains('/') || fileName.contains('\\') ||
            fileName.any { it.code < 32 }
        ) {
            throw IllegalArgumentException("Invalid file name.")
        }
    }

    private fun isVideoExtension(fileName: String): Boolean {
        val ext = fileName.substringAfterLast('.', "").lowercase()
        return ext in setOf("mp4", "mov", "mkv", "avi", "webm", "3gp", "m4v")
    }

    private fun getInputFile(sourceUri: String): File {
        val source = when {
            sourceUri.startsWith("file://") -> File(
                Uri.parse(sourceUri).path ?: throw IllegalArgumentException("Invalid file URI.")
            )
            sourceUri.startsWith("/") -> File(sourceUri)
            else -> throw IllegalArgumentException("Unsupported source URI: $sourceUri")
        }
        if (!source.isFile) {
            throw IllegalArgumentException("Source file does not exist: $sourceUri")
        }
        return source
    }

    private fun copyFile(source: File, output: OutputStream) {
        FileInputStream(source).use { input ->
            input.copyTo(output, 1024 * 1024)
            output.flush()
        }
    }
}