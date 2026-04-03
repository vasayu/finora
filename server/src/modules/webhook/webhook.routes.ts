import { Router } from "express";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { extractTextFromImage } from "../../services/ocr.service";

const webhookRoutes = Router();

const VERIFY_TOKEN = "finora123";
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN as string;

// ✅ Verification (Meta calls this)
webhookRoutes.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"] as string;
  const token = req.query["hub.verify_token"] as string;
  const challenge = req.query["hub.challenge"] as string;

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified");
    return res.status(200).send(challenge);
  }

  console.log("❌ Verification failed");
  return res.sendStatus(403);
});

// 🔥 Helper: Get media URL from Meta
const getMediaUrl = async (mediaId: string) => {
  const res = await fetch(
    `https://graph.facebook.com/v20.0/${mediaId}`,
    {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
    }
  );

  const data = await res.json();
  return data.url;
};

// 🔥 Helper: Download image
const downloadImage = async (url: string, filename: string): Promise<string> => {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
  });

  const buffer = await res.arrayBuffer();

  const filePath = path.join(__dirname, "../../../uploads", filename);

  fs.writeFileSync(filePath, Buffer.from(buffer));

  console.log("✅ Image saved at:", filePath);
  return filePath;
};

// ✅ Incoming messages
webhookRoutes.post("/webhook", async (req, res) => {
  try {
    console.log("📩 Incoming webhook:");
    console.log(JSON.stringify(req.body, null, 2));

    const message =
      req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (!message) return res.sendStatus(200);

    // 💬 TEXT MESSAGE
    if (message.type === "text") {
      const text = message.text.body;
      console.log("💬 Text:", text);
    }

    // 📸 IMAGE MESSAGE
    if (message.type === "image") {
      const imageId = message.image.id;

      console.log("📸 Image received, ID:", imageId);

      // Step 1: Get media URL
      const imageUrl = await getMediaUrl(imageId);
      console.log("🔗 Image URL:", imageUrl); // running 

      // Step 2: Download image
      const fileName = `image_${Date.now()}.jpg`;
      const filePath = await downloadImage(imageUrl, fileName);
      console.log("Image downloaded ") // running 

      const extractedText = await extractTextFromImage(filePath);
      console.log("🧾 Extracted Text:\n", extractedText);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Error handling webhook:", error);
    res.sendStatus(500);
  }
});

export default webhookRoutes;