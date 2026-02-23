"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
const errorHandler = (err, req, res, next) => {
    let { statusCode, message } = err;
    if (!statusCode) {
        statusCode = 500;
    }
    res.locals.errorMessage = err.message;
    if (process.env.NODE_ENV === 'development') {
        logger_1.default.error(err);
    }
    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message: message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};
exports.errorHandler = errorHandler;
