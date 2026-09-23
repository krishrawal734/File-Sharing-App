import { useState } from "react";

import { SelectedFile } from "../types/file";

export function useSelectedFiles() {
  const [files, setFiles] = useState<SelectedFile[]>([]);
const addFiles = (newFiles: SelectedFile[]) => {
  setFiles((currentFiles) => {
    const existingUris = new Set(
      currentFiles.map((file) => file.uri)
    );

    const uniqueFiles = newFiles.filter(
      (file) => !existingUris.has(file.uri)
    );

    const combinedFiles = [
      ...currentFiles,
      ...uniqueFiles,
    ];

    return combinedFiles.slice(0, 50);
  });
};

  const removeFile = (id: string) => {
    setFiles((currentFiles) =>
      currentFiles.filter((file) => file.id !== id)
    );
  };

  const clearFiles = () => {
    setFiles([]);
  };

  const totalSize = files.reduce(
    (total, file) => total + file.size,
    0
  );

  return {
    files,
    addFiles,
    removeFile,
    clearFiles,
    totalSize,
  };
}