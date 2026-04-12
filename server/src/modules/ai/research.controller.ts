import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import http from 'http';
import logger from '../../utils/logger';

const N8N_WEBHOOK =  'http://n8n:5678/webhook/4d0b9345-fe0b-441d-9933-57f6bc7818b8'

function httpPost(url: string, payload: unknown): Promise<unknown> {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify(payload);
        const parsed = new URL(url);

        const options: http.RequestOptions = {
            hostname: parsed.hostname,
            port: parseInt(parsed.port || '80'),
            path: parsed.pathname + parsed.search,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body),
                'Accept': 'application/json',
            },
            timeout: 90_000,
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.setEncoding('utf8');
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                logger.info(`[research] n8n status: ${res.statusCode}, body length: ${data.length}`);
                try {
                    resolve(JSON.parse(data));
                } catch {
                    reject(new Error(`n8n non-JSON response (${res.statusCode}): ${data.slice(0, 300)}`));
                }
            });
        });

        req.on('timeout', () => { req.destroy(); reject(new Error('n8n request timed out')); });
        req.on('error', (e) => reject(new Error(`n8n connection error: ${e.message}`)));
        req.write(body);
        req.end();
    });
}

function normaliseResponse(raw: unknown): object {
    let result: Record<string, unknown> = {};

    if (Array.isArray(raw)) {
        result = (raw[0] as Record<string, unknown>) ?? {};
    } else if (raw && typeof raw === 'object') {
        const r = raw as Record<string, unknown>;
        if (r.output) {
            const out = r.output;
            result = Array.isArray(out) ? (out[0] as Record<string, unknown>) ?? {} : out as Record<string, unknown>;
        } else {
            result = r;
        }
    }

    return {
        news: Array.isArray(result?.news) ? result.news : [],
        alpha_signals: Array.isArray(result?.alpha_signals) ? result.alpha_signals : [],
        macro: Array.isArray(result?.macro) ? result.macro : [],
        summary: typeof result?.summary === 'string' ? result.summary : '',
    };
}

export class ResearchController {
    research = catchAsync(async (req: Request, res: Response) => {
        const { description } = req.body;

        if (!description || typeof description !== 'string' || !description.trim()) {
            return res.status(400).json({ status: 'error', message: 'description is required' });
        }

        logger.info(`[research] Calling n8n for: ${description.slice(0, 80)}...`);

        const raw = await httpPost(N8N_WEBHOOK, { description });
        logger.info(`[research] Raw: ${JSON.stringify(raw).slice(0, 200)}`);

        const data = normaliseResponse(raw);
        res.status(200).json({ status: 'success', data });
    });
}
