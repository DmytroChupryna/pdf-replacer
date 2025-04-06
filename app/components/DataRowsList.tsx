import React from "react";

type Props = {
  data: string[][];
  loading: boolean;
  selectedRows: number[];
  setSelectedRows: (rows: number[]) => void;
};

export default function DataRowsList({
  data,
  loading,
  selectedRows,
  setSelectedRows
}: Props) {
  if (loading) return <p className="text-black">Завантаження рядків...</p>;
  if (data.length < 2)
    return <p className="text-black">Немає даних для відображення.</p>;

  const headers = data[0];
  const rows = data.slice(1);

  const toggleRow = (index: number) => {
    if (selectedRows.includes(index)) {
      setSelectedRows(selectedRows.filter((i) => i !== index));
    } else {
      setSelectedRows([...selectedRows, index]);
    }
  };

  return (
    <div className="mt-8 mb-8">
      <h2 className="text-lg font-semibold text-black mb-3">Дані з таблиці:</h2>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-500 py-4 px-2">
          <svg
            className="w-5 h-5 animate-spin text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-black mb-3">Завантаження даних...</h3>
        </div>
      ) : (
        <div className="overflow-x-auto border rounded-md">
          <table className="min-w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-gray-100 text-gray-700 font-semibold">
              <tr>
                <th className="p-2 border">✓</th>
                <th className="p-2 border">#</th>
                {headers.map((header, index) => (
                  <th key={index} className="p-2 border">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const realIndex = i + 1;
                return (
                  <tr key={realIndex} className="hover:bg-gray-50">
                    <td className="p-2 border text-center">
                      <input
                        type="checkbox"
                        className="accent-blue-600"
                        checked={selectedRows.includes(realIndex)}
                        onChange={() => toggleRow(realIndex)}
                      />
                    </td>
                    <td className="p-2 border text-center">{realIndex}</td>

                    {row.map((cell, index) => (
                      <td key={index} className="p-2 border align-top">
                        {cell}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
