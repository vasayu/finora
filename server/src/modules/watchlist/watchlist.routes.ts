import { Router } from 'express';
import {
    getUserWatchlist,
    addToUserWatchlist,
    removeFromUserWatchlist,
    getOrgWatchlist,
    addToOrgWatchlist,
    removeFromOrgWatchlist,
} from './watchlist.controller';
import { protect } from '../../middleware/auth.middleware';

const router = Router();

router.use(protect);

// Personal watchlist
router.get('/', getUserWatchlist);
router.post('/', addToUserWatchlist);
router.delete('/:symbol', removeFromUserWatchlist);

// Organization watchlist
router.get('/org', getOrgWatchlist);
router.post('/org', addToOrgWatchlist);
router.delete('/org/:symbol', removeFromOrgWatchlist);

export default router;
