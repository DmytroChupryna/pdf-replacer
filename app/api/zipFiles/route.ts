import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const files: string[] = body.files;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "Список файлів порожній" }, { status: 400 });
    }

    const zip = new JSZip();

    for (const file of files) {
      const filePath = path.join(process.cwd(), "public", file.replace(/^\/+/, ""));
      if (fs.existsSync(filePath)) {
        const fileBuffer = fs.readFileSync(filePath);
        const fileName = path.basename(filePath);
        zip.file(fileName, fileBuffer);
      } else {
        console.warn(`Файл не знайдено: ${filePath}`);
      }
    }

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="generated_files.zip"',
      },
    });
  } catch (error) {
    console.error("❌ Помилка при створенні ZIP:", error);
    return NextResponse.json({ error: "Не вдалося створити ZIP-архів" }, { status: 500 });
  }
}
