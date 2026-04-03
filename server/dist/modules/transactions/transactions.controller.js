"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsController = void 0;
const transactions_service_1 = require("./transactions.service");
const catchAsync_1 = require("../../utils/catchAsync");
class TransactionsController {
    txService;
    constructor() {
        this.txService = new transactions_service_1.TransactionsService();
    }
    createTransaction = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const transaction = await this.txService.createTransaction(req.user.id, req.body);
        res.status(201).json({ status: 'success', data: { transaction } });
    });
    getTransactions = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const { organizationId } = req.query;
        const userId = req.user.role === 'CFO' ? undefined : req.user.id;
        const transactions = await this.txService.getTransactions(organizationId, userId);
        res.status(200).json({ status: 'success', data: { transactions } });
    });
    updateTransaction = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const { id } = req.params;
        const transaction = await this.txService.updateTransaction(id, req.user.id, req.body);
        res.status(200).json({ status: 'success', data: { transaction } });
    });
    deleteTransaction = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const { id } = req.params;
        await this.txService.deleteTransaction(id, req.user.id, req.user.role);
        res.status(204).json({ status: 'success', data: null });
    });
    downloadTemplate = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const workbook = await this.txService.generateTemplate();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=Finora_Transactions_Template.xlsx');
        await workbook.xlsx.write(res);
        res.end();
    });
    importTransactions = (0, catchAsync_1.catchAsync)(async (req, res) => {
        if (!req.file) {
            return res.status(400).json({ status: 'error', message: 'No Excel file uploaded' });
        }
        const { organizationId } = req.body;
        const stats = await this.txService.importTransactions(req.user.id, req.file.buffer, organizationId);
        res.status(200).json({ status: 'success', data: stats });
    });
}
exports.TransactionsController = TransactionsController;
