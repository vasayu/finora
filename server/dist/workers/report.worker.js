"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../utils/logger"));
const startWorker = async () => {
    logger_1.default.info('[*] Report worker started');
    // Implementing long-running periodic tasks or listening to 'report_generation' queue
    // This is a placeholder for generating async large PDF/Excel reports
};
startWorker();
