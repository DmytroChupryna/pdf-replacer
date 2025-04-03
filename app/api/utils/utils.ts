import fs from "fs";
import os from "os";
import path from "path";

// Створити тимчасовий файл з credentials.json
export function writeCredentialsTempFile(): string {
  const json = process.env.GOOGLE_CREDENTIALS_JSON;
  if (!json) throw new Error("GOOGLE_CREDENTIALS_JSON не задано в .env");

  const tmpDir = os.tmpdir(); // тимчасова директорія
  const filePath = path.join(tmpDir, "apialliance-e26e4074ea50.json");
  fs.writeFileSync(filePath, json, "utf8");
  return filePath;
}
