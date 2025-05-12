// src/lib/upload.ts
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

// Where program photos are stored for the app
const BUCKET_NAME = "course-images";

export async function saveFile(file: File): Promise<string> {
  // Generate a unique filename
  const filename = `${uuidv4()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "")}`;
  
  // Convert the file to buffer
  const buffer = await file.arrayBuffer();
  
  // Upload to Supabase Storage
  const { data, error } = await supabase
    .storage
    .from(BUCKET_NAME)
    .upload(filename, buffer, {
      contentType: file.type, // Set the correct content type
      upsert: false // Don't overwrite if file exists
    });

  if (error) {
    console.error("Error uploading file:", error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  // Generate and return the public URL
  const { data: { publicUrl } } = supabase
    .storage
    .from(BUCKET_NAME)
    .getPublicUrl(filename);

  return publicUrl;
}