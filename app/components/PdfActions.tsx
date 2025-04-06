type PdfActionsProps = {
  selectedPdf: string | null;
  loading: boolean;
  onGenerate: () => void;
};

export default function PdfActions({ selectedPdf, loading, onGenerate }: PdfActionsProps) {
  return (
    <button
      className={`bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 mt-4 ${
        loading ? "opacity-50 cursor-not-allowed" : ""
      }`}
      disabled={!selectedPdf || loading}
      onClick={onGenerate}
    >
      {loading ? "Обробка..." : "Згенерувати PDF"}
    </button>
  );
}
