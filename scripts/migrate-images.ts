import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load environment variables from .env.local first, then fall back to .env
const loadEnv = () => {
  const envLocalPath = path.join(process.cwd(), ".env.local");
  const envPath = path.join(process.cwd(), ".env");

  if (fs.existsSync(envLocalPath)) {
    console.log("Loading environment from .env.local");
    dotenv.config({ path: envLocalPath });
  } else if (fs.existsSync(envPath)) {
    console.log("Loading environment from .env");
    dotenv.config({ path: envPath });
  } else {
    console.log("No .env or .env.local file found");
  }
};

// Load environment variables
loadEnv();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Required environment variables not found:");
  if (!supabaseUrl) console.error("- NEXT_PUBLIC_SUPABASE_URL is missing");
  if (!supabaseKey) console.error("- SUPABASE_SERVICE_ROLE_KEY is missing");
  console.error(
    "\nPlease check your .env.local file and ensure these variables are set correctly."
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Prisma client
const prisma = new PrismaClient();

// Configuration
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
const SUPABASE_BUCKET = "course-images"; // The name of your Supabase storage bucket

// Utility to get file extension
const getFileExtension = (filename: string): string => {
  return path.extname(filename).toLowerCase();
};

// Check if bucket exists and create it if it doesn't
async function ensureBucketExists(): Promise<void> {
  try {
    // Get bucket details
    const { error } = await supabase.storage.getBucket(SUPABASE_BUCKET);

    // If bucket doesn't exist, create it
    if (error) {
      if (error.message && error.message.includes("not found")) {
        console.log(`Bucket ${SUPABASE_BUCKET} not found, creating it...`);

        const { error: createError } = await supabase.storage.createBucket(
          SUPABASE_BUCKET,
          {
            public: true,
          }
        );

        if (createError) {
          console.error("Failed to create bucket:", createError);
          process.exit(1);
        }

        console.log(`Bucket ${SUPABASE_BUCKET} created successfully`);
      } else {
        console.error("Error checking bucket:", error);
        process.exit(1);
      }
    } else {
      console.log(`Bucket ${SUPABASE_BUCKET} already exists`);
    }
  } catch (err) {
    console.error("Error in bucket operation:", err);
    process.exit(1);
  }
}

// Upload a file to Supabase storage
async function uploadFile(
  filePath: string,
  fileName: string
): Promise<string | null> {
  try {
    // Read file content
    const fileContent = fs.readFileSync(filePath);

    // Determine content type from file extension
    const fileExtension = getFileExtension(fileName);
    const contentType =
      fileExtension === ".jpg" || fileExtension === ".jpeg"
        ? "image/jpeg"
        : fileExtension === ".png"
        ? "image/png"
        : "application/octet-stream";

    // Upload to Supabase
    const { error } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .upload(fileName, fileContent, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error(`Error uploading file ${fileName}:`, error);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(SUPABASE_BUCKET)
      .getPublicUrl(fileName);

    if (!urlData || !urlData.publicUrl) {
      console.error("Failed to get public URL");
      return null;
    }

    return urlData.publicUrl;
  } catch (error) {
    console.error(`Error processing file ${fileName}:`, error);
    return null;
  }
}

// Update image URL in database
async function updateImageUrl(
  imageId: string,
  newUrl: string
): Promise<boolean> {
  try {
    await prisma.image.update({
      where: { id: imageId },
      data: { url: newUrl },
    });
    return true;
  } catch (error) {
    console.error(`Error updating image ${imageId}:`, error);
    return false;
  }
}

// Main migration function
async function migrateImages(): Promise<void> {
  try {
    console.log("Starting image migration...");

    // Check if uploads directory exists
    if (!fs.existsSync(UPLOADS_DIR)) {
      console.error(`Uploads directory not found: ${UPLOADS_DIR}`);
      console.log("Creating uploads directory...");
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }

    // Ensure the Supabase bucket exists
    await ensureBucketExists();

    // Get all images from database
    const images = await prisma.image.findMany();
    console.log(`Found ${images.length} images in database`);

    // Track migration statistics
    const stats = {
      total: images.length,
      success: 0,
      failed: 0,
    };

    // Process each image
    for (const image of images) {
      const currentUrl = image.url;
      const fileName = path.basename(currentUrl);
      const localFilePath = path.join(UPLOADS_DIR, fileName);

      console.log(`Processing: ${fileName}`);

      // Check if file exists locally
      if (!fs.existsSync(localFilePath)) {
        console.warn(`File not found: ${localFilePath} - skipping`);
        stats.failed++;
        continue;
      }

      // Upload to Supabase
      const newUrl = await uploadFile(localFilePath, fileName);
      if (!newUrl) {
        stats.failed++;
        continue;
      }

      // Update database
      const updated = await updateImageUrl(image.id, newUrl);
      if (updated) {
        console.log(`✅ Migrated: ${fileName} -> ${newUrl}`);
        stats.success++;
      } else {
        stats.failed++;
      }
    }

    // Output results
    console.log("\nMigration completed:");
    console.log(`- Total images: ${stats.total}`);
    console.log(`- Successfully migrated: ${stats.success}`);
    console.log(`- Failed: ${stats.failed}`);
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateImages()
  .catch((error) => {
    console.error("Unhandled error during migration:", error);
    process.exit(1);
  })
  .finally(() => {
    console.log("Migration script execution finished");
  });
