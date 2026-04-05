import { NextRequest, NextResponse } from 'next/server';

const N8N_WEBHOOK =
    process.env.N8N_WEBHOOK_URL ||
    'http://localhost:5678/webhook/4d0b9345-fe0b-441d-9933-57f6bc7818b8';

// ─── Response normaliser ──────────────────────────────────────────────────────
// Handles every shape n8n might return:
//   • Raw object  { news, alpha_signals, macro, summary }
//   • Array       [{ news, alpha_signals, macro, summary }]
//   • Wrapped     { output: { ... } }  or  { output: [{ ... }] }

function normalise(raw: unknown) {
    let result: Record<string, unknown> = {};

    if (Array.isArray(raw)) {
        result = (raw[0] as Record<string, unknown>) ?? {};
    } else if (raw && typeof raw === 'object') {
        const r = raw as Record<string, unknown>;
        if (r.output) {
            const out = r.output;
            result = Array.isArray(out)
                ? (out[0] as Record<string, unknown>) ?? {}
                : (out as Record<string, unknown>);
        } else {
            result = r;
        }
    }

    return {
        news:          Array.isArray(result.news)          ? result.news          : [],
        alpha_signals: Array.isArray(result.alpha_signals) ? result.alpha_signals : [],
        macro:         Array.isArray(result.macro)         ? result.macro         : [],
        summary:       typeof result.summary === 'string'  ? result.summary       : '',
    };
}

// ─── POST /api/research ───────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { company_description } = body;

        if (!company_description || typeof company_description !== 'string' || !company_description.trim()) {
            return NextResponse.json(
                { error: 'company_description is required' },
                { status: 400 }
            );
        }

        console.log(`[research] → n8n  company: "${company_description.slice(0, 80)}..."`);
        console.log(`[research] → n8n  url: ${N8N_WEBHOOK}`);

        const n8nRes = await fetch(N8N_WEBHOOK, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({ company_description }),
            // Next.js 14+ — bypass cache entirely for live data
            cache: 'no-store',
            signal: AbortSignal.timeout(90_000),
        });

        const rawText = await n8nRes.text();
        console.log(`[research] ← n8n  status: ${n8nRes.status}, body[0..200]: ${rawText.slice(0, 200)}`);

        if (!n8nRes.ok) {
            return NextResponse.json(
                { error: `n8n returned ${n8nRes.status}`, details: rawText.slice(0, 300) },
                { status: 502 }
            );
        }

        let rawJson: unknown;
        try {
            rawJson = JSON.parse(rawText);
        } catch {
            return NextResponse.json(
                { error: 'n8n returned non-JSON', details: rawText.slice(0, 300) },
                { status: 502 }
            );
        }

        const data = normalise(rawJson);

        // Guard: at least one field must have content
        if (!data.news.length && !data.alpha_signals.length && !data.macro.length && !data.summary) {
            return NextResponse.json(
                { error: 'n8n workflow returned an empty response — check your workflow is active and returning data.' },
                { status: 502 }
            );
        }

        console.log(`[research] ✓  news:${data.news.length} signals:${data.alpha_signals.length} macro:${data.macro.length}`);

        // Return the FLAT shape the frontend expects:
        // { news, alpha_signals, macro, summary }
        return NextResponse.json(data);

    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        const isRefused = message.includes('ECONNREFUSED') || message.includes('fetch failed');

        console.error('[research] ✗ error:', message);

        return NextResponse.json(
            {
                error: isRefused
                    ? 'Cannot reach n8n — make sure n8n is running on port 5678 and the webhook is active (use /webhook/, not /webhook-test/).'
                    : 'Internal server error',
                details: message,
            },
            { status: 500 }
        );
    }
}
