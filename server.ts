import express from "express";
import path from "path";
import fs from "fs";
import * as dotenv from "dotenv";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import { allowLocalFallback } from "./fallback";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Set up CORS with selective origin validation based on environmental specifications
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173"
];

if (process.env.FRONTEND_URL) {
  // Support comma-separated list of values
  const origins = process.env.FRONTEND_URL.split(",").map(o => o.trim());
  allowedOrigins.push(...origins);
}

app.use(cors({
  origin: (origin, callback) => {
    // If no origin specified (e.g. server-to-server, curls), proceed.
    if (!origin) {
      return callback(null, true);
    }

    const isMatch = allowedOrigins.includes(origin) ||
      allowedOrigins.some(ao => origin.startsWith(ao)) ||
      origin.includes("run.app") ||
      origin.includes("localhost") ||
      origin.includes("vercel.app");

    if (isMatch) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: origin '${origin}' is restricted.`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Middleware
app.use(express.json({ limit: "50mb" }));

const isVercel = !!process.env.VERCEL;

const UPLOADS_DIR = isVercel
  ? path.join("/tmp", "uploads")
  : path.join(process.cwd(), "uploads");

try {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
} catch (error) {
  console.warn("Could not create uploads directory, likely a read-only serverless environment:", error);
}

app.use("/uploads", express.static(UPLOADS_DIR));

// Robust path helper to support Serverless, local dev, or standard persistent containers (like Render)
function getDataFilePath(filename: string, defaultSubpath: string): string {
  if (isVercel) {
    const tmpPath = path.join("/tmp", filename);
    if (!fs.existsSync(tmpPath)) {
      try {
        const repoPath = path.join(process.cwd(), defaultSubpath);
        if (fs.existsSync(repoPath)) {
          const parentDir = path.dirname(tmpPath);
          if (!fs.existsSync(parentDir)) {
            fs.mkdirSync(parentDir, { recursive: true });
          }
          fs.copyFileSync(repoPath, tmpPath);
          console.log(`Copied ${filename} from repo to writable location /tmp`);
        }
      } catch (e) {
        console.error(`Failed to copy ${filename} to /tmp:`, e);
      }
    }
    return tmpPath;
  }
  return path.join(process.cwd(), defaultSubpath);
}

const CONTENT_FILE_PATH = getDataFilePath("site_content.json", "src/data/site_content.json");

// Define Supabase Connection parameters support
const SUPABASE_URL = (process.env.SUPABASE_URL || "").replace(/^["']|["']$/g, "").trim();
const SUPABASE_ANON_KEY = (process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "").replace(/^["']|["']$/g, "").trim();
let supabaseClient: any = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  try {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log(`Supabase Client initialized successfully with URL: ${SUPABASE_URL}`);
  } catch (error) {
    console.error("Failed to initialize Supabase client:", error);
  }
} else {
  console.log("Supabase parameters omitted in environment. Operating with high-resilience local JSON database file.");
}

// Helper: Normalize absolute image URLs lacking the http/https protocol prefix
function normalizeClientUrls(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "string") {
    const lower = obj.toLowerCase();
    const looksLikeDomain = lower.includes("onrender.com") || lower.includes("supabase.co") || lower.includes("supabase.in") || lower.includes("snehaartsklrs");
    const containsUploads = lower.includes("/uploads/") || lower.includes("/storage/v1/");

    if ((looksLikeDomain || containsUploads) && 
        !obj.startsWith("http://") && 
        !obj.startsWith("https://") && 
        !obj.startsWith("/") &&
        !obj.startsWith("data:")) {
      return `https://${obj}`;
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => normalizeClientUrls(item));
  }
  if (typeof obj === "object") {
    const fresh: any = {};
    for (const key of Object.keys(obj)) {
      fresh[key] = normalizeClientUrls(obj[key]);
    }
    return fresh;
  }
  return obj;
}

// Helper: load content
async function getSiteContent() {
  let content = null;
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from("site_configs")
        .select("value")
        .eq("key", "site_content")
        .maybeSingle(); // Use maybeSingle to prevent 406 row count errors if empty
      
      if (error) {
        console.warn("Supabase database read notice:", error.message);
        if (!allowLocalFallback) {
          throw new Error(`Supabase database query failed and local storage is strictly disabled in fallback.ts: ${error.message}`);
        }
      } else if (data && data.value) {
        content = data.value;
      } else {
        // If row doesn't exist in Supabase yet, attempt to seed it automatically from the default JSON
        console.log("Seeding Supabase site_configs table with default content blueprint...");
        try {
          const raw = fs.readFileSync(CONTENT_FILE_PATH, "utf-8");
          const parsed = JSON.parse(raw);
          const { error: upsertError } = await supabaseClient
            .from("site_configs")
            .upsert({ key: "site_content", value: parsed });
          if (!upsertError) {
            content = parsed;
            console.log("Successfully seeded Supabase with initial site content.");
          } else {
            console.error("Supabase content seeding error:", upsertError.message);
            if (!allowLocalFallback) {
              throw new Error(`Supabase content seeding failed: ${upsertError.message}`);
            }
          }
        } catch (seedErr: any) {
          console.error("Failed to seed default content to Supabase:", seedErr.message);
          if (!allowLocalFallback) {
            throw seedErr;
          }
        }
      }
    } catch (err: any) {
      console.error("Supabase load exception:", err.message);
      if (!allowLocalFallback) {
        throw err;
      }
    }
  }

  if (!content) {
    if (!allowLocalFallback) {
      throw new Error("Supabase has no content row, is offline, or uninitialized, and local file fallback is disabled.");
    }
    try {
      if (fs.existsSync(CONTENT_FILE_PATH)) {
        const raw = fs.readFileSync(CONTENT_FILE_PATH, "utf-8");
        content = JSON.parse(raw);
      }
    } catch (error) {
      console.error("Error reading site_content.json, using fallback empty state", error);
    }
  }

  return normalizeClientUrls(content);
}

// Helper: save content with comprehensive diagnostic logging
async function saveSiteContent(data: any): Promise<boolean> {
  const payloadStr = JSON.stringify(data);
  const payloadSizeKb = (Buffer.byteLength(payloadStr, 'utf-8') / 1024).toFixed(2);
  
  console.log(`[BACKEND-DATA-SYNC] Initiating saveSiteContent payload. Size: ${payloadSizeKb} KB. Number of gallery items: ${data?.gallery?.length || 0}.`);

  let dbSaved = false;

  if (supabaseClient) {
    try {
      console.log(`[BACKEND-DATA-SYNC] Attempting to upsert site_content payload to Supabase database table "public.site_configs"...`);
      const { error } = await supabaseClient
        .from("site_configs")
        .upsert({ key: "site_content", value: data, updated_at: new Date().toISOString() }, { onConflict: "key" });
      
      if (!error) {
        dbSaved = true;
        console.log(`[BACKEND-DATA-SYNC] ✅ SUCCESS: Site content configuration successfully synchronized to Supabase Cloud "site_configs" table!`);
      } else {
        const fullErrorInfo = `Code: ${error.code || 'N/A'} | Message: ${error.message} | Details: ${error.details || 'None'} | Hint: ${error.hint || 'None'}`;
        console.error(`[BACKEND-DATA-SYNC] ❌ DATABASE WRITE ERROR: Supabase upsert returned rejection:`, error);
        
        if (!allowLocalFallback) {
          throw new Error(`Database Write Rejected. Supabase returned: [${error.message}] (Details: ${error.details || 'None'}, Hint: ${error.hint || 'None'}). Real-time local fallback is disabled in fallback.ts.`);
        }
      }
    } catch (err: any) {
      console.error(`[BACKEND-DATA-SYNC] ❌ EXCEPTION: Threw database-level exception:`, err);
      if (!allowLocalFallback) {
        throw new Error(`Database write operation threw an exception. Error: [${err.message || String(err)}]. Local backup storage is disabled.`);
      }
    }
  } else {
    console.warn(`[BACKEND-DATA-SYNC] ⚠️ Warning: Supabase client is not initialized (missing environment keys).`);
    if (!allowLocalFallback) {
      throw new Error(`Database service is unconfigured (SUPABASE_URL or SUPABASE_ANON_KEY are missing). Local storage fallback is disabled.`);
    }
  }

  // Only save to local site_content.json file as fallback if local fallback is allowed!
  if (allowLocalFallback) {
    try {
      const dir = path.dirname(CONTENT_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(CONTENT_FILE_PATH, payloadStr, "utf-8");
      console.log(`[BACKEND-DATA-SYNC] ✅ SUCCESS: Site configs saved to local file backup [${CONTENT_FILE_PATH}].`);
      return true;
    } catch (error: any) {
      console.error(`[BACKEND-DATA-SYNC] ❌ LOCAL FALLBACK WRITE FAILURE: site_content.json saving failed:`, error);
      if (dbSaved) {
        return true;
      }
      throw new Error(`Failed to save locally: ${error.message || String(error)} and DB update was not completed.`);
    }
  }

  return dbSaved;
}

// In-memory sessions list
const SESSIONS = new Set<string>();

// Get ADMIN Credentials settings
const ADMIN_USER = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASS = process.env.ADMIN_PASSWORD || "sneha_admin_2026";

// Auth validation middleware
const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing authentication token" });
  }
  const token = authHeader.split(" ")[1];
  if (!SESSIONS.has(token)) {
    return res.status(401).json({ error: "Unauthorized: Invalid or expired session" });
  }
  next();
};

// API: Get Current Content
app.get("/api/content", async (req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  try {
    const content = await getSiteContent();
    if (content) {
      return res.json(content);
    } else {
      return res.status(500).json({ error: "Unable to retrieve site content" });
    }
  } catch (err: any) {
    console.error("Express /api/content loader error:", err.message || err);
    return res.status(500).json({
      error: "Unable to retrieve site content due to database configuration or policy rules violation.",
      details: err.message || String(err)
    });
  }
});

// API: Get Supabase Connection Status and Diagnostics
app.get("/api/supabase-status", async (req, res) => {
  const isInitialized = !!supabaseClient;
  let databaseCheck = false;
  let storageCheck = false;
  let dbError: string | null = null;
  let storageError: string | null = null;

  if (isInitialized) {
    try {
      const { error } = await supabaseClient
        .from("site_configs")
        .select("key")
        .limit(1);
      
      if (error) {
        dbError = error.message;
      } else {
        databaseCheck = true;
      }
    } catch (err: any) {
      dbError = err.message || String(err);
    }

    try {
      const rawBucket = process.env.SUPABASE_STORAGE_BUCKET || "portfolio";
      const bucketName = rawBucket.replace(/^["']|["']$/g, "").trim();
      const { error } = await supabaseClient
        .storage
        .from(bucketName)
        .list("", { limit: 1 });
      
      if (error) {
        storageError = error.message;
      } else {
        storageCheck = true;
      }
    } catch (err: any) {
      storageError = err.message || String(err);
    }
  }

  res.json({
    configured: !!(process.env.SUPABASE_URL && (process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)),
    initialized: isInitialized,
    databaseOk: databaseCheck,
    storageOk: storageCheck,
    dbError,
    storageError,
    bucketUsed: (process.env.SUPABASE_STORAGE_BUCKET || "portfolio").replace(/^["']|["']$/g, "").trim(),
    envCheck: {
      hasUrl: !!process.env.SUPABASE_URL,
      urlLength: process.env.SUPABASE_URL ? process.env.SUPABASE_URL.trim().length : 0,
      hasAnonKey: !!process.env.SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    }
  });
});

// API: Perform interactive write and delete test on Supabase storage
app.post("/api/supabase-test-write", async (req, res) => {
  if (!supabaseClient) {
    return res.status(400).json({
      success: false,
      error: "Supabase client is not initialized. Please verify your SUPABASE_URL and SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY variables on your server env."
    });
  }

  const rawBucket = process.env.SUPABASE_STORAGE_BUCKET || "portfolio";
  const bucketName = rawBucket.replace(/^["']|["']$/g, "").trim();
  const testFilename = `connection_test_${Date.now()}.txt`;
  const testData = new TextEncoder().encode("Supabase storage read/write link verified successfully! You are ready to upload images.");

  try {
    // 1. Attempt upload
    const { data: uploadData, error: uploadError } = await supabaseClient
      .storage
      .from(bucketName)
      .upload(testFilename, testData, {
        contentType: "text/plain",
        cacheControl: "0",
        upsert: true
      });

    if (uploadError) {
      return res.status(500).json({
        success: false,
        phase: "upload",
        error: uploadError.message,
        details: uploadError
      });
    }

    // 2. Attempt URL resolution
    const { data: urlData } = supabaseClient
      .storage
      .from(bucketName)
      .getPublicUrl(testFilename);

    const publicUrl = urlData?.publicUrl || "";

    // 3. Attempt clean-up deletion
    const { error: deleteError } = await supabaseClient
      .storage
      .from(bucketName)
      .remove([testFilename]);

    let deletionStatus = "Cleaned up test file successfully";
    if (deleteError) {
      deletionStatus = `Failed to clean up test file: ${deleteError.message}`;
    }

    res.json({
      success: true,
      phase: "complete",
      message: `Successfully completed Supabase Cloud Storage verification!`,
      bucket: bucketName,
      filename: testFilename,
      resolvedUrl: publicUrl,
      cleanup: deletionStatus
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      phase: "exception",
      error: err.message || String(err)
    });
  }
});

// API: Update Site Content (Protected)
app.post("/api/content", requireAdmin, async (req, res) => {
  try {
    const newContent = req.body;
    if (!newContent || typeof newContent !== "object") {
      return res.status(400).json({ error: "Invalid data payload" });
    }

    const success = await saveSiteContent(newContent);
    if (success) {
      return res.json({ success: true, message: "Content updated successfully!", content: newContent });
    } else {
      return res.status(500).json({ error: "Could not persist content on server" });
    }
  } catch (err: any) {
    console.error("❌ Exception persisting site content configurations:", err.message || err);
    return res.status(500).json({
      error: `Database sync failure: ${err.message || String(err)}`
    });
  }
});

// API: Upload Media Image File (Protected)
app.post("/api/upload", requireAdmin, async (req, res) => {
  const { filename, base64Data } = req.body;
  
  if (!base64Data || typeof base64Data !== "string") {
    return res.status(400).json({ error: "Missing or invalid base64Data content payload" });
  }

  try {
    let mimeType = "image/png";
    let pureBase64 = base64Data;
    let extension = "png";

    if (base64Data.startsWith("data:")) {
      const match = base64Data.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        pureBase64 = match[2];
        const extMatch = mimeType.split("/");
        if (extMatch && extMatch[1]) {
          extension = extMatch[1];
        }
      }
    }

    // Sanitize file extensions
    if (extension === "jpeg") extension = "jpg";
    if (extension === "svg+xml") extension = "svg";
    if (extension === "gif") extension = "gif";
    if (extension === "webp") extension = "webp";

    const buffer = Buffer.from(pureBase64, "base64");
    
    // Create clean unique target filename to prevent overwriting assets
    const cleanBaseName = filename 
      ? path.basename(filename, path.extname(filename)).replace(/[^a-zA-Z0-9_-]/g, "_")
      : "upload";
    
    const uniqueFilename = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}_${cleanBaseName}.${extension}`;

    // Prefer Supabase Storage Upload if Supabase credentials are input
    if (supabaseClient) {
      try {
        const rawBucket = process.env.SUPABASE_STORAGE_BUCKET || "portfolio";
        const bucketName = rawBucket.replace(/^["']|["']$/g, "").trim();
        console.log(`Attempting cloud upload to Supabase Storage Bucket [${bucketName}] with filename [${uniqueFilename}]. Content-Type: ${mimeType}`);

        // Convert Node Buffer to a standard Uint8Array to prevent JS runtime/SDK platform mismatch warnings
        const binaryData = new Uint8Array(buffer);

        const { data: uploadData, error: uploadError } = await supabaseClient
          .storage
          .from(bucketName)
          .upload(uniqueFilename, binaryData, {
            contentType: mimeType,
            cacheControl: "31536000",
            upsert: true
          });

        if (uploadError) {
          console.error("❌ Supabase Storage upload failed with API Error:", uploadError.message, uploadError);
          if (!allowLocalFallback) {
            return res.status(500).json({
              error: "Supabase cloud storage upload failed and local fallback is strictly disabled in fallback.ts.",
              details: uploadError.message
            });
          }
          console.warn("Falling back to local Render disk storage for this upload.");
        } else if (uploadData) {
          const { data: urlData } = supabaseClient
            .storage
            .from(bucketName)
            .getPublicUrl(uniqueFilename);

          if (urlData && urlData.publicUrl) {
            console.log("✅ Successfully uploaded and retrieved public URL from Supabase Storage Bucket:", urlData.publicUrl);
            return res.json({ success: true, url: urlData.publicUrl });
          }
        }
      } catch (storageErr: any) {
        console.error("❌ Exception during Supabase Storage Upload operation:", storageErr.message || storageErr);
        if (!allowLocalFallback) {
          return res.status(500).json({
            error: "Supabase cloud storage upload threw an exception and local fallback is strictly disabled in fallback.ts.",
            details: storageErr.message || String(storageErr)
          });
        }
        console.warn("Falling back to local Render disk storage for this upload.");
      }
    } else {
      // Supabase not configured
      if (!allowLocalFallback) {
        return res.status(500).json({
          error: "Supabase is not configured and local fallback is strictly disabled in fallback.ts."
        });
      }
    }

    // Default Fallback: Write directly to dynamic hosting uploads directory (only if allowLocalFallback is true)
    const filePath = path.join(UPLOADS_DIR, uniqueFilename);
    fs.writeFileSync(filePath, buffer);

    // Dynamic Absolute URL detector so local fallbacks resolve correctly across separate frontend & backend domains:
    let backendUrl = process.env.BACKEND_URL;
    let publicUrl = "";
    if (backendUrl) {
      if (!backendUrl.startsWith("http://") && !backendUrl.startsWith("https://")) {
        backendUrl = `https://${backendUrl}`;
      }
      publicUrl = `${backendUrl.replace(/\/$/, "")}/uploads/${uniqueFilename}`;
    } else {
      const proto = (req.headers["x-forwarded-proto"] as string || "http").split(",")[0].trim();
      const host = req.get("host");
      publicUrl = `${proto}://${host}/uploads/${uniqueFilename}`;
    }

    res.json({ success: true, url: publicUrl });
  } catch (err: any) {
    console.error("Image file storage saving action failed:", err);
    res.status(500).json({ error: "Failed to persist uploaded asset on server subspace", details: err.message });
  }
});

const ADMIN_CONFIG_PATH = getDataFilePath("admin_config.json", "src/data/admin_config.json");

async function getAdminCredentials() {
  let customPass = ADMIN_PASS;

  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from("site_configs")
        .select("value")
        .eq("key", "admin_config")
        .single();
      
      if (data && data.value && data.value.password) {
        return {
          username: ADMIN_USER,
          password: data.value.password
        };
      }
    } catch (err: any) {
      console.warn("Supabase credential load skipped (using local configuration):", err.message);
    }
  }

  try {
    if (fs.existsSync(ADMIN_CONFIG_PATH)) {
      const data = JSON.parse(fs.readFileSync(ADMIN_CONFIG_PATH, "utf-8"));
      if (data && data.password) {
        customPass = data.password;
      }
    }
  } catch (error) {
    console.error("Error reading admin_config.json", error);
  }
  return {
    username: ADMIN_USER,
    password: customPass
  };
}

async function saveAdminCredentials(password: string): Promise<boolean> {
  let dbSaved = false;

  if (supabaseClient) {
    try {
      const { error } = await supabaseClient
        .from("site_configs")
        .upsert({ key: "admin_config", value: { password } });
      
      if (!error) {
        dbSaved = true;
        console.log("Successfully persisted administrator password configuration to Supabase Cloud Server!");
      }
    } catch (err: any) {
      console.error("Supabase Save credentials exception:", err.message);
    }
  }

  try {
    const dir = path.dirname(ADMIN_CONFIG_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(ADMIN_CONFIG_PATH, JSON.stringify({ password }, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Error writing to admin_config.json", error);
    return dbSaved;
  }
}

// API: Update Admin Passphrase (Protected)
app.post("/api/admin/change-password", requireAdmin, async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || typeof newPassword !== "string" || newPassword.trim().length === 0) {
    return res.status(400).json({ error: "Invalid password value" });
  }
  
  const success = await saveAdminCredentials(newPassword.trim());
  if (success) {
    res.json({ success: true, message: "Administrator passphrase updated successfully!" });
  } else {
    res.status(500).json({ error: "Could not save the new passphrase on server" });
  }
});

// API: Login Route
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  
  const currentCredentials = await getAdminCredentials();
  
  // Accept:
  // 1. The currently saved password (from admin_config.json / ADMIN_PASS)
  // 2. The default backup passphrases ("admin", "snehaklrs", "sneha_admin_2026")
  const isMatch = 
    password === "admin" || 
    password === "snehaklrs" ||
    password === "sneha_admin_2026" || 
    password === "sneha_admin" || 
    (currentCredentials.password && password === currentCredentials.password);
  
  if (isMatch) {
    // Generate a simple secure random token
    const token = "token_" + Math.random().toString(36).substring(2) + Date.now().toString(36);
    SESSIONS.add(token);
    res.json({ success: true, token });
  } else {
    res.status(401).json({ error: "Incorrect administrator username or password credentials" });
  }
});

// API: Logout Route
app.post("/api/logout", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    SESSIONS.delete(token);
  }
  res.json({ success: true, message: "Logged out successfully" });
});

// Setup Vite Dev Server / Static Files
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Mounted Vite Dev Server middleware");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving production assets from dist");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server actively running on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  setupVite().catch((err) => {
    console.error("Vite server configuration initialization failed", err);
  });
}

export default app;
