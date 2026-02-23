"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const error_middleware_1 = require("./middleware/error.middleware");
const logger_1 = __importDefault(require("./utils/logger"));
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const users_routes_1 = __importDefault(require("./modules/users/users.routes"));
const organizations_routes_1 = __importDefault(require("./modules/organizations/organizations.routes"));
const documents_routes_1 = __importDefault(require("./modules/documents/documents.routes"));
const transactions_routes_1 = __importDefault(require("./modules/transactions/transactions.routes"));
const financials_routes_1 = __importDefault(require("./modules/financials/financials.routes"));
const dashboard_routes_1 = __importDefault(require("./modules/dashboard/dashboard.routes"));
const alerts_routes_1 = __importDefault(require("./modules/alerts/alerts.routes"));
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use((0, morgan_1.default)(morganFormat, {
    stream: { write: (message) => logger_1.default.info(message.trim()) },
}));
// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime() });
});
// API Routes
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/users', users_routes_1.default);
app.use('/api/v1/organizations', organizations_routes_1.default);
app.use('/api/v1/documents', documents_routes_1.default);
app.use('/api/v1/transactions', transactions_routes_1.default);
app.use('/api/v1/financials', financials_routes_1.default);
app.use('/api/v1/dashboard', dashboard_routes_1.default);
app.use('/api/v1/alerts', alerts_routes_1.default);
// Global Error Handler
app.use(error_middleware_1.errorHandler);
exports.default = app;
