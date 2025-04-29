import PromoCode from '../../models/Products/PromoCode.js';

// Create new promo code
export const createPromoCode = async (req, res) => {
  try {
    const {
      code,
      discount,
      startDate,
      endDate,
      maxUses,
      minPurchaseAmount
    } = req.body;

    // Verify admin
    if (req.user.user_type !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create promo codes' });
    }

    // Check if code already exists
    const existingCode = await PromoCode.findOne({ code: code.toUpperCase() });
    if (existingCode) {
      return res.status(400).json({ message: 'Promo code already exists' });
    }

    const promoCode = new PromoCode({
      code: code.toUpperCase(),
      discount,
      startDate,
      endDate,
      maxUses,
      minPurchaseAmount,
      createdBy: req.user._id
    });

    await promoCode.save();

    res.status(201).json({
      message: 'Promo code created successfully',
      promoCode
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error creating promo code',
      error: error.message
    });
  }
};

// Get all promo codes (admin only)
export const getAllPromoCodes = async (req, res) => {
  try {
    if (req.user.user_type !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const promoCodes = await PromoCode.find()
      .sort({ createdAt: -1 });

    res.status(200).json(promoCodes);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching promo codes',
      error: error.message
    });
  }
};

// Validate promo code
export const validatePromoCode = async (req, res) => {
  try {
    const { code, purchaseAmount } = req.body;

    const promoCode = await PromoCode.findOne({ 
      code: code.toUpperCase(),
      isActive: true
    });

    if (!promoCode) {
      return res.status(404).json({ message: 'Invalid promo code' });
    }

    // Check if code is expired
    const now = new Date();
    if (now < promoCode.startDate || now > promoCode.endDate) {
      return res.status(400).json({ message: 'Promo code has expired' });
    }

    // Check usage limit
    if (promoCode.maxUses && promoCode.currentUses >= promoCode.maxUses) {
      return res.status(400).json({ message: 'Promo code usage limit reached' });
    }

    // Check minimum purchase amount
    if (purchaseAmount < promoCode.minPurchaseAmount) {
      return res.status(400).json({ 
        message: `Minimum purchase amount of Rs.${promoCode.minPurchaseAmount} required`
      });
    }

    res.status(200).json({
      valid: true,
      discount: promoCode.discount,
      message: 'Promo code is valid'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error validating promo code',
      error: error.message
    });
  }
};

// Update promo code
export const updatePromoCode = async (req, res) => {
  try {
    if (req.user.user_type !== 'admin') {
      return res.status(403).json({ message: 'Only admins can update promo codes' });
    }

    const promoCode = await PromoCode.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!promoCode) {
      return res.status(404).json({ message: 'Promo code not found' });
    }

    res.status(200).json({
      message: 'Promo code updated successfully',
      promoCode
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating promo code',
      error: error.message
    });
  }
};

// Delete promo code
export const deletePromoCode = async (req, res) => {
  try {
    if (req.user.user_type !== 'admin') {
      return res.status(403).json({ message: 'Only admins can delete promo codes' });
    }

    const promoCode = await PromoCode.findByIdAndDelete(req.params.id);

    if (!promoCode) {
      return res.status(404).json({ message: 'Promo code not found' });
    }

    res.status(200).json({
      message: 'Promo code deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting promo code',
      error: error.message
    });
  }
}; 