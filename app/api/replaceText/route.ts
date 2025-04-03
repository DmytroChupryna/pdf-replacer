import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs";
import path from "path";
import { generateCellsObject } from "./factory";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const fileName = formData.get("fileName") as string;
    const namesJson = formData.get("names") as string;

    if (!fileName || !namesJson) {
      return NextResponse.json({ error: "Файл або імена відсутні" }, { status: 400 });
    }

    const rawData = JSON.parse(namesJson) as string[][];
    if (!rawData || rawData.length < 2) {
      return NextResponse.json({ error: "Недостатньо даних у таблиці" }, { status: 400 });
    }

    const transformed = generateCellsObject(rawData, rawData[0]);

    const filePath = path.join(process.cwd(), "public", fileName);
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: `Файл '${fileName}' не знайдено в /public` }, { status: 404 });
    }

    const fontPath = path.join(process.cwd(), "fonts", "Open_Sans", "static", "OpenSans-Regular.ttf");
    if (!fs.existsSync(fontPath)) {
      return NextResponse.json({ error: "Шрифт не знайдено: OpenSans-Regular.ttf" }, { status: 500 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const fontBytes = fs.readFileSync(fontPath);

    const generatedFiles: { name: string; file: string }[] = [];

    for (const row of transformed) {
      const pdfDoc = await PDFDocument.load(fileBuffer);
      pdfDoc.registerFontkit(fontkit);
      const form = pdfDoc.getForm();
      const customFont = await pdfDoc.embedFont(fontBytes, { subset: true });
      for (const [fieldName, fieldData] of Object.entries(row)) {
        try {
          const field = form.getTextField(fieldName);
          field.setText(fieldData.value);
          field.updateAppearances(customFont);
        } catch (error) {
          console.warn(`⚠️ Поле "${fieldName}" не знайдено у PDF. Пропущено.`);
        }
      }

      form.flatten();

      const fullName = (row["Imię, nazwiko"]?.value || "unknown")
        .replace(/\s+/g, "_")
        .replace(/[^\w\-]/g, "");

      const outputFileName = `${fileName.replace('.pdf', '')}_${fullName}.pdf`;
      const modifiedPdfBytes = await pdfDoc.save();

      const base64Pdf = Buffer.from(modifiedPdfBytes).toString("base64");

      generatedFiles.push({
        name: outputFileName,
        file: base64Pdf,
      });
    }

    return NextResponse.json({ files: generatedFiles });
  } catch (error) {
    console.error("❌ Помилка при обробці PDF:", error);
    return NextResponse.json({ error: `Помилка: ${(error as Error).message}` }, { status: 500 });
  }
}
