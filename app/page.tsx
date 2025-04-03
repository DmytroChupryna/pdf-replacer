"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [pdfFiles, setPdfFiles] = useState<string[]>([]);
  const [names, setNames] = useState<string[][]>([]);
  const [loading, setLoading] = useState(false);
  const [generatedFiles, setGeneratedFiles] = useState<{ name: string; file: string }[]>([]);
  const [uploadingToDrive, setUploadingToDrive] = useState(false);
  const [driveResult, setDriveResult] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/getNames")
      .then((res) => res.json())
      .then((data) => setNames(data.names))
      .catch((err) => console.error("Помилка отримання імен:", err));

    fetch("/api/listPdfs")
      .then((res) => res.json())
      .then((data) => setPdfFiles(data.files))
      .catch((err) => console.error("Помилка отримання PDF:", err));
  }, []);

  const handleProcessPdf = async () => {
    if (!selectedPdf) {
      alert("Оберіть PDF-файл!");
      return;
    }

    setLoading(true);
    setGeneratedFiles([]);

    try {
      const formData = new FormData();
      formData.append("fileName", selectedPdf);
      formData.append("names", JSON.stringify(names));

      const response = await fetch("/api/replaceText", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error("Не вдалося обробити PDF");
      }

      const data = await response.json();
      setGeneratedFiles(data.files);
    } catch (error) {
      console.error("❌ Помилка:", error);
      alert("Сталася помилка при обробці PDF");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToDrive = async () => {
    if (generatedFiles.length === 0) return;

    setUploadingToDrive(true);
    setDriveResult(null);

    try {
      const response = await fetch("/api/saveToDrive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: generatedFiles })
      });

      const data = await response.json();

      if (!response.ok)
        throw new Error(data.error || "Помилка при збереженні на Google Диск");

      setDriveResult(
        `Збережено ${data.files.length} файл(ів) у папку Google Drive ✅`
      );
    } catch (error) {
      console.error("❌", error);
      setDriveResult("❌ Помилка при збереженні на Google Диск");
    } finally {
      setUploadingToDrive(false);
    }
  };

  const handleDownload = (file: { name: string; file: string }) => {
    const byteArray = Uint8Array.from(atob(file.file), (c) => c.charCodeAt(0));
    const blob = new Blob([byteArray], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = file.name;
    link.click();
  };

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-lg mx-auto shadow-lg p-4 rounded-md bg-white">
        <h1 className="text-xl font-bold mb-4 text-black">Генерація PDF</h1>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-black">
            Оберіть PDF:
          </label>
          <select
            className="w-full border rounded-md p-2 text-black"
            value={selectedPdf || ""}
            onChange={(e) => setSelectedPdf(e.target.value)}
          >
            <option value="">-- Виберіть PDF --</option>
            {pdfFiles.map((file, index) => (
              <option key={index} value={file}>
                {file}
              </option>
            ))}
          </select>
        </div>

        {selectedPdf && (
          <p className="mt-4 text-black">
            Вибраний файл: <strong>{selectedPdf}</strong>
          </p>
        )}

        <button
          className={`bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 mt-4 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={!selectedPdf || loading}
          onClick={handleProcessPdf}
        >
          {loading ? "Обробка..." : "Згенерувати PDF"}
        </button>

        {generatedFiles.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-bold text-black">Згенеровані файли:</h2>
            <ul>
              {generatedFiles.map((file, index) => (
                <li key={index} className="mb-1">
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => handleDownload(file)}
                  >
                    {file.name}
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex gap-4">
              <button
                onClick={handleSaveToDrive}
                className="bg-green-500 text-white px-4 py-2 rounded-md mt-4 hover:bg-green-600"
                disabled={uploadingToDrive}
              >
                {uploadingToDrive
                  ? "Завантаження на Google Диск..."
                  : "Зберегти на Google Диск"}
              </button>

              {driveResult && <p className="mt-2 text-black">{driveResult}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
