import { DocumentsRepository } from './documents.repository';
import { cloudinary } from '../../config/cloudinary';
import { publishToQueue } from '../../config/rabbitmq';
import { Prisma } from '@prisma/client';
import streamifier from 'streamifier';

export class DocumentsService {
    private repository: DocumentsRepository;

    constructor() {
        this.repository = new DocumentsRepository();
    }

    async uploadToCloudinary(fileBuffer: Buffer, fileName: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const cldStream = cloudinary.uploader.upload_stream(
                { folder: 'finora_documents', resource_type: 'auto', public_id: fileName.split('.')[0] },
                (error, result) => {
                    if (result) {
                        resolve(result.secure_url);
                    } else {
                        reject(error);
                    }
                }
            );
            streamifier.createReadStream(fileBuffer).pipe(cldStream);
        });
    }

    async processUpload(file: Express.Multer.File, userId: string, organizationId?: string) {
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
        await publishToQueue('document_processing', {
            documentId: document.id,
            fileUrl: document.fileUrl,
            userId
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
