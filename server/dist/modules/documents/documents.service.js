"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsService = void 0;
const documents_repository_1 = require("./documents.repository");
const cloudinary_1 = require("../../config/cloudinary");
const rabbitmq_1 = require("../../config/rabbitmq");
const streamifier_1 = __importDefault(require("streamifier"));
class DocumentsService {
    repository;
    constructor() {
        this.repository = new documents_repository_1.DocumentsRepository();
    }
    async uploadToCloudinary(fileBuffer, fileName) {
        return new Promise((resolve, reject) => {
            const cldStream = cloudinary_1.cloudinary.uploader.upload_stream({ folder: 'finora_documents', resource_type: 'auto', public_id: fileName.split('.')[0] }, (error, result) => {
                if (result) {
                    resolve(result.secure_url);
                }
                else {
                    reject(error);
                }
            });
            streamifier_1.default.createReadStream(fileBuffer).pipe(cldStream);
        });
    }
    async processUpload(file, userId, organizationId) {
        // 1. Upload to Cloudinary
        const fileUrl = await this.uploadToCloudinary(file.buffer, file.originalname);
        // 2. Save record to DB
        const document = await this.repository.createDocument({
            fileName: file.originalname,
            fileUrl,
            fileType: file.mimetype,
            user: { connect: { id: userId } },
            ...(organizationId && { organization: { connect: { id: organizationId } } })
        });
        // 3. Publish to RabbitMQ
        await (0, rabbitmq_1.publishToQueue)('document_processing', {
            documentId: document.id,
            fileUrl: document.fileUrl,
            userId
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
