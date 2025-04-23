"use client";
import { useEffect, useState } from "react";
import PdfSelector from "./components/PdfSelector";
import GeneratedFilesList from "./components/GeneratedFilesList";
import PdfActions from "./components/PdfActions";
import DataRowsList from "./components/DataRowsList";

export default function Home() {
  const [selectedPdf, setSelectedPdf] = useState<string[]>([]);
  const [pdfFiles, setPdfFiles] = useState<string[]>([]);
  const [names, setNames] = useState<string[][]>([]);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingNames, setLoadingNames] = useState(true);
  const [generatedFiles, setGeneratedFiles] = useState<
    { name: string; file: string }[]
  >([]);
  const [uploadingToDrive, setUploadingToDrive] = useState(false);
  const [driveResult, setDriveResult] = useState<string | null>(null);

  useEffect(() => {
    setLoadingNames(true);
    fetch("/api/getNames")
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.names.filter(
          (row: string[], index: number) =>
            index === 0 || row.some((cell) => cell && cell.trim() !== "")
        );
        setNames(filtered);
      })
      .catch((err) => console.error("Помилка отримання імен:", err))
      .finally(() => setLoadingNames(false));

    fetch("/api/listPdfs")
      .then((res) => res.json())
      .then((data) => setPdfFiles(data.files))
      .catch((err) => console.error("Помилка отримання PDF:", err));
  }, []);

  const handleProcessPdf = async () => {
    if (selectedPdf.length === 0) {
      alert("Оберіть хоча б один PDF-файл!");
      return;
    }
  
    const filteredNames = selectedRows
      .map((i) => names[i])
      .filter((row) => row && row.some((cell) => cell && cell.trim() !== ""));

    console.log("🔍 Знайдено рядків:", selectedRows);
    if (filteredNames.length === 0) {
      alert("Оберіть хоча б один непорожній рядок для генерації!");
      return;
    }
  
    setLoading(true);
    setGeneratedFiles([]);
  
    try {
      const formData = new FormData();
      formData.append("fileNames", JSON.stringify(selectedPdf)); // масив PDF-файлів
      formData.append("names", JSON.stringify([names[0], ...filteredNames])); // додаємо заголовок
  
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
      <div className="w-full shadow-lg p-4 rounded-md bg-white">
        <h1 className="text-xl font-bold mb-4 text-black">Генерація PDF</h1>
        <DataRowsList
          data={names}
          loading={loadingNames}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
        />

        <PdfSelector
          pdfFiles={pdfFiles}
          selectedPdf={selectedPdf}
          setSelectedPdf={setSelectedPdf}
        />

        <PdfActions
          selectedPdf={selectedPdf.length > 0 ? "selected" : null}
          loading={loading}
          onGenerate={handleProcessPdf}
        />

        <GeneratedFilesList
          files={generatedFiles}
          onDownload={handleDownload}
          onUploadToDrive={handleSaveToDrive}
          uploading={uploadingToDrive}
          resultMessage={driveResult}
        />
      </div>
    </div>
  );
}
