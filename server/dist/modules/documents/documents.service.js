"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsService = void 0;
const documents_repository_1 = require("./documents.repository");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const logger_1 = __importDefault(require("../../utils/logger"));
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const env_1 = require("../../config/env");
const RAG_SERVICE_URL = env_1.env.RAG_SERVICE_URL || 'http://localhost:4000';
const UPLOAD_DIR = path_1.default.join(process.cwd(), 'uploads');
// Ensure uploads directory exists
if (!fs_1.default.existsSync(UPLOAD_DIR)) {
    fs_1.default.mkdirSync(UPLOAD_DIR, { recursive: true });
}
class DocumentsService {
    repository;
    constructor() {
        this.repository = new documents_repository_1.DocumentsRepository();
    }
    async processUpload(file, userId, organizationId) {
        // Save file locally for RAG processing
        const uniqueName = `${Date.now()}-${file.originalname}`;
        const filePath = path_1.default.join(UPLOAD_DIR, uniqueName);
        fs_1.default.writeFileSync(filePath, file.buffer);
        // Upload to Pinata IPFS
        let fileUrl = `/uploads/${uniqueName}`;
        try {
            const formData = new form_data_1.default();
            formData.append('file', file.buffer, file.originalname);
            // Send explicit metadata so the file name displays properly in the Pinata dashboard
            const pinataMetadata = JSON.stringify({
                name: file.originalname,
            });
            formData.append('pinataMetadata', pinataMetadata);
            const response = await axios_1.default.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
                headers: {
                    'pinata_api_key': env_1.env.PINATA_APIKEY,
                    'pinata_secret_api_key': env_1.env.PINATA_SECRETKEY,
                    ...formData.getHeaders()
                }
            });
            const ipfsHash = response.data.IpfsHash;
            fileUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
            logger_1.default.info(`Uploaded document to IPFS: ${ipfsHash}`);
        }
        catch (error) {
            logger_1.default.error(`Pinata IPFS upload failed: ${error?.response?.data?.error?.details || error.message}`);
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
            }
            else {
                await this.repository.updateDocumentStatus(document.id, 'FAILED');
                logger_1.default.error(`RAG auto-ingest failed with status ${res.status} for doc ${document.id}`);
            }
        }).catch((err) => {
            this.repository.updateDocumentStatus(document.id, 'FAILED');
            logger_1.default.error(`RAG auto-ingest crashed for doc ${document.id}: ${err.message}`);
        });
        return document;
    }
    async getDocument(id) {
        return this.repository.getDocumentById(id);
    }
    async getDocuments(userId) {
        return this.repository.getAllDocuments(userId);
    }
}
exports.DocumentsService = DocumentsService;
