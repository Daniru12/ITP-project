import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createPromoCode,
  getAllPromoCodes,
  validatePromoCode,
  updatePromoCode,
  deletePromoCode
} from '../controller/ProductsCRUD/PromoCodeController.js';

const router = express.Router();

router.post('/create', protect, createPromoCode);
router.get('/all', protect, getAllPromoCodes);
router.post('/validate', protect, validatePromoCode);
router.put('/:id', protect, updatePromoCode);
router.delete('/:id', protect, deletePromoCode);

export default router; 