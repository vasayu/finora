import { TransactionsRepository } from './transactions.repository';

export class TransactionsService {
    private repository: TransactionsRepository;

    constructor() {
        this.repository = new TransactionsRepository();
    }

    async createTransaction(userId: string, data: any) {
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

        return transaction;
    }

    async getTransaction(id: string) {
        return this.repository.findById(id);
    }

    async getTransactions(organizationId?: string, userId?: string) {
        return this.repository.findAll(organizationId, userId);
    }
}
