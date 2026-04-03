"use strict";
/**
 * rag.routes.ts — Express proxy routes for the Python RAG microservice.
 *
 * All requests are protected by the existing JWT middleware.
 * The user_id is always taken from the verified JWT (req.user.id),
 * never from the client request body — this is the security guarantee.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const env_1 = require("../../config/env");
const router = (0, express_1.Router)();
const RAG_SERVICE_URL = env_1.env.RAG_SERVICE_URL;
// ── Chat ──────────────────────────────────────────────────────────────────────
router.post('/chat', auth_middleware_1.protect, async (req, res) => {
    try {
        const { message, session_id } = req.body;
        if (!message || !session_id) {
            return res.status(400).json({ message: 'message and session_id are required' });
        }
        const ragRes = await fetch(`${RAG_SERVICE_URL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: req.user.id, // Always from JWT — client cannot override
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
    }
    catch (err) {
        console.error("RAG proxy crash:", err);
        return res.status(502).json({ message: 'RAG service unavailable', detail: err.message });
    }
});
// ── Clear session ─────────────────────────────────────────────────────────────
router.post('/chat/clear', auth_middleware_1.protect, async (req, res) => {
    try {
        const { session_id } = req.body;
        const ragRes = await fetch(`${RAG_SERVICE_URL}/chat/clear`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id }),
        });
        const data = await ragRes.json();
        return res.status(ragRes.status).json(data);
    }
    catch (err) {
        return res.status(502).json({ message: 'RAG service unavailable', detail: err.message });
    }
});
// ── Manual ingest trigger ─────────────────────────────────────────────────────
router.post('/ingest', auth_middleware_1.protect, async (req, res) => {
    try {
        const { document_id, file_path, file_name, organization_id } = req.body;
        const ragRes = await fetch(`${RAG_SERVICE_URL}/ingest`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: req.user.id,
                document_id,
                file_path,
                file_name,
                organization_id: organization_id || null,
            }),
        });
        const data = await ragRes.json();
        return res.status(ragRes.status).json(data);
    }
    catch (err) {
        return res.status(502).json({ message: 'RAG service unavailable', detail: err.message });
    }
});
// ── Index stats (admin) ───────────────────────────────────────────────────────
router.get('/stats', auth_middleware_1.protect, async (req, res) => {
    try {
        const ragRes = await fetch(`${RAG_SERVICE_URL}/ingest/stats/${req.user.id}`);
        const data = await ragRes.json();
        return res.status(ragRes.status).json(data);
    }
    catch (err) {
        return res.status(502).json({ message: 'RAG service unavailable', detail: err.message });
    }
});
exports.default = router;
