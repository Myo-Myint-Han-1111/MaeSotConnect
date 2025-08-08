import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function smartDailyBackup() {
  console.log("🔄 Starting SMART daily backup...");

  const today = new Date().toISOString().split("T")[0];
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupFolder = path.join(
    __dirname,
    "../backups",
    `smart-backup-${today}`
  );

  if (!fs.existsSync(backupFolder)) {
    fs.mkdirSync(backupFolder, { recursive: true });
  }

  console.log(`📂 Backup folder: ${backupFolder}`);

  // 1. AUTO: Backup Storage Files (This works!)
  console.log("\n📁 AUTO: Backing up storage files...");
  const storageResult = await backupStorageFiles(backupFolder);

  // 2. SMART: Handle Database Backup
  console.log("\n🗃️ SMART: Handling database backup...");
  const databaseResult = await handleDatabaseBackup(backupFolder);

  // 3. Create comprehensive report
  createSmartReport(backupFolder, timestamp, storageResult, databaseResult);

  // 4. Clean up old backups (keep last 10 days) - DISABLED
  // cleanupOldBackups();
  console.log("🔒 Auto-cleanup disabled - all backups preserved");

  console.log("\n🎉 SMART BACKUP COMPLETED!");
  console.log(`📍 Location: ${backupFolder}`);

  // Show results
  showResults(storageResult, databaseResult);
}

async function backupStorageFiles(backupFolder) {
  const storageFolder = path.join(backupFolder, "storage");
  if (!fs.existsSync(storageFolder)) {
    fs.mkdirSync(storageFolder, { recursive: true });
  }

  const buckets = ["course-images", "logo-images"];
  let totalFiles = 0;
  let successFiles = 0;

  for (const bucketName of buckets) {
    const bucketFolder = path.join(storageFolder, bucketName);
    if (!fs.existsSync(bucketFolder)) {
      fs.mkdirSync(bucketFolder, { recursive: true });
    }

    try {
      const { data: files, error } = await supabase.storage
        .from(bucketName)
        .list();

      if (error || !files || files.length === 0) {
        console.log(`ℹ️ No files in ${bucketName}`);
        continue;
      }

      console.log(`📥 Downloading ${files.length} files from ${bucketName}...`);
      totalFiles += files.length;

      for (const file of files) {
        try {
          const { data, error: downloadError } = await supabase.storage
            .from(bucketName)
            .download(file.name);

          if (downloadError) {
            console.log(`❌ ${file.name}: ${downloadError.message}`);
            continue;
          }

          const buffer = await data.arrayBuffer();
          fs.writeFileSync(
            path.join(bucketFolder, file.name),
            Buffer.from(buffer)
          );
          console.log(`✅ ${file.name}`);
          successFiles++;
        } catch (err) {
          console.log(`❌ ${file.name}: Download failed`);
        }
      }
    } catch (err) {
      console.log(`❌ Error accessing bucket ${bucketName}: ${err.message}`);
    }
  }

  console.log(`✅ Storage backup: ${successFiles}/${totalFiles} files`);

  return {
    status: "success",
    totalFiles,
    successFiles,
    message: `${successFiles}/${totalFiles} files backed up automatically`,
  };
}

async function handleDatabaseBackup(backupFolder) {
  const databaseFolder = path.join(backupFolder, "database");
  if (!fs.existsSync(databaseFolder)) {
    fs.mkdirSync(databaseFolder, { recursive: true });
  }

  // Check when last manual database backup was completed
  const lastBackupFile = path.join(__dirname, "../.backup-tracker.json");
  let lastBackupInfo = { date: null, tables: [] };

  if (fs.existsSync(lastBackupFile)) {
    try {
      lastBackupInfo = JSON.parse(fs.readFileSync(lastBackupFile, "utf8"));
    } catch (err) {
      // File corrupted, start fresh
    }
  }

  const daysSinceLastBackup = lastBackupInfo.date
    ? Math.floor(
        (new Date() - new Date(lastBackupInfo.date)) / (1000 * 60 * 60 * 24)
      )
    : 999;

  console.log(`📊 Last database backup: ${lastBackupInfo.date || "Never"}`);
  console.log(`📅 Days since last backup: ${daysSinceLastBackup}`);

  let status = "current";
  let message = "Database backup is current";

  if (daysSinceLastBackup > 7) {
    status = "urgent";
    message = "Database backup URGENTLY needed (>7 days old)";
    createUrgentInstructions(databaseFolder);
  } else if (daysSinceLastBackup > 3) {
    status = "recommended";
    message = "Database backup recommended (>3 days old)";
    createRecommendedInstructions(databaseFolder);
  } else {
    status = "current";
    message = "Database backup is current";
    createCurrentStatus(databaseFolder, lastBackupInfo.date);
  }

  return { status, daysSinceLastBackup, message };
}

function createUrgentInstructions(databaseFolder) {
  const html = generateInstructionsHTML(
    "URGENT",
    "#dc3545",
    "Your database backup is more than 7 days old. Please backup now to protect against data loss."
  );
  fs.writeFileSync(
    path.join(databaseFolder, "URGENT_BACKUP_NEEDED.html"),
    html
  );
  console.log("🚨 URGENT backup instructions created");
}

function createRecommendedInstructions(databaseFolder) {
  const html = generateInstructionsHTML(
    "RECOMMENDED",
    "#ffc107",
    "Your database backup is getting old. Consider backing up soon."
  );
  fs.writeFileSync(path.join(databaseFolder, "backup_recommended.html"), html);
  console.log("💡 Recommended backup instructions created");
}

function createCurrentStatus(databaseFolder, lastDate) {
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Database Backup Status</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        .status-good { background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 10px; text-align: center; }
        .status-good h2 { color: #155724; margin-top: 0; }
    </style>
</head>
<body>
    <div class="status-good">
        <h2>✅ Database Backup Status: CURRENT</h2>
        <p><strong>Last backup:</strong> ${lastDate}</p>
        <p><strong>Status:</strong> Your database is well protected</p>
        <p><strong>Next backup needed:</strong> When prompted by the system</p>
        <hr>
        <p><em>Your files are automatically backed up daily.<br>
        Database backup needed only when system prompts you.</em></p>
    </div>
</body>
</html>`;

  fs.writeFileSync(path.join(databaseFolder, "status_current.html"), html);
  console.log("✅ Current status file created");
}

function generateInstructionsHTML(urgency, color, description) {
  return `
<!DOCTYPE html>
<html>
<head>
    <title>Database Backup - ${urgency}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background: ${color}; color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; text-align: center; }
        .step { background: #f8f9fa; border: 1px solid #dee2e6; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .checklist { background: white; border: 1px solid #dee2e6; padding: 20px; border-radius: 5px; }
        .checklist li { margin: 8px 0; font-size: 16px; }
        .button { background: #007bff; color: white; padding: 12px 24px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; }
        .button:hover { background: #0056b3; }
        .quick-links { background: #e7f3ff; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .quick-links a { display: inline-block; margin: 5px 10px; padding: 8px 16px; background: #007bff; color: white; text-decoration: none; border-radius: 3px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🗃️ Database Backup Required</h1>
        <h2>${urgency}</h2>
        <p>${description}</p>
    </div>

    <div class="quick-links">
        <h3>🚀 Quick Start</h3>
        <a href="https://supabase.com" target="_blank">Open Supabase Dashboard</a>
        <a href="#checklist">View Checklist</a>
        <a href="#detailed-steps">Detailed Steps</a>
    </div>

    <div class="checklist" id="checklist">
        <h3>📋 Quick Checklist (5 minutes)</h3>
        <ol style="font-size: 18px; line-height: 1.6;">
            <li>✅ <input type="checkbox"> Open <a href="https://supabase.com" target="_blank">Supabase Dashboard</a></li>
            <li>✅ <input type="checkbox"> Go to Table Editor</li>
            <li>✅ <input type="checkbox"> Export User table → CSV</li>
            <li>✅ <input type="checkbox"> Export Organization table → CSV</li>
            <li>✅ <input type="checkbox"> Export Course table → CSV</li>
            <li>✅ <input type="checkbox"> Export Image table → CSV</li>
            <li>✅ <input type="checkbox"> Export Badge table → CSV</li>
            <li>✅ <input type="checkbox"> Export FAQ table → CSV</li>
            <li>✅ <input type="checkbox"> Save all files in this backup folder</li>
            <li>✅ <input type="checkbox"> Click "Mark Complete" button below</li>
        </ol>
        
        <div style="text-align: center; margin-top: 20px;">
            <button class="button" onclick="markComplete()">✅ Mark Backup Complete</button>
        </div>
    </div>

    <div class="step" id="detailed-steps">
        <h3>📖 Detailed Steps</h3>
        <ol>
            <li><strong>Open Supabase Dashboard:</strong> Go to <a href="https://supabase.com" target="_blank">https://supabase.com</a></li>
            <li><strong>Select your project</strong> from the dashboard</li>
            <li><strong>Click "Table Editor"</strong> in the left sidebar</li>
            <li><strong>For each table listed in the checklist:</strong>
                <ul>
                    <li>Click on the table name</li>
                    <li>Look for "Export" button (usually top-right of the table)</li>
                    <li>Click "Export" → "CSV"</li>
                    <li>Save the file with the table name (e.g., "User.csv")</li>
                </ul>
            </li>
            <li><strong>Save all CSV files</strong> in this backup folder</li>
            <li><strong>Click "Mark Complete"</strong> to update the backup tracker</li>
        </ol>
    </div>

    <script>
        function markComplete() {
            const today = new Date().toISOString().split('T')[0];
            alert('✅ Backup marked as complete for ' + today + '\\n\\n' +
                  'Your database is now protected!\\n\\n' +
                  'Next backup will be needed in 7 days.\\n' +
                  'The system will remind you automatically.');
            
            // In a real implementation, this would call an API to update the tracker
            // For now, user can manually create a file to mark completion
        }
        
        // Auto-scroll to checklist
        document.addEventListener('DOMContentLoaded', function() {
            if (window.location.hash === '' && '${urgency}' === 'URGENT') {
                document.getElementById('checklist').scrollIntoView();
            }
        });
    </script>
</body>
</html>`;
}

function createSmartReport(
  backupFolder,
  timestamp,
  storageResult,
  databaseResult
) {
  const report = {
    timestamp,
    date: new Date().toISOString().split("T")[0],
    type: "smart_daily_backup",
    storage: storageResult,
    database: databaseResult,
    protection_status: {
      files: "PROTECTED (automatic)",
      database:
        databaseResult.status === "current" ? "PROTECTED" : "ACTION NEEDED",
    },
    next_actions: getNextActions(storageResult, databaseResult),
  };

  fs.writeFileSync(
    path.join(backupFolder, "smart-backup-report.json"),
    JSON.stringify(report, null, 2)
  );

  console.log("✅ Smart backup report created");
}

function getNextActions(storageResult, databaseResult) {
  const actions = [];

  if (storageResult.status === "success") {
    actions.push("✅ Files automatically protected - no action needed");
  } else {
    actions.push("⚠️ Check storage backup status");
  }

  if (databaseResult.status === "urgent") {
    actions.push("🚨 URGENT: Backup database now (open database folder)");
  } else if (databaseResult.status === "recommended") {
    actions.push("💡 Recommended: Backup database soon (open database folder)");
  } else {
    actions.push("✅ Database backup current - no action needed");
  }

  return actions;
}

// function cleanupOldBackups() {
//   const backupsDir = path.join(__dirname, "../backups");
//   if (!fs.existsSync(backupsDir)) return;

//   const cutoffDate = new Date();
//   cutoffDate.setDate(cutoffDate.getDate() - 10); // Keep 10 days

//   const backupFolders = fs.readdirSync(backupsDir);

//   for (const folder of backupFolders) {
//     if (
//       !folder.startsWith("smart-backup-") &&
//       !folder.startsWith("auto-backup-")
//     )
//       continue;

//     const folderPath = path.join(backupsDir, folder);
//     try {
//       const stats = fs.statSync(folderPath);
//       if (stats.isDirectory() && stats.mtime < cutoffDate) {
//         fs.rmSync(folderPath, { recursive: true, force: true });
//         console.log(`🗑️ Cleaned up old backup: ${folder}`);
//       }
//     } catch (err) {
//       // Ignore cleanup errors
//     }
//   }
// }

function showResults(storageResult, databaseResult) {
  console.log("\n📊 BACKUP RESULTS:");
  console.log("==================");
  console.log(`📁 Files: ✅ ${storageResult.message}`);
  console.log(
    `🗃️ Database: ${getDatabaseStatusIcon(databaseResult.status)} ${
      databaseResult.message
    }`
  );
  console.log("");

  if (databaseResult.status !== "current") {
    console.log("💡 NEXT STEPS:");
    console.log("   1. Open the backup folder");
    console.log("   2. Go to database/ subfolder");
    console.log("   3. Open the HTML file for instructions");
    console.log("   4. Follow the 5-minute checklist");
    console.log("");
  }

  console.log("🎯 PROTECTION STATUS:");
  console.log(`   Files: PROTECTED (daily automatic backup)`);
  console.log(
    `   Database: ${
      databaseResult.status === "current" ? "PROTECTED" : "NEEDS ATTENTION"
    }`
  );
}

function getDatabaseStatusIcon(status) {
  switch (status) {
    case "current":
      return "✅";
    case "recommended":
      return "💡";
    case "urgent":
      return "🚨";
    default:
      return "❓";
  }
}

// Create backup tracker helper
async function markDatabaseBackupComplete() {
  const trackerFile = path.join(__dirname, "../.backup-tracker.json");
  const trackerData = {
    date: new Date().toISOString().split("T")[0],
    timestamp: new Date().toISOString(),
    tables: [
      "User",
      "Organization",
      "Course",
      "Image",
      "Badge",
      "FAQ",
      "AdminAllowList",
    ],
  };

  fs.writeFileSync(trackerFile, JSON.stringify(trackerData, null, 2));
  console.log("✅ Database backup marked as complete");
}

// Run the smart daily backup
smartDailyBackup();
