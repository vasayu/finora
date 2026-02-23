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
        const userId = req.user.role === 'SUPER_ADMIN' ? undefined : req.user.id;
        const transactions = await this.txService.getTransactions(organizationId, userId);
        res.status(200).json({ status: 'success', data: { transactions } });
    });
}
exports.TransactionsController = TransactionsController;
