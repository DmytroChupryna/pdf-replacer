type CellEntry = {
  value: string;
  includesInDocs: number[];
};
// PLN: EUR:
export function generateCellsObject(
  cells: string[][],
  firstCell: string[]
): Record<string, CellEntry>[] {
  const headers: { label: string; docs: number[] }[] = firstCell.map(
    (header) => {
      const match = header.match(/(.+?)\s*\(([\d, ]+)\)/); // витягає назву поля та номери документів
      if (!match) {
        return { label: header.trim(), docs: [] };
      }
      const label = match[1].trim();
      const docs = match[2].split(",").map((n) => +n.trim());
      return { label, docs };
    }
  );

  const result: Record<string, CellEntry>[] = [];

  for (let i = 1; i < cells.length; i++) {
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

  result.forEach((row) => {
    const nazwiko = row["Imię, nazwiko"];
    if (nazwiko) {
      const [lastName] = nazwiko.value.split(" ");
      row["nazwisko rodowe"] = {
        value: lastName,
        includesInDocs: []
      };
    }

    const PLN = row["PLN"];
    if (PLN) {
      const PLN_array = PLN.value.split("");
      const clear_PLN_array = PLN_array.filter(item => item !== " ");
      clear_PLN_array.forEach((char, index) => {
        row[`PLN${index}`] = {
          value: char,
          includesInDocs: PLN.includesInDocs
        };
      });
    }

    const EUR = row["EUR"];

    if (EUR) {
      const EUR_array = EUR.value.split("");
      const clear_EUR_array = EUR_array.filter(item => item !== " ");
      clear_EUR_array.forEach((char, index) => {
        row[`EUR${index}`] = {
          value: char,
          includesInDocs: EUR.includesInDocs
        };
      });
    }
  });

  return result;
}
