import { DocumentsRepository } from './documents.repository';
import path from 'path';
import fs from 'fs';
import logger from '../../utils/logger';
import axios from 'axios';
import FormData from 'form-data';
import { env } from '../../config/env';

const RAG_SERVICE_URL = env.RAG_SERVICE_URL || 'http://localhost:4000';

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
        // Save file locally for RAG processing
        const uniqueName = `${Date.now()}-${file.originalname}`;
        const filePath = path.join(UPLOAD_DIR, uniqueName);
        fs.writeFileSync(filePath, file.buffer);
        
        // Upload to Pinata IPFS
        let fileUrl = `/uploads/${uniqueName}`;
        try {
            const formData = new FormData();
            formData.append('file', file.buffer, file.originalname);

            const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
                headers: {
                    'pinata_api_key': env.PINATA_APIKEY,
                    'pinata_secret_api_key': env.PINATA_SECRETKEY,
                    ...formData.getHeaders()
                }
            });
            const ipfsHash = response.data.IpfsHash;
            fileUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
            logger.info(`Uploaded document to IPFS: ${ipfsHash}`);
        } catch (error: any) {
            logger.error(`Pinata IPFS upload failed: ${error?.response?.data?.error?.details || error.message}`);
            // Fallback to local URL is kept
        }

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
        }).then(async (res) => {
            if (res.ok) {
                await this.repository.updateDocumentStatus(document.id, 'COMPLETED');
            } else {
                await this.repository.updateDocumentStatus(document.id, 'FAILED');
                logger.error(`RAG auto-ingest failed with status ${res.status} for doc ${document.id}`);
            }
        }).catch((err) => {
            this.repository.updateDocumentStatus(document.id, 'FAILED');
            logger.error(`RAG auto-ingest crashed for doc ${document.id}: ${err.message}`);
        });

        return document;
    }

    async getDocument(id: string) {
        return this.repository.getDocumentById(id);
    }

    async getDocuments(userId?: string) {
        return this.repository.getAllDocuments(userId);
    }
}
