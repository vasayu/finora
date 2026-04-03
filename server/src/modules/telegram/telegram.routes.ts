import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import logger from '../../utils/logger';

const router = Router();

// ── Config ──────────────────────────────────────────────────────────
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

// Store images inside server/uploads/telegram/
const TELEGRAM_UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'telegram');
if (!fs.existsSync(TELEGRAM_UPLOAD_DIR)) {
    fs.mkdirSync(TELEGRAM_UPLOAD_DIR, { recursive: true });
}

// ── Helpers ─────────────────────────────────────────────────────────

/**
 * Get file path from Telegram API using file_id
 */
const getTelegramFilePath = async (fileId: string): Promise<string> => {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`);
    const data: any = await res.json();
    if (!data.ok) throw new Error(`Telegram getFile failed: ${data.description}`);
    return data.result.file_path;
};

/**
 * Download a file from Telegram and save it locally
 */
const downloadTelegramFile = async (filePath: string, localName: string): Promise<string> => {
    const url = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;
    const res = await fetch(url);
    const buffer = await res.arrayBuffer();

    const savePath = path.join(TELEGRAM_UPLOAD_DIR, localName);
    fs.writeFileSync(savePath, Buffer.from(buffer));

    logger.info(`📸 Telegram image saved: ${savePath}`);
    return savePath;
};

// ── Webhook endpoint (Telegram sends updates here) ──────────────────

router.post('/webhook', async (req: Request, res: Response) => {
    console.log("🔥 TELEGRAM WEBHOOK HIT");
    try {
        const message = req.body?.message;
        if (!message) {
            return res.sendStatus(200);
        }

        const chatId = message.chat?.id;
        const from = message.from?.username || message.from?.first_name || 'unknown';

        // Handle photo messages
        if (message.photo && message.photo.length > 0) {
            // Telegram sends multiple sizes; grab the highest resolution (last element)
            const bestPhoto = message.photo[message.photo.length - 1];
            const fileId = bestPhoto.file_id;

            logger.info(`📩 Telegram image from @${from} (chat ${chatId}), file_id: ${fileId}`);

            // Step 1: Get file path from Telegram
            const telegramFilePath = await getTelegramFilePath(fileId);

            // Step 2: Download and save locally
            const ext = path.extname(telegramFilePath) || '.jpg';
            const localFileName = `tg_${chatId}_${Date.now()}${ext}`;
            const savedPath = await downloadTelegramFile(telegramFilePath, localFileName);

            // Step 3: Send confirmation back to user
            const caption = message.caption || '';
            logger.info(`✅ Stored telegram image: ${localFileName} (caption: "${caption}")`);

            // Respond to the sender (optional — sends a reply message)
            if (BOT_TOKEN) {
                await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text: `✅ Image received and saved!\nFile: ${localFileName}${caption ? `\nCaption: ${caption}` : ''}`,
                    }),
                });
            }

            return res.sendStatus(200);
        }

        // Handle document (file) messages — in case images are sent as files
        if (message.document) {
            const mime = message.document.mime_type || '';
            if (mime.startsWith('image/')) {
                const fileId = message.document.file_id;
                const originalName = message.document.file_name || `file_${Date.now()}`;

                logger.info(`📩 Telegram document-image from @${from}, file: ${originalName}`);

                const telegramFilePath = await getTelegramFilePath(fileId);
                const ext = path.extname(originalName) || path.extname(telegramFilePath) || '.jpg';
                const localFileName = `tg_${chatId}_${Date.now()}${ext}`;
                await downloadTelegramFile(telegramFilePath, localFileName);

                if (BOT_TOKEN) {
                    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            chat_id: chatId,
                            text: `✅ Image file received and saved!\nFile: ${localFileName}`,
                        }),
                    });
                }

                return res.sendStatus(200);
            }
        }

        // Handle text messages — just log them
        if (message.text) {
            logger.info(`💬 Telegram text from @${from}: ${message.text}`);
        }

        res.sendStatus(200);
    } catch (error: any) {
        logger.error(`❌ Telegram webhook error: ${error.message}`);
        // Always return 200 to Telegram to prevent retries
        res.sendStatus(200);
    }
});

// ── GET: List all stored Telegram images ────────────────────────────

router.get('/images', (req: Request, res: Response) => {
    try {
        if (!fs.existsSync(TELEGRAM_UPLOAD_DIR)) {
            return res.json({ status: 'success', data: { images: [] } });
        }

        const files = fs.readdirSync(TELEGRAM_UPLOAD_DIR)
            .filter((f) => /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(f))
            .map((f) => {
                const stats = fs.statSync(path.join(TELEGRAM_UPLOAD_DIR, f));
                return {
                    fileName: f,
                    path: `/uploads/telegram/${f}`,
                    size: stats.size,
                    createdAt: stats.birthtime,
                };
            })
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        res.json({ status: 'success', data: { images: files, count: files.length } });
    } catch (error: any) {
        logger.error(`Failed to list telegram images: ${error.message}`);
        res.status(500).json({ status: 'error', message: 'Failed to list images' });
    }
});

// ── GET: Serve a specific image ─────────────────────────────────────

router.get('/images/:filename', (req: Request, res: Response) => {
    const { filename } = req.params;
    const filePath = path.join(TELEGRAM_UPLOAD_DIR, filename);

    // Prevent directory traversal
    if (!filePath.startsWith(TELEGRAM_UPLOAD_DIR)) {
        return res.status(403).json({ status: 'error', message: 'Access denied' });
    }

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ status: 'error', message: 'Image not found' });
    }

    res.sendFile(filePath);
});

// ── DELETE: Remove a specific image ─────────────────────────────────

router.delete('/images/:filename', (req: Request, res: Response) => {
    const { filename } = req.params;
    const filePath = path.join(TELEGRAM_UPLOAD_DIR, filename);

    // Prevent directory traversal
    if (!filePath.startsWith(TELEGRAM_UPLOAD_DIR)) {
        return res.status(403).json({ status: 'error', message: 'Access denied' });
    }

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ status: 'error', message: 'Image not found' });
    }

    try {
        fs.unlinkSync(filePath);
        logger.info(`🗑️ Deleted telegram image: ${filename}`);
        res.json({ status: 'success', message: 'Image deleted successfully' });
    } catch (error: any) {
        logger.error(`❌ Failed to delete telegram image ${filename}: ${error.message}`);
        res.status(500).json({ status: 'error', message: 'Failed to delete image' });
    }
});

export default router;
