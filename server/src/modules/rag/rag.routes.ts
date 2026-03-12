/**
 * rag.routes.ts — Express proxy routes for the Python RAG microservice.
 *
 * All requests are protected by the existing JWT middleware.
 * The user_id is always taken from the verified JWT (req.user.id),
 * never from the client request body — this is the security guarantee.
 */

import { Router, Request, Response } from 'express';
import { protect } from '../../middleware/auth.middleware';

const router = Router();

const RAG_SERVICE_URL = process.env.RAG_SERVICE_URL || 'http://127.0.0.1:8000';

// ── Chat ──────────────────────────────────────────────────────────────────────
router.post('/chat', protect, async (req: Request, res: Response) => {
    try {
        const { message, session_id } = req.body;

        if (!message || !session_id) {
            return res.status(400).json({ message: 'message and session_id are required' });
        }

        const ragRes = await fetch(`${RAG_SERVICE_URL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: req.user!.id,   // Always from JWT — client cannot override
                message,
                session_id,
            }),
        });

        if (!ragRes.ok) {
            const errorText = await ragRes.text();
            console.error(`RAG Chat Error (${ragRes.status}):`, errorText);
            return res.status(ragRes.status).json({ message: 'RAG error', detail: errorText });
        }

        const data = await ragRes.json();
        return res.status(ragRes.status).json(data);
    } catch (err: any) {
        console.error("RAG proxy crash:", err);
        return res.status(502).json({ message: 'RAG service unavailable', detail: err.message });
    }
});

// ── Clear session ─────────────────────────────────────────────────────────────
router.post('/chat/clear', protect, async (req: Request, res: Response) => {
    try {
        const { session_id } = req.body;
        const ragRes = await fetch(`${RAG_SERVICE_URL}/chat/clear`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id }),
        });
        const data = await ragRes.json();
        return res.status(ragRes.status).json(data);
    } catch (err: any) {
        return res.status(502).json({ message: 'RAG service unavailable', detail: err.message });
    }
});

// ── Manual ingest trigger ─────────────────────────────────────────────────────
router.post('/ingest', protect, async (req: Request, res: Response) => {
    try {
        const { document_id, file_path, file_name, organization_id } = req.body;

        const ragRes = await fetch(`${RAG_SERVICE_URL}/ingest`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: req.user!.id,
                document_id,
                file_path,
                file_name,
                organization_id: organization_id || null,
            }),
        });

        const data = await ragRes.json();
        return res.status(ragRes.status).json(data);
    } catch (err: any) {
        return res.status(502).json({ message: 'RAG service unavailable', detail: err.message });
    }
});

// ── Index stats (admin) ───────────────────────────────────────────────────────
router.get('/stats', protect, async (req: Request, res: Response) => {
    try {
        const ragRes = await fetch(`${RAG_SERVICE_URL}/ingest/stats/${req.user!.id}`);
        const data = await ragRes.json();
        return res.status(ragRes.status).json(data);
    } catch (err: any) {
        return res.status(502).json({ message: 'RAG service unavailable', detail: err.message });
    }
});

export default router;
