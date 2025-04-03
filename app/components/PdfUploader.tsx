'use client'
import React, { useEffect, useState } from "react";

export default function PdfUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [names, setNames] = useState<string[]>([]);
  const [downloadUrl, setDownloadUrl] = useState("");

  useEffect(() => {
    async function fetchNames() {
      try {
        const response = await fetch("/api/getNames");
        const data = await response.json();
        setNames(data.names || []);
      } catch (error) {
        console.error("Помилка отримання імен:", error);
      }
    }
    fetchNames();
  }, []);

  const handleUpload = async () => {
    if (!file || !name) return alert("Оберіть файл і введіть ім'я!");

    const formData = new FormData();
    formData.append("fileName", file.name);
    formData.append("name", name);

    const response = await fetch("/api/replaceText", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } else {
      alert("Помилка при створенні PDF!");
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 shadow-md rounded-md bg-white">
      <h1 className="text-xl font-bold mb-4">Заповнення PDF</h1>
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-4"
      />
      <input
        type="text"
        placeholder="Ім'я"
        value={name}
        onChange={(e) => setName(e.target.value)}
        list="name-options"
        className="w-full mb-2 p-2 border rounded-md"
      />
      <datalist id="name-options">
        {names.map((n, i) => (
          <option key={i} value={n} />
        ))}
      </datalist>
      <button
        className="bg-blue-500 text-white py-2 px-4 rounded-md"
        onClick={handleUpload}
      >
        Заповнити PDF
      </button>
      {downloadUrl && (
        <div className="mt-4">
          <a
            href={downloadUrl}
            download="Updated.pdf"
            className="bg-green-500 text-white py-2 px-4 rounded-md"
          >
            Завантажити PDF
          </a>
        </div>
      )}
    </div>
  );
}
