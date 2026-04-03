import fetch from "node-fetch";
import fs from "fs";
import path from "path";

const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN as string;

export const getMediaUrl = async (mediaId: string) => {
  const res = await fetch(
    `https://graph.facebook.com/v20.0/${mediaId}`,
    {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
    }
  );

  const data = await res.json();
  console.log("got media url ")
  return data.url;
};

export const downloadImage = async (url: string, filename: string) => {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
  });

  const buffer = await res.arrayBuffer();

  const filePath = path.join(__dirname, "../../uploads", filename);

  fs.writeFileSync(filePath, Buffer.from(buffer));

  console.log("Image downloaded ")

  return filePath; ``
};