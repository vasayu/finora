"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// server/src/modules/stocks/stocks.routes.ts
const express_1 = require("express");
const stocks_controller_1 = require("./stocks.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Define stock trading terminal endpoints (protected by user auth)
router.use(auth_middleware_1.protect);
router.get('/search', stocks_controller_1.searchStocks);
router.get('/history', stocks_controller_1.getHistory);
router.post('/predict', stocks_controller_1.getPrediction);
router.get('/realtime', stocks_controller_1.getRealtime);
exports.default = router;
