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

    // Convert dates to UTC
    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);

    const promoCode = new PromoCode({
      code: code.toUpperCase(),
      discount,
      startDate: startDateTime,
      endDate: endDateTime,
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
      return res.status(400).json({ message: "Invalid promo code" });
    }

    // Debug logs
    console.log('Promo Code Found:', {
      code: promoCode.code,
      startDate: promoCode.startDate,
      endDate: promoCode.endDate,
      currentDate: new Date(),
      isActive: promoCode.isActive,
      maxUses: promoCode.maxUses,
      currentUses: promoCode.currentUses,
      minPurchaseAmount: promoCode.minPurchaseAmount
    });

    // Convert all dates to UTC for consistent comparison
    const now = new Date();
    const startDate = new Date(promoCode.startDate);
    const endDate = new Date(promoCode.endDate);

    // Debug date comparisons
    console.log('Date Comparisons:', {
      nowUTC: now.toISOString(),
      startUTC: startDate.toISOString(),
      endUTC: endDate.toISOString(),
      beforeStart: now < startDate,
      afterEnd: now > endDate
    });

    // Check if promo code is within valid date range
    // Add a small buffer (1 day) to account for timezone differences
    const oneDayBuffer = 24 * 60 * 60 * 1000; // 1 day in milliseconds
    if (now.getTime() + oneDayBuffer < startDate.getTime() || now.getTime() > endDate.getTime() + oneDayBuffer) {
      return res.status(400).json({ 
        message: "Promo code has expired or not yet active",
        debug: {
          current: now.toISOString(),
          start: startDate.toISOString(),
          end: endDate.toISOString()
        }
      });
    }

    // Check if maximum uses reached
    if (promoCode.maxUses !== null && promoCode.currentUses >= promoCode.maxUses) {
      return res.status(400).json({ message: "Promo code has reached maximum uses" });
    }

    // Check minimum purchase amount
    if (purchaseAmount < promoCode.minPurchaseAmount) {
      return res.status(400).json({ 
        message: `Minimum purchase amount of Rs.${promoCode.minPurchaseAmount} required` 
      });
    }

    // If all validations pass, return the promo code details
    res.status(200).json({
      code: promoCode.code,
      discount: promoCode.discount,
      minPurchaseAmount: promoCode.minPurchaseAmount
    });

  } catch (error) {
    console.error('Promo code validation error:', error);
    res.status(500).json({ message: "Error validating promo code" });
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