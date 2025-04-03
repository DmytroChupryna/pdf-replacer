
import { google } from "googleapis";
import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { writeCredentialsTempFile } from "../utils/utils";


// const CREDENTIALS_PATH = path.join(process.cwd(), "public", "apialliance-e26e4074ea50.json");

const SCOPES = ["https://www.googleapis.com/auth/drive"];
const PARENT_FOLDER_ID = "1ITN5NT04vPRTTfcX8of05H89d3POvny5";

async function authorizeDrive() {
  const keyFile = writeCredentialsTempFile()
  console.log("keyFile", keyFile);
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

    for (const relativePath of files) {
      const filePath = path.join(process.cwd(), "public", relativePath.replace(/^\/+/, ""));
      if (!fs.existsSync(filePath)) continue;

      const fileMetadata = {
        name: path.basename(filePath),
        parents: [folderId],
      };

      const media = {
        mimeType: "application/pdf",
        body: fs.createReadStream(filePath),
      };

      const res = await drive.files.create({
        requestBody: fileMetadata,
        media,
        fields: "id, name",
      });

      uploadedFiles.push(res.data.name!);

      // Видаляємо після завантаження
      fs.unlinkSync(filePath);
    }

    return NextResponse.json({
      success: true,
      folderId,
      files: uploadedFiles,
    });
  } catch (error) {
    console.error("❌ Помилка при завантаженні на Google Drive:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
