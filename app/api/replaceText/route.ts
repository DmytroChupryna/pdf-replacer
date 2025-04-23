import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs";
import path from "path";
import { generateCellsObject } from "./factory";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const fileNamesRaw = formData.get("fileNames") as string;
    const namesJson = formData.get("names") as string;

    if (!fileNamesRaw || !namesJson) {
      return NextResponse.json({ error: "Файли або дані відсутні" }, { status: 400 });
    }

    const fileNames = JSON.parse(fileNamesRaw) as string[];
    const rawData = JSON.parse(namesJson) as string[][];

    if (!Array.isArray(fileNames) || fileNames.length === 0) {
      return NextResponse.json({ error: "Список файлів порожній" }, { status: 400 });
    }

    if (!Array.isArray(rawData) || rawData.length < 2) {
      return NextResponse.json({ error: "Недостатньо даних у таблиці" }, { status: 400 });
    }

    // Відсікаємо пусті рядки
    const dataRows = rawData.slice(1).filter((row) =>
      row.some((cell) => cell && cell.trim() !== "")
    );

    console.log("🔍 Знайдено рядків:", dataRows);

    const transformedRows = dataRows.map((row) =>
      generateCellsObject([rawData[0], row], rawData[0])[0]
    );

    const fontPath = path.join(process.cwd(), "fonts", "Open_Sans", "static", "OpenSans-Regular.ttf");
    if (!fs.existsSync(fontPath)) {
      return NextResponse.json({ error: "Шрифт не знайдено: OpenSans-Regular.ttf" }, { status: 500 });
    }
    const fontBytes = fs.readFileSync(fontPath);

    const generatedFiles: { name: string; file: string }[] = [];

    for (const fileName of fileNames) {
      const filePath = path.join(process.cwd(), "public", fileName);
      if (!fs.existsSync(filePath)) continue;

      const fileBuffer = fs.readFileSync(filePath);

      for (const row of transformedRows) {
        const pdfDoc = await PDFDocument.load(fileBuffer);
        pdfDoc.registerFontkit(fontkit);
        const form = pdfDoc.getForm();
        const customFont = await pdfDoc.embedFont(fontBytes, { subset: true });

        for (const [fieldName, fieldData] of Object.entries(row)) {
          try {
            const field = form.getTextField(fieldName);
            field.setText(fieldData.value);
            field.updateAppearances(customFont);
          } catch {
            console.warn(`⚠️ Поле "${fieldName}" не знайдено`);
          }
        }

        form.flatten();

        const fullName = (row["Imię, nazwiko"]?.value || "unknown")
          .replace(/\s+/g, "_")
          .replace(/[^\w\-]/g, "");

        const outputFileName = `${fileName.replace(".pdf", "")}_${fullName}.pdf`;
        const modifiedPdfBytes = await pdfDoc.save();
        const base64Pdf = Buffer.from(modifiedPdfBytes).toString("base64");

        generatedFiles.push({ name: outputFileName, file: base64Pdf });
      }
    }

    return NextResponse.json({ files: generatedFiles });
  } catch (error) {
    console.error("❌ Помилка при обробці PDF:", error);
    return NextResponse.json({ error: `Помилка: ${(error as Error).message}` }, { status: 500 });
  }
}
