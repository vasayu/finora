"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsService = void 0;
const transactions_repository_1 = require("./transactions.repository");
const rabbitmq_1 = require("../../config/rabbitmq");
class TransactionsService {
    repository;
    constructor() {
        this.repository = new transactions_repository_1.TransactionsRepository();
    }
    async createTransaction(userId, data) {
        const transaction = await this.repository.createTransaction({
            amount: data.amount,
            currency: data.currency || 'USD',
            type: data.type,
            category: data.category,
            date: data.date ? new Date(data.date) : new Date(),
            description: data.description,
            user: { connect: { id: userId } },
            ...(data.organizationId && { organization: { connect: { id: data.organizationId } } })
        });
        // Fire alert checks asynchronously
        if (data.type === 'EXPENSE' && data.amount > 10000) {
            await (0, rabbitmq_1.publishToQueue)('alert_notifications', {
                type: 'LARGE_EXPENSE',
                message: `A large expense of ${data.amount} ${data.currency} was recorded.`,
                userId,
            });
        }
        return transaction;
    }
    async getTransaction(id) {
        return this.repository.findById(id);
    }
    async getTransactions(organizationId, userId) {
        return this.repository.findAll(organizationId, userId);
    }
}
exports.TransactionsService = TransactionsService;
