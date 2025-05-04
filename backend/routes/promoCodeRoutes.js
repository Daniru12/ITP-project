import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createPromoCode,
  getAllPromoCodes,
  validatePromoCode,
  updatePromoCode,
  deletePromoCode
} from '../controller/ProductsCRUD/PromoCodeController.js';
import PromoCode from '../models/Products/PromoCode.js';

const router = express.Router();

router.post('/create', protect, createPromoCode);
router.get('/all', protect, getAllPromoCodes);
router.post('/validate', protect, validatePromoCode);
router.put('/:id', protect, updatePromoCode);
router.delete('/:id', protect, deletePromoCode);

router.get('/debug/:code', protect, async (req, res) => {
  try {
    const promoCode = await PromoCode.findOne({ code: req.params.code.toUpperCase() });
    
    if (!promoCode) {
      return res.status(404).json({ message: 'Promo code not found' });
    }

    const now = new Date();
    const startDate = new Date(promoCode.startDate);
    const endDate = new Date(promoCode.endDate);

    res.json({
      promoCode,
      currentTime: now,
      startDate,
      endDate,
      isExpired: now > endDate,
      notStarted: now < startDate,
      dateChecks: {
        nowTime: now.getTime(),
        startTime: startDate.getTime(),
        endTime: endDate.getTime()
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      stack: error.stack 
    });
  }
});

export default router; 