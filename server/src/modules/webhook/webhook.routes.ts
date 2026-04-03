import { Router, Request, Response } from "express";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { extractTextFromImage } from "../../services/ocr.service";

dotenv.config();

const webhookRoutes = Router();

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "finora123";
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN as string;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID as string;

/* ===================================================== */
/* ✅ STARTUP CHECK */
/* ===================================================== */
if (!ACCESS_TOKEN) {
  console.error("❌ WHATSAPP_ACCESS_TOKEN is missing from .env!");
}
if (!PHONE_NUMBER_ID) {
  console.error("❌ WHATSAPP_PHONE_NUMBER_ID is missing from .env!");
}

/* ===================================================== */
/* ✅ 1. WEBHOOK VERIFICATION (GET) */
/* ===================================================== */
webhookRoutes.get("/webhook", (req: Request, res: Response) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  console.log("🔍 Verification request received", { mode, token, challenge });

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified successfully");
    res.status(200).send(challenge);
    return;
  }

  console.log("❌ Verification failed — token mismatch or wrong mode");
  res.sendStatus(403);
});

/* ===================================================== */
/* 🔥 2. GET MEDIA URL */
/* ===================================================== */
const getMediaUrl = async (mediaId: string): Promise<string> => {
  console.log("📡 Fetching media URL for ID:", mediaId);

  const res = await fetch(`https://graph.facebook.com/v20.0/${mediaId}`, {
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
  });

  const data = (await res.json()) as { url?: string; error?: unknown };
  console.log("📦 MEDIA API RESPONSE:", JSON.stringify(data, null, 2));

  if (!res.ok || !data.url) {
    throw new Error(`Failed to get media URL: ${JSON.stringify(data)}`);
  }

  return data.url;
};

/* ===================================================== */
/* 🔥 3. DOWNLOAD IMAGE */
/* ===================================================== */
const downloadImage = async (url: string, filename: string): Promise<string> => {
  if (!url || !url.startsWith("http")) {
    throw new Error(`Invalid URL for download: ${url}`);
  }

  console.log("⬇️ Downloading image from:", url);

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "User-Agent": "curl/7.64.1",
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to download image: ${res.status} — ${errText}`);
  }

  const buffer = await res.arrayBuffer();

  const uploadDir = path.join(__dirname, "../../../uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filePath = path.join(uploadDir, filename);
  fs.writeFileSync(filePath, Buffer.from(buffer));

  console.log("✅ Image saved to:", filePath);
  return filePath;
};

/* ===================================================== */
/* ✅ 4. SEND TEXT MESSAGE */
/* ===================================================== */
const sendTextMessage = async (to: string, text: string): Promise<void> => {
  console.log("📤 Sending message to:", to);

  const res = await fetch(
    `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: { body: text },
      }),
    }
  );

  const data = await res.json();
  console.log("📤 SEND MESSAGE RESPONSE:", JSON.stringify(data, null, 2));
};

/* ===================================================== */
/* ✅ 5. HANDLE INCOMING MESSAGES (POST) */
/* ===================================================== */
webhookRoutes.post("/webhook", async (req: Request, res: Response) => {
  // ✅ MUST respond 200 immediately — WhatsApp will retry if you don't
  res.sendStatus(200);

  try {
    const body = req.body;

    console.log("📩 WEBHOOK RECEIVED:");
    console.log(JSON.stringify(body, null, 2));

    // ✅ Guard: only handle WhatsApp Business events
    if (body.object !== "whatsapp_business_account") {
      console.log("⚠️ Ignoring non-WhatsApp event:", body.object);
      return;
    }

    const entry = body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;

    // ✅ Guard: ignore delivery receipts and status updates
    if (value?.statuses) {
      console.log("📋 Status update received, ignoring.");
      return;
    }

    const message = value?.messages?.[0];
    const from: string = message?.from;

    if (!message || !from) {
      console.log("⚠️ No message or sender found in payload.");
      return;
    }

    console.log(`📨 Message type: ${message.type} | From: ${from}`);

    /* ================= TEXT ================= */
    if (message.type === "text") {
      const text: string = message.text?.body;
      console.log("💬 TEXT:", text);

      await sendTextMessage(from, `You said: ${text}`);
    }

    /* ================= IMAGE ================= */
    else if (message.type === "image") {
      const imageId: string = message.image?.id;
      const mimeType: string = message.image?.mime_type ?? "image/jpeg";
      const ext = mimeType.split("/")[1]?.split(";")[0] ?? "jpg";

      console.log(`📸 IMAGE ID: ${imageId} | MIME: ${mimeType}`);

      // Step 1: Get media URL
      const imageUrl = await getMediaUrl(imageId);

      // Step 2: Download
      const fileName = `image_${Date.now()}.${ext}`;
      const filePath = await downloadImage(imageUrl, fileName);

      // Step 3: OCR
      const extractedText = await extractTextFromImage(filePath);
      console.log("🧾 OCR RESULT:", extractedText);

      // Step 4: Reply
      if (extractedText?.trim()) {
        await sendTextMessage(from, `📄 Extracted text:\n\n${extractedText}`);
      } else {
        await sendTextMessage(from, "⚠️ Could not extract any text from the image.");
      }
    }

    /* ================= OTHER ================= */
    else {
      console.log(`⚠️ Unhandled message type: ${message.type}`);
    }

  } catch (error) {
    console.error("❌ WEBHOOK ERROR:", error);
  }
});

export default webhookRoutes;