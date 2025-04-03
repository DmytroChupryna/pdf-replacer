'use client'
import { useState, useEffect } from "react";

interface PdfSelectorProps {
  onSelect: (fileName: string) => void;
}

export default function PdfSelector({ onSelect }: PdfSelectorProps) {
  const [pdfFiles, setPdfFiles] = useState<string[]>([]);

  useEffect(() => {
    const fetchPdfFiles = async () => {
      try {
        const response = await fetch("/api/listPdfs");
        const files = await response.json();
        setPdfFiles(files);
      } catch (error) {
        console.error("Помилка при отриманні списку PDF:", error);
      }
    };

    fetchPdfFiles();
  }, []);

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1 text-black">Виберіть PDF-файл</label>
      <select
        className="w-full border rounded-md p-2 text-black"
        onChange={(e) => onSelect(e.target.value)}
        defaultValue=""
      >
        <option value="" disabled>Оберіть файл</option>
        {pdfFiles.map((file, index) => (
          <option key={index} value={file}>{file}</option>
        ))}
      </select>
    </div>
  );
}
