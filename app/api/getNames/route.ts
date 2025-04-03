import { google } from "googleapis";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { writeCredentialsTempFile } from "../utils/utils";

// ID таблиці Google Sheets (заміни на свій)
const SPREADSHEET_ID = "1N4aTjrDy1IaMFs0Bpgiu2nVelwpc7Cgb-41OBlFq7xY";
const SHEET_NAME = "Аркуш1"; // Назва листа (замінити за потреби)

const CREDENTIALS_PATH = path.join(process.cwd(), ".secrets", "apialliance-e26e4074ea50.json");
let keyFile = writeCredentialsTempFile()
if (process.env.NODE_ENV === "development") {
  keyFile = CREDENTIALS_PATH;
}


async function getNamesFromGoogleSheets() {
  if (!fs.existsSync(keyFile)) {
    throw new Error("Файл credentials.json не знайдено!");
  }

  const auth = new google.auth.GoogleAuth({
    keyFile,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
  const sheets = google.sheets({ version: "v4", auth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A1:Z30`, // Зчитувати імена з першого стовпця
  });

  const names = response.data.values || [];
  return names;
}

export async function GET() {
  try {
    const names = await getNamesFromGoogleSheets();
    return NextResponse.json({ names });
  } catch (error) {
    console.error("❌ Помилка отримання імен:", error);
    return NextResponse.json({ error: "Не вдалося отримати імена" }, { status: 500 });
  }
}
