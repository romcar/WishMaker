import { Router } from 'express';
import {
  getAllWishes,
  getWishById,
  createWish,
  updateWish,
  deleteWish,
} from '../controllers/wish.controller';

const router = Router();

router.get('/wishes', getAllWishes);
router.get('/wishes/:id', getWishById);
router.post('/wishes', createWish);
router.put('/wishes/:id', updateWish);
router.delete('/wishes/:id', deleteWish);

export default router;
