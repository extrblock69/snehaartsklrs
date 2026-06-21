import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import * as dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json({ limit: "50mb" }));

const CONTENT_FILE_PATH = path.join(process.cwd(), "src", "data", "site_content.json");

// Helper: load content
function getSiteContent() {
  try {
    if (fs.existsSync(CONTENT_FILE_PATH)) {
      const raw = fs.readFileSync(CONTENT_FILE_PATH, "utf-8");
      return JSON.parse(raw);
    }
  } catch (error) {
    console.error("Error reading site_content.json, using fallback empty state", error);
  }
  return null;
}

// Helper: save content
function saveSiteContent(data: any): boolean {
  try {
    const dir = path.dirname(CONTENT_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONTENT_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Error writing to site_content.json", error);
    return false;
  }
}

// In-memory sessions
const SESSIONS = new Set<string>();

// Get ADMIN Credentials
const ADMIN_USER = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASS = process.env.ADMIN_PASSWORD || "sneha_admin_2026";

// Auth middleware
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
app.get("/api/content", (req, res) => {
  const content = getSiteContent();
  if (content) {
    res.json(content);
  } else {
    res.status(500).json({ error: "Unable to retrieve site content" });
  }
});

// API: Update Site Content (Protected)
app.post("/api/content", requireAdmin, (req, res) => {
  const newContent = req.body;
  if (!newContent || typeof newContent !== "object") {
    return res.status(400).json({ error: "Invalid data payload" });
  }

  const success = saveSiteContent(newContent);
  if (success) {
    res.json({ message: "Content updated successfully!", content: newContent });
  } else {
    res.status(500).json({ error: "Could not persist content on server" });
  }
});

const ADMIN_CONFIG_PATH = path.join(process.cwd(), "src", "data", "admin_config.json");

function getAdminCredentials() {
  let customPass = ADMIN_PASS;
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

function saveAdminCredentials(password: string): boolean {
  try {
    const dir = path.dirname(ADMIN_CONFIG_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(ADMIN_CONFIG_PATH, JSON.stringify({ password }, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Error writing to admin_config.json", error);
    return false;
  }
}

// API: Update Admin Passphrase (Protected)
app.post("/api/admin/change-password", requireAdmin, (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || typeof newPassword !== "string" || newPassword.trim().length === 0) {
    return res.status(400).json({ error: "Invalid password value" });
  }
  
  const success = saveAdminCredentials(newPassword.trim());
  if (success) {
    res.json({ success: true, message: "Administrator passphrase updated successfully!" });
  } else {
    res.status(500).json({ error: "Could not save the new passphrase on server" });
  }
});

// API: Login Route
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  
  const currentCredentials = getAdminCredentials();
  
  // Accept:
  // 1. The currently saved password (from admin_config.json / ADMIN_PASS)
  // 2. The default backup passphrases ("admin", "sneha_admin_2026", "sneha_admin")
  const isMatch = 
    password === "admin" || 
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
  res.json({ success: true });
});

// Setup Vite Dev Server / Static Files
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
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

setupVite().catch((err) => {
  console.error("Vite server configuration initialization failed", err);
});
