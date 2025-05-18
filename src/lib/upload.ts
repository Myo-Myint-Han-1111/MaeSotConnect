import { v4 as uuidv4 } from "uuid";
import { createSupabaseServerClient, createSupabaseAdminClient } from './supabaseServerClient';

// Where program photos are stored for the app
const BUCKET_NAME = "course-images";

export async function saveFile(file: File, organizationId?: string): Promise<string> {
  try {
    // Get the admin client
    const supabaseAdmin = createSupabaseAdminClient();
    
    // Generate a unique filename
    const filename = `${uuidv4()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "")}`;
    
    // Convert the file to buffer
    const buffer = await file.arrayBuffer();
    
    // Upload using the admin client
    const { data, error } = await supabaseAdmin
      .storage
      .from(BUCKET_NAME)
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      console.error("Error uploading file:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    // Generate and return the public URL
    const { data: { publicUrl } } = supabaseAdmin
      .storage
      .from(BUCKET_NAME)
      .getPublicUrl(filename);

    console.log("Public URL:", publicUrl);
    return publicUrl;
  } catch (error: any) {
    console.error("Error in saveFile:", error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
}