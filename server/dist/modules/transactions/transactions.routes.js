"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const transactions_controller_1 = require("./transactions.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
const txController = new transactions_controller_1.TransactionsController();
// Use memory storage for Excel parsing
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
router.use(auth_middleware_1.protect);
router.get('/import/template', txController.downloadTemplate);
router.post('/import/upload', upload.single('file'), txController.importTransactions);
router.post('/', txController.createTransaction);
router.get('/', txController.getTransactions);
router.put('/:id', txController.updateTransaction);
router.delete('/:id', txController.deleteTransaction);
exports.default = router;
