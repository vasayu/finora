import { Request, Response } from 'express';
import { DocumentsService } from './documents.service';
import { catchAsync } from '../../utils/catchAsync';

export class DocumentsController {
    private docsService: DocumentsService;

    constructor() {
        this.docsService = new DocumentsService();
    }

    uploadDocument = catchAsync(async (req: Request, res: Response) => {
        if (!req.file) {
            throw { statusCode: 400, message: 'No file uploaded' };
        }

        const { organizationId } = req.body;

        // req.user is populated by protect middleware
        const document = await this.docsService.processUpload(req.file, req.user.id, organizationId);

        res.status(201).json({ status: 'success', data: { document } });
    });

    getDocuments = catchAsync(async (req: Request, res: Response) => {
        const userId = req.user.role === 'SUPER_ADMIN' ? undefined : req.user.id;
        const documents = await this.docsService.getDocuments(userId);
        res.status(200).json({ status: 'success', data: { documents } });
    });

    getDocument = catchAsync(async (req: Request, res: Response) => {
        const document = await this.docsService.getDocument(req.params.id);
        if (!document) {
            throw { statusCode: 404, message: 'Document not found' };
        }

        // Simple ownership check
        if (document.userId !== req.user.id && req.user.role !== 'SUPER_ADMIN') {
            throw { statusCode: 403, message: 'Not authorized to access this document' };
        }

        res.status(200).json({ status: 'success', data: { document } });
    });
}
