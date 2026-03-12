import { DocumentsRepository } from './documents.repository';
import path from 'path';
import fs from 'fs';
import logger from '../../utils/logger';

const RAG_SERVICE_URL = process.env.RAG_SERVICE_URL || 'http://localhost:8000';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export class DocumentsService {
    private repository: DocumentsRepository;

    constructor() {
        this.repository = new DocumentsRepository();
    }

    async processUpload(file: Express.Multer.File, userId: string, organizationId?: string) {
        // Save file locally
        const uniqueName = `${Date.now()}-${file.originalname}`;
        const filePath = path.join(UPLOAD_DIR, uniqueName);
        fs.writeFileSync(filePath, file.buffer);
        const fileUrl = `/uploads/${uniqueName}`;

        // Save record to DB
        const document = await this.repository.createDocument({
            fileName: file.originalname,
            fileUrl,
            fileType: file.mimetype,
            user: { connect: { id: userId } },
            ...(organizationId && { organization: { connect: { id: organizationId } } })
        });

        // Fire-and-forget: trigger RAG ingestion (non-blocking — upload responds instantly)
        fetch(`${RAG_SERVICE_URL}/ingest`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: userId,
                document_id: document.id,
                file_path: filePath,
                file_name: file.originalname,
                organization_id: organizationId || null,
            }),
        }).catch((err) => logger.error(`RAG auto-ingest failed for doc ${document.id}: ${err.message}`));

        return document;
    }

    async getDocument(id: string) {
        return this.repository.getDocumentById(id);
    }

    async getDocuments(userId?: string) {
        return this.repository.getAllDocuments(userId);
    }
}
