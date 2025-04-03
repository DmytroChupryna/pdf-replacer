type CellEntry = {
  value: string;
  includesInDocs: number[];
};

export function generateCellsObject(cells: string[][], firstCell: string[]): Record<string, CellEntry>[] {
  const headers: { label: string; docs: number[] }[] = firstCell.map((header) => {
    const match = header.match(/(.+?)\s*\(([\d, ]+)\)/); // витягає назву поля та номери документів
    if (!match) {
      return { label: header.trim(), docs: [] };
    }
    const label = match[1].trim();
    const docs = match[2].split(",").map((n) => +n.trim());
    return { label, docs };
  });

  const result: Record<string, CellEntry>[] = [];

  for (let i = 2; i < cells.length; i++) {
    const row = cells[i];
    const rowObj: Record<string, CellEntry> = {};

    for (let j = 0; j < headers.length; j++) {
      const header = headers[j];
      const value = row[j] || "";

      rowObj[header.label] = {
        value,
        includesInDocs: header.docs
      };
    }

    result.push(rowObj);
  }

  return result;
}
