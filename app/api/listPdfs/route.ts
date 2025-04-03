import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const pdfDir = path.join(process.cwd(), "public");
  const files = fs.readdirSync(pdfDir).filter((file) => file.endsWith(".pdf"));

  return NextResponse.json({ files });
}
