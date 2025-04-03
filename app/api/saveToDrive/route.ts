import { google } from "googleapis";
import { Readable } from "stream";
import { NextRequest, NextResponse } from "next/server";
import { writeCredentialsTempFile } from "../utils/utils";

const SCOPES = ["https://www.googleapis.com/auth/drive"];
const PARENT_FOLDER_ID = "1ITN5NT04vPRTTfcX8of05H89d3POvny5";

let keyFile = writeCredentialsTempFile();
if (process.env.NODE_ENV === "development") {
  keyFile = process.cwd() + "/.secrets/apialliance-e26e4074ea50.json";
}

async function authorizeDrive() {
  const auth = new google.auth.GoogleAuth({
    keyFile,
    scopes: SCOPES,
  });
  return google.drive({ version: "v3", auth });
}

export async function POST(req: NextRequest) {
  try {
    const { files } = await req.json();
    if (!files || files.length === 0) {
      return NextResponse.json({ error: "Файли не передано" }, { status: 400 });
    }

    const folderName = `PDF_${new Date().toLocaleDateString("pl-PL")}`;
    const drive = await authorizeDrive();

    // Створення папки
    const folderMetadata = {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [PARENT_FOLDER_ID],
    };

    const folder = await drive.files.create({
      requestBody: folderMetadata,
      fields: "id",
    });

    const folderId = folder.data.id!;
    const uploadedFiles: string[] = [];

    for (const file of files) {
      const { name, file: base64 } = file;
      const buffer = Buffer.from(base64, "base64");

      const fileMetadata = {
        name,
        parents: [folderId],
      };

      const res = await drive.files.create({
        requestBody: fileMetadata,
        media: {
          mimeType: "application/pdf",
          body: Readable.from(buffer), // ✅ Виправлено тут
        },
        fields: "id, name",
      });

      uploadedFiles.push(res.data.name!);
    }

    return NextResponse.json({ success: true, folderId, files: uploadedFiles });
  } catch (error) {
    console.error("❌ Помилка при завантаженні на Google Drive:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
