"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const watchlist_controller_1 = require("./watchlist.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.protect);
// Personal watchlist
router.get('/', watchlist_controller_1.getUserWatchlist);
router.post('/', watchlist_controller_1.addToUserWatchlist);
router.delete('/:symbol', watchlist_controller_1.removeFromUserWatchlist);
// Organization watchlist
router.get('/org', watchlist_controller_1.getOrgWatchlist);
router.post('/org', watchlist_controller_1.addToOrgWatchlist);
router.delete('/org/:symbol', watchlist_controller_1.removeFromOrgWatchlist);
exports.default = router;
