import { Router } from 'express';
import {
    createWish,
    deleteWish,
    getAllWishes,
    getWishById,
    updateWish,
} from '../controllers/wish.controller';

// TODO: CRITICAL - Missing authentication middleware
// 🎫 Linear Ticket: https://linear.app/romcar/issue/ROM-5/critical-fix-authentication-security-vulnerabilities
// This is a MAJOR security vulnerability - any user can access any wish!
// 1. Add JWT authentication middleware to all routes
// 2. Extract user ID from JWT token
// 3. Filter wishes by authenticated user's ID only
// 4. Add proper error handling for unauthorized access
// 5. Implement rate limiting to prevent abuse
// import { authenticateToken } from '../middleware/auth.middleware';
// router.use(authenticateToken); // Protect all wish routes

const router = Router();

// TODO: MISSING API ENDPOINTS - Add these essential endpoints:
// GET /wishes/search?q=query&category=cat&status=pending - Search/filter wishes
// GET /wishes/stats - User's wish statistics (counts by status, etc.)
// POST /wishes/:id/duplicate - Duplicate an existing wish
// POST /wishes/:id/share - Generate sharing link for wish
// GET /wishes/shared/:token - View shared wish (public endpoint)
// POST /wishes/:id/comments - Add comment to wish
// GET /wishes/:id/comments - Get wish comments
// POST /wishes/:id/attachments - Upload files to wish
// GET /wishes/:id/attachments - Get wish attachments
// PUT /wishes/:id/priority - Update wish priority
// POST /wishes/bulk-update - Update multiple wishes at once
// GET /wishes/categories - Get user's wish categories
// POST /wishes/categories - Create new category
// GET /wishes/templates - Get wish templates
// POST /wishes/templates - Create wish template

router.get('/wishes', getAllWishes);
router.get('/wishes/:id', getWishById);
router.post('/wishes', createWish);
router.put('/wishes/:id', updateWish);
router.delete('/wishes/:id', deleteWish);

export default router;
