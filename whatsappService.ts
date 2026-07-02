import {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  WASocket
} from "@whiskeysockets/baileys";
import pino from "pino";
import fs from "fs";
import path from "path";
import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

let sock: WASocket | null = null;
let pairingCode: string | null = null;
let qrCodeUrl: string | null = null;
let connectionStatus: "disconnected" | "connecting" | "pairing" | "connected" = "disconnected";
let lastError: string | null = null;

const AUTH_DIR = path.join(process.cwd(), "baileys_auth_info");

const SUPABASE_URL = (process.env.SUPABASE_URL || "").replace(/^["']|["']$/g, "").trim();
const SUPABASE_ANON_KEY = (process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "").replace(/^["']|["']$/g, "").trim();
let supabaseClient: any = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  try {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log(`[WHATSAPP-SUPABASE] Client initialized successfully with URL: ${SUPABASE_URL}`);
  } catch (error) {
    console.error("[WHATSAPP-SUPABASE] Failed to initialize Supabase client:", error);
  }
}

let saveTimeout: NodeJS.Timeout | null = null;

export function debouncedSave() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(async () => {
    await saveAuthToSupabase();
  }, 2000);
}

async function saveAuthToSupabase() {
  if (!supabaseClient) return;
  if (!fs.existsSync(AUTH_DIR)) return;

  try {
    const files = fs.readdirSync(AUTH_DIR);
    const sessionData: Record<string, any> = {};

    for (const file of files) {
      const filePath = path.join(AUTH_DIR, file);
      const stat = fs.statSync(filePath);
      if (stat.isFile() && file.endsWith(".json")) {
        const content = fs.readFileSync(filePath, "utf-8");
        try {
          sessionData[file] = JSON.parse(content);
        } catch {
          // Fallback to raw string if not JSON
          sessionData[file] = content;
        }
      }
    }

    // Upsert into Supabase site_configs table
    const { error } = await supabaseClient
      .from("site_configs")
      .upsert({
        key: "whatsapp_auth_session",
        value: sessionData,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error("[WHATSAPP-SUPABASE] Error saving auth state to Supabase:", error.message);
    } else {
      console.log("[WHATSAPP-SUPABASE] ✅ Saved auth state snapshot to Supabase site_configs.");
    }
  } catch (err) {
    console.error("[WHATSAPP-SUPABASE] Failed to save auth state to Supabase:", err);
  }
}

async function restoreAuthFromSupabase() {
  if (!supabaseClient) {
    console.log("[WHATSAPP-SUPABASE] Supabase client not initialized. Skipping cloud restore.");
    return false;
  }

  try {
    console.log("[WHATSAPP-SUPABASE] Attempting to restore WhatsApp auth state from Supabase...");
    const { data, error } = await supabaseClient
      .from("site_configs")
      .select("value")
      .eq("key", "whatsapp_auth_session")
      .maybeSingle();

    if (error) {
      console.error("[WHATSAPP-SUPABASE] Error fetching auth state from Supabase:", error.message);
      return false;
    }

    if (data && data.value) {
      const sessionData = data.value;
      
      // Ensure auth directory exists
      if (!fs.existsSync(AUTH_DIR)) {
        fs.mkdirSync(AUTH_DIR, { recursive: true });
      }

      const filesRestored: string[] = [];
      for (const [fileName, fileContent] of Object.entries(sessionData)) {
        const filePath = path.join(AUTH_DIR, fileName);
        const contentStr = typeof fileContent === "object" ? JSON.stringify(fileContent, null, 2) : String(fileContent);
        fs.writeFileSync(filePath, contentStr, "utf-8");
        filesRestored.push(fileName);
      }

      console.log(`[WHATSAPP-SUPABASE] ✅ Restored ${filesRestored.length} auth files from Supabase.`);
      return true;
    } else {
      console.log("[WHATSAPP-SUPABASE] No saved WhatsApp auth session found in Supabase.");
      return false;
    }
  } catch (err) {
    console.error("[WHATSAPP-SUPABASE] Failed to restore auth state from Supabase:", err);
    return false;
  }
}

async function clearAuthInSupabase() {
  if (supabaseClient) {
    try {
      const { error } = await supabaseClient
        .from("site_configs")
        .delete()
        .eq("key", "whatsapp_auth_session");
      if (error) {
        console.error("[WHATSAPP-SUPABASE] Error deleting auth session from Supabase:", error.message);
      } else {
        console.log("[WHATSAPP-SUPABASE] Successfully cleared auth session in Supabase.");
      }
    } catch (err) {
      console.error("[WHATSAPP-SUPABASE] Failed to clear auth session in Supabase:", err);
    }
  }
}

export function cleanupAuth() {
  if (fs.existsSync(AUTH_DIR)) {
    try {
      fs.rmSync(AUTH_DIR, { recursive: true, force: true });
      console.log("[WHATSAPP] Auth session folder cleaned up successfully.");
    } catch (e) {
      console.error("[WHATSAPP] Failed to delete auth folder:", e);
    }
  }
  clearAuthInSupabase().catch(err => {
    console.error("[WHATSAPP-SUPABASE] Error clearing Supabase auth session on cleanup:", err);
  });
}

export async function initWhatsApp(phoneNumber?: string, forceRestart = false) {
  if (forceRestart) {
    if (sock) {
      try {
        sock.end(undefined);
      } catch (e) {}
      sock = null;
    }
    // Delay slightly to let socket close completely and release any file locks
    await new Promise((resolve) => setTimeout(resolve, 1000));
    cleanupAuth();
    qrCodeUrl = null;
    pairingCode = null;
    lastError = null;
  }

  // If already connecting or connected and not forcing restart, skip
  if (sock && (connectionStatus === "connecting" || connectionStatus === "connected" || connectionStatus === "pairing")) {
    return;
  }

  try {
    connectionStatus = "connecting";
    pairingCode = null;
    qrCodeUrl = null;
    lastError = null;

    console.log("[WHATSAPP] Initializing Baileys client... Auth directory:", AUTH_DIR);
    
    // Restore from Supabase first if the local directory is empty/missing
    if (!fs.existsSync(AUTH_DIR) || fs.readdirSync(AUTH_DIR).length === 0) {
      await restoreAuthFromSupabase();
    }

    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

    sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      logger: pino({ level: "silent" })
    });

    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        try {
          const QRCode = await import("qrcode");
          qrCodeUrl = await QRCode.toDataURL(qr);
          connectionStatus = "pairing";
          console.log("[WHATSAPP] New QR Code generated successfully.");
        } catch (e) {
          console.error("[WHATSAPP] Failed to generate QR code data URL:", e);
        }
      }

      if (connection === "connecting") {
        connectionStatus = "connecting";
      }

      if (connection === "open") {
        connectionStatus = "connected";
        pairingCode = null;
        qrCodeUrl = null;
        console.log("[WHATSAPP] ✅ Connection opened successfully!");
        debouncedSave(); // Force save to Supabase upon successful connection open
      }

      if (connection === "close") {
        const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        const errMsg = lastDisconnect?.error?.message || String(lastDisconnect?.error || "Unknown disconnect error");
        console.log(`[WHATSAPP] Connection closed. StatusCode: ${statusCode}. Reconnecting: ${shouldReconnect}. Error: ${errMsg}`);
        
        lastError = `Disconnected (${errMsg})`;
        connectionStatus = "disconnected";
        pairingCode = null;
        qrCodeUrl = null;
        sock = null;

        if (shouldReconnect) {
          // Delay reconnection slightly to prevent infinite rapid loops
          setTimeout(() => {
            initWhatsApp(phoneNumber);
          }, 5000);
        } else {
          console.warn("[WHATSAPP] Logged out or session invalidated. Cleaning up local storage...");
          setTimeout(() => {
            cleanupAuth();
          }, 1000);
        }
      }
    });

    sock.ev.on("creds.update", async () => {
      await saveCreds();
      debouncedSave(); // Save backup snapshot to Supabase on credentials update
    });

    // If we have a phone number and we are not logged in, trigger companion linking code request
    if (phoneNumber && !state.creds.registered) {
      const firstNum = phoneNumber.split(/[,,;]/)[0].trim();
      let cleanedPhone = firstNum.replace(/\D/g, "");
      // If phone number is 10 digits, default to country code India (91)
      if (cleanedPhone.length === 10) {
        cleanedPhone = "91" + cleanedPhone;
      }

      console.log(`[WHATSAPP] Requesting companion pairing code for phone: ${cleanedPhone}`);
      
      // Delay requesting pairing code to let socket establish connections
      setTimeout(async () => {
        try {
          if (sock && !sock.authState.creds.registered) {
            const code = await sock.requestPairingCode(cleanedPhone);
            if (code) {
              // Format standard 8 character code to AAAA-BBBB style for high visibility
              pairingCode = (code.substring(0, 4) + "-" + code.substring(4)).toUpperCase();
              connectionStatus = "pairing";
              qrCodeUrl = null;
              lastError = null;
              console.log(`[WHATSAPP] Companion pairing code generated: ${pairingCode}`);
            }
          }
        } catch (err: any) {
          console.error("[WHATSAPP] Companion pairing code request failed:", err);
          connectionStatus = "disconnected";
          pairingCode = null;
          lastError = `Pairing code request failed: ${err?.message || String(err)}`;
        }
      }, 3000);
    }

  } catch (error: any) {
    console.error("[WHATSAPP] Failed to initialize WhatsApp sock:", error);
    connectionStatus = "disconnected";
    pairingCode = null;
    qrCodeUrl = null;
    sock = null;
    lastError = `Initialization failed: ${error?.message || String(error)}`;
  }
}

export function getWhatsAppStatus() {
  return {
    status: connectionStatus,
    pairingCode: pairingCode,
    qrCode: qrCodeUrl,
    error: lastError
  };
}

export async function disconnectWhatsApp() {
  if (sock) {
    try {
      sock.end(undefined);
    } catch (e) {}
    sock = null;
  }
  connectionStatus = "disconnected";
  pairingCode = null;
  cleanupAuth();
}

export async function sendWhatsAppMessage(to: string, text: string) {
  if (connectionStatus !== "connected" || !sock) {
    throw new Error(`WhatsApp is not connected (current status: ${connectionStatus})`);
  }

  // Format to standard international digits
  let cleaned = to.replace(/\D/g, "");
  
  // If phone number is 10 digits and doesn't start with country code, default to India (91)
  if (cleaned.length === 10) {
    cleaned = "91" + cleaned;
  }

  const recipientJid = `${cleaned}@s.whatsapp.net`;
  console.log(`[WHATSAPP] Attempting to send message to ${recipientJid}...`);
  
  await sock.sendMessage(recipientJid, { text });
  console.log(`[WHATSAPP] Message successfully delivered to ${recipientJid}`);
}
