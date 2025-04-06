type PdfSelectorProps = {
  pdfFiles: string[];
  selectedPdf: string[];
  setSelectedPdf: (value: string[]) => void;
};

export default function PdfSelector({ pdfFiles, selectedPdf, setSelectedPdf }: PdfSelectorProps) {
  const handleCheckboxChange = (file: string) => {
    if (selectedPdf.includes(file)) {
      setSelectedPdf(selectedPdf.filter((f) => f !== file));
    } else {
      setSelectedPdf([...selectedPdf, file]);
    }
  };

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-black mb-2">Оберіть PDF-файли:</h2>
      <div className="border border-gray-300 rounded-md p-3 max-h-64 overflow-y-auto space-y-2 bg-gray-50">
        {pdfFiles.map((file, index) => (
          <label
            key={index}
            className="flex items-center gap-3 p-2 hover:bg-white rounded-md cursor-pointer text-sm"
          >
            <input
              type="checkbox"
              className="accent-blue-600 w-4 h-4"
              checked={selectedPdf.includes(file)}
              onChange={() => handleCheckboxChange(file)}
            />
            <span className="text-gray-800 break-words">{file}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
