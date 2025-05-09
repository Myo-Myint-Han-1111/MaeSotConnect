// src/lib/upload.ts
import { promises as fs } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function saveFile(file: File): Promise<string> {
  // Generate a unique filename
  const filename = `${uuidv4()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "")}`;

  // Define the upload directory path
  const uploadDir = path.join(process.cwd(), "public", "uploads");

  // Ensure the directory exists
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }

  // Convert the file to buffer and save it
  const buffer = Buffer.from(await file.arrayBuffer());
  const filepath = path.join(uploadDir, filename);
  await fs.writeFile(filepath, buffer);

  // Return the public URL
  return `/uploads/${filename}`;
}
