import Tesseract from "tesseract.js";

export const extractTextFromImage = async (filePath: string) => {
  try {
    const result = await Tesseract.recognize(filePath, "eng");
    return result.data.text;
  } catch (error) {
    console.error("OCR Error:", error);
    return "";
  }
};