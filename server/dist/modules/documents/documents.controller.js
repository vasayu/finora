"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsController = void 0;
const documents_service_1 = require("./documents.service");
const catchAsync_1 = require("../../utils/catchAsync");
class DocumentsController {
    docsService;
    constructor() {
        this.docsService = new documents_service_1.DocumentsService();
    }
    uploadDocument = (0, catchAsync_1.catchAsync)(async (req, res) => {
        if (!req.file) {
            throw { statusCode: 400, message: 'No file uploaded' };
        }
        const { organizationId } = req.body;
        // req.user is populated by protect middleware
        const document = await this.docsService.processUpload(req.file, req.user.id, organizationId);
        res.status(201).json({ status: 'success', data: { document } });
    });
    getDocuments = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const userId = req.user.role === 'SUPER_ADMIN' ? undefined : req.user.id;
        const documents = await this.docsService.getDocuments(userId);
        res.status(200).json({ status: 'success', data: { documents } });
    });
    getDocument = (0, catchAsync_1.catchAsync)(async (req, res) => {
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
exports.DocumentsController = DocumentsController;
