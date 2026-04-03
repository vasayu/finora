import { DocumentsRepository } from './documents.repository';
import path from 'path';
import fs from 'fs';
import logger from '../../utils/logger';
import axios from 'axios';
import FormData from 'form-data';
import { env } from '../../config/env';
import ExcelJS, { Row } from 'exceljs';
import { prisma } from '../../config/database';

const RAG_SERVICE_URL = env.RAG_SERVICE_URL || 'http://localhost:4000';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Excel MIME types to detect spreadsheet uploads
const EXCEL_MIME_TYPES = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel',                                          // .xls
    'application/octet-stream',                                          // generic binary (often used for xlsx)
];

const EXCEL_EXTENSIONS = ['.xlsx', '.xls'];

export class DocumentsService {
    private repository: DocumentsRepository;

    constructor() {
        this.repository = new DocumentsRepository();
    }

    /**
     * Detect whether the uploaded file is an Excel spreadsheet
     */
    private isExcelFile(file: Express.Multer.File): boolean {
        const ext = path.extname(file.originalname).toLowerCase();
        return EXCEL_EXTENSIONS.includes(ext) || EXCEL_MIME_TYPES.includes(file.mimetype);
    }

    /**
     * Parse an Excel buffer and extract transaction rows.
     * Expected columns (by position): Date, Type, Category, Description, Amount
     * The first row is treated as a header and skipped.
     */
    private async parseExcelTransactions(
        buffer: Buffer,
        userId: string,
        organizationId?: string
    ): Promise<{ transactions: any[]; errors: string[] }> {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer);
        const sheet = workbook.worksheets[0];

        if (!sheet) {
            return { transactions: [], errors: ['Excel file has no worksheets'] };
        }

        // Try to detect column mapping from the header row
        const headerRow = sheet.getRow(1);
        const columnMap = this.detectColumnMap(headerRow);

        const transactions: any[] = [];
        const errors: string[] = [];

        sheet.eachRow((row: Row, rowNumber: number) => {
            if (rowNumber === 1) return; // Skip header

            try {
                const dateVal = row.getCell(columnMap.date).value;
                const typeVal = row.getCell(columnMap.type).value?.toString().toUpperCase().trim();
                const categoryVal = row.getCell(columnMap.category).value?.toString()?.trim() || 'General';
                const descriptionVal = row.getCell(columnMap.description).value?.toString()?.trim() || '';
                const amountVal = row.getCell(columnMap.amount).value;

                // Skip completely empty rows
                if (!dateVal && !amountVal && !typeVal) return;

                // Validate amount
                if (!amountVal || isNaN(Number(amountVal))) {
                    errors.push(`Row ${rowNumber}: Invalid amount "${amountVal}"`);
                    return;
                }

                // Validate type — default to EXPENSE if not recognised
                let resolvedType = typeVal;
                if (resolvedType !== 'INCOME' && resolvedType !== 'EXPENSE') {
                    // Try to infer from common labels
                    if (resolvedType && ['CREDIT', 'CR', 'REVENUE', 'DEPOSIT', 'INFLOW'].includes(resolvedType)) {
                        resolvedType = 'INCOME';
                    } else {
                        resolvedType = 'EXPENSE';
                    }
                }

                // Parse date
                let parsedDate = new Date();
                if (dateVal) {
                    parsedDate = dateVal instanceof Date ? dateVal : new Date(dateVal.toString());
                    if (isNaN(parsedDate.getTime())) {
                        errors.push(`Row ${rowNumber}: Invalid date format "${dateVal}"`);
                        return;
                    }
                }

                transactions.push({
                    userId,
                    organizationId: organizationId || null,
                    amount: Math.abs(Number(amountVal)),
                    currency: 'USD',
                    type: resolvedType,
                    category: categoryVal,
                    description: descriptionVal,
                    date: parsedDate,
                });
            } catch (err: any) {
                errors.push(`Row ${rowNumber}: ${err.message}`);
            }
        });

        return { transactions, errors };
    }

    /**
     * Detect column positions from the header row.
     * Supports flexible header names — falls back to positional defaults:
     *   1=Date, 2=Type, 3=Category, 4=Description, 5=Amount
     */
    private detectColumnMap(headerRow: Row): { date: number; type: number; category: number; description: number; amount: number } {
        const defaultMap = { date: 1, type: 2, category: 3, description: 4, amount: 5 };

        if (!headerRow) return defaultMap;

        const map: any = {};
        headerRow.eachCell((cell, colNumber) => {
            const header = cell.value?.toString().toLowerCase().trim() || '';
            if (header.includes('date')) map.date = colNumber;
            else if (header.includes('type') || header.includes('tx')) map.type = colNumber;
            else if (header.includes('category') || header.includes('cat')) map.category = colNumber;
            else if (header.includes('description') || header.includes('desc') || header.includes('note') || header.includes('memo')) map.description = colNumber;
            else if (header.includes('amount') || header.includes('value') || header.includes('sum') || header.includes('total')) map.amount = colNumber;
        });

        return { ...defaultMap, ...map };
    }

    /**
     * Evaluate whether expenses exceed 50% of income and create/clear alerts
     */
    private async evaluateExpenseAlert(userId: string, organizationId?: string) {
        const txWhere: any = organizationId ? { organizationId } : { userId };
        const allTx = await prisma.transaction.findMany({ where: txWhere });

        let totalIncome = 0;
        let totalExpense = 0;

        for (const tx of allTx) {
            if (tx.type === 'INCOME') totalIncome += tx.amount;
            if (tx.type === 'EXPENSE') totalExpense += tx.amount;
        }

        const isHighExpense = totalIncome > 0 && totalExpense > (0.5 * totalIncome);

        if (isHighExpense) {
            const existingAlert = await prisma.alert.findFirst({
                where: {
                    userId,
                    type: 'HIGH_EXPENSE',
                    createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
                }
            });

            if (!existingAlert) {
                const percentage = Math.round((totalExpense / totalIncome) * 100);
                await prisma.alert.create({
                    data: {
                        userId,
                        type: 'HIGH_EXPENSE',
                        message: `Warning: Your expenses (${percentage}%) have exceeded 50% of your total income.`,
                    }
                });
            }
        } else {
            await prisma.alert.deleteMany({
                where: { userId, type: 'HIGH_EXPENSE' }
            });
        }
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

        // ── Excel → Transactions extraction ─────────────────────────────
        // If the uploaded file is an Excel spreadsheet, parse rows as
        // transactions (Date, Type, Category, Description, Amount) and
        // bulk-insert them into the Transaction table.
        if (this.isExcelFile(file)) {
            try {
                logger.info(`Excel file detected (${file.originalname}), extracting transactions...`);

                const { transactions, errors } = await this.parseExcelTransactions(
                    file.buffer,
                    userId,
                    organizationId
                );

                if (transactions.length > 0) {
                    const result = await prisma.$transaction(async (tx) => {
                        return await tx.transaction.createMany({
                            data: transactions,
                            skipDuplicates: false,
                        });
                    });

                    logger.info(`Imported ${result.count} transactions from document ${document.id}`);

                    // Update the document record with extraction summary
                    await this.repository.updateDocumentStatus(document.id, 'COMPLETED', {
                        transactionsImported: result.count,
                        transactionErrors: errors,
                        importedAt: new Date().toISOString(),
                    });

                    // Trigger expense alert evaluation
                    await this.evaluateExpenseAlert(userId, organizationId);
                } else {
                    const msg = errors.length > 0
                        ? `No valid transactions found. Errors: ${errors.join('; ')}`
                        : 'No transaction rows found in the spreadsheet.';
                    logger.warn(`Document ${document.id}: ${msg}`);

                    await this.repository.updateDocumentStatus(document.id, 'COMPLETED', {
                        transactionsImported: 0,
                        transactionErrors: errors,
                        message: msg,
                    });
                }
            } catch (err: any) {
                logger.error(`Excel transaction extraction failed for doc ${document.id}: ${err.message}`);
                await this.repository.updateDocumentStatus(document.id, 'FAILED', {
                    error: err.message,
                });
            }
        }

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
                // Only mark COMPLETED if not already set by Excel extraction
                const doc = await this.repository.getDocumentById(document.id);
                if (doc?.status === 'PENDING') {
                    await this.repository.updateDocumentStatus(document.id, 'COMPLETED');
                }
            } else {
                // Only mark FAILED if nothing else has already completed it
                const doc = await this.repository.getDocumentById(document.id);
                if (doc?.status === 'PENDING') {
                    await this.repository.updateDocumentStatus(document.id, 'FAILED');
                }
                logger.error(`RAG auto-ingest failed with status ${res.status} for doc ${document.id}`);
            }
        }).catch(async (err) => {
            // Only mark FAILED if nothing else has already completed it
            const doc = await this.repository.getDocumentById(document.id);
            if (doc?.status === 'PENDING') {
                await this.repository.updateDocumentStatus(document.id, 'FAILED');
            }
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
