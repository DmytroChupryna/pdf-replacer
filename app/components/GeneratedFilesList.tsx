type FileEntry = {
  name: string;
  file: string;
};

type GeneratedFilesListProps = {
  files: FileEntry[];
  onDownload: (file: FileEntry) => void;
  onUploadToDrive: () => void;
  uploading: boolean;
  resultMessage: string | null;
};

export default function GeneratedFilesList({
  files,
  onDownload,
  onUploadToDrive,
  uploading,
  resultMessage,
}: GeneratedFilesListProps) {
  if (files.length === 0) return null;

  return (
    <div className="mt-6">
      <h2 className="text-lg font-bold text-black">Згенеровані файли:</h2>
      <ul>
        {files.map((file, index) => (
          <li key={index} className="mb-1">
            <button
              className="text-blue-600 hover:underline"
              onClick={() => onDownload(file)}
            >
              {file.name}
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex gap-4">
        <button
          onClick={onUploadToDrive}
          className="bg-green-500 text-white px-4 py-2 rounded-md mt-4 hover:bg-green-600"
          disabled={uploading}
        >
          {uploading ? "Завантаження на Google Диск..." : "Зберегти на Google Диск"}
        </button>

        {resultMessage && <p className="mt-2 text-black">{resultMessage}</p>}
      </div>
    </div>
  );
}
