/**
 * rag.routes.ts — Express proxy routes for the Python RAG microservice.
 *
 * All requests are protected by the existing JWT middleware.
 * The user_id is always taken from the verified JWT (req.user.id),
 * never from the client request body — this is the security guarantee.
 */

import { Router, Request, Response } from 'express';
import { protect } from '../../middleware/auth.middleware';
import { env } from '../../config/env';

const router = Router();

const RAG_SERVICE_URL = env.RAG_SERVICE_URL;        // original rag-service (port 8000)
const AGENTIC_RAG_URL = process.env.AGENTIC_RAG_URL || 'http://agentic-rag:8001';

// ── Chat (→ Agentic RAG / LangGraph) ─────────────────────────────────────────
router.post('/chat', protect, async (req: Request, res: Response) => {
    try {
        const { message, session_id } = req.body;

        if (!message || !session_id) {
            return res.status(400).json({ message: 'message and session_id are required' });
        }

        const ragRes = await fetch(`${AGENTIC_RAG_URL}/chat`, {
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
            console.error(`Agentic RAG Chat Error (${ragRes.status}):`, errorText);
            return res.status(ragRes.status).json({ message: 'RAG error', detail: errorText });
        }

        const data = await ragRes.json();
        return res.status(200).json(data);
    } catch (err: any) {
        console.error('Agentic RAG proxy crash:', err);
        return res.status(502).json({ message: 'Agentic RAG service unavailable', detail: err.message });
    }
});

// ── HITL Resume ───────────────────────────────────────────────────────────────
router.post('/hitl/resume', protect, async (req: Request, res: Response) => {
    try {
        const { session_id, approved, choice, interrupt_type } = req.body;

        // Accept new 'choice' string OR legacy 'approved' boolean
        if (!session_id || (choice === undefined && approved === undefined)) {
            return res.status(400).json({ message: 'session_id and either choice or approved are required' });
        }

        const ragRes = await fetch(`${AGENTIC_RAG_URL}/hitl/resume`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                session_id,
                // Forward both: Python side prefers 'choice', falls back to 'approved'
                choice: choice ?? (approved === true ? 'yes' : 'no'),
                interrupt_type: interrupt_type ?? 'large_transaction',
                approved,  // kept for backward compat
            }),
        });

        if (!ragRes.ok) {
            const errorText = await ragRes.text();
            console.error(`Agentic RAG HITL Error (${ragRes.status}):`, errorText);
            return res.status(ragRes.status).json({ message: 'RAG error', detail: errorText });
        }

        const data = await ragRes.json();
        return res.status(200).json(data);
    } catch (err: any) {
        console.error('Agentic RAG proxy crash (HITL):', err);
        return res.status(502).json({ message: 'Agentic RAG service unavailable', detail: err.message });
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

        const ragRes = await fetch(`${AGENTIC_RAG_URL}/ingest/sql`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: req.user!.id,
                // The new SQL ingest assumes connection from settings, 
                // but we pass user_id for isolation.
            }),
        });

        const data = await ragRes.json();
        return res.status(ragRes.status).json(data);
    } catch (err: any) {
        return res.status(502).json({ message: 'Agentic RAG service unavailable', detail: err.message });
    }
});

// ── Index stats (admin) ───────────────────────────────────────────────────────
router.get('/stats', protect, async (req: Request, res: Response) => {
    try {
        // Updated to use the health or a new stats endpoint if we add one, 
        // for now just return health of agentic-rag
        const ragRes = await fetch(`${AGENTIC_RAG_URL}/health`);
        const data = await ragRes.json();
        return res.status(ragRes.status).json(data);
    } catch (err: any) {
        return res.status(502).json({ message: 'Agentic RAG service unavailable', detail: err.message });
    }
});

export default router;
