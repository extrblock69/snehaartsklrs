import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  WASocket
} from "@whiskeysockets/baileys";
import pino from "pino";
import fs from "fs";
import path from "path";

let sock: WASocket | null = null;
let pairingCode: string | null = null;
let connectionStatus: "disconnected" | "connecting" | "pairing" | "connected" = "disconnected";

const AUTH_DIR = path.join(process.cwd(), "baileys_auth_info");

export function cleanupAuth() {
  if (fs.existsSync(AUTH_DIR)) {
    try {
      fs.rmSync(AUTH_DIR, { recursive: true, force: true });
      console.log("[WHATSAPP] Auth session folder cleaned up successfully.");
    } catch (e) {
      console.error("[WHATSAPP] Failed to delete auth folder:", e);
    }
  }
}

export async function initWhatsApp(phoneNumber?: string, forceRestart = false) {
  if (forceRestart) {
    if (sock) {
      try {
        sock.end(undefined);
      } catch (e) {}
      sock = null;
    }
    cleanupAuth();
  }

  // If already connecting or connected and not forcing restart, skip
  if (sock && (connectionStatus === "connecting" || connectionStatus === "connected" || connectionStatus === "pairing")) {
    return;
  }

  try {
    connectionStatus = "connecting";
    pairingCode = null;

    console.log("[WHATSAPP] Initializing Baileys client... Auth directory:", AUTH_DIR);
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

    sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      logger: pino({ level: "silent" })
    });

    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect } = update;

      if (connection === "connecting") {
        connectionStatus = "connecting";
      }

      if (connection === "open") {
        connectionStatus = "connected";
        pairingCode = null;
        console.log("[WHATSAPP] ✅ Connection opened successfully!");
      }

      if (connection === "close") {
        const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        console.log(`[WHATSAPP] Connection closed. StatusCode: ${statusCode}. Reconnecting: ${shouldReconnect}`);

        connectionStatus = "disconnected";
        pairingCode = null;
        sock = null;

        if (shouldReconnect) {
          // Delay reconnection slightly to prevent infinite rapid loops
          setTimeout(() => {
            initWhatsApp(phoneNumber);
          }, 5000);
        } else {
          console.warn("[WHATSAPP] Logged out or session invalidated. Cleaning up local storage...");
          cleanupAuth();
        }
      }
    });

    sock.ev.on("creds.update", saveCreds);

    // If we have a phone number and we are not logged in, trigger companion linking code request
    if (phoneNumber && !state.creds.registered) {
      let cleanedPhone = phoneNumber.replace(/\D/g, "");
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
              console.log(`[WHATSAPP] Companion pairing code generated: ${pairingCode}`);
            }
          }
        } catch (err: any) {
          console.error("[WHATSAPP] Companion pairing code request failed:", err);
          connectionStatus = "disconnected";
          pairingCode = null;
        }
      }, 3000);
    }

  } catch (error) {
    console.error("[WHATSAPP] Failed to initialize WhatsApp sock:", error);
    connectionStatus = "disconnected";
    pairingCode = null;
    sock = null;
  }
}

export function getWhatsAppStatus() {
  return {
    status: connectionStatus,
    pairingCode: pairingCode
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
