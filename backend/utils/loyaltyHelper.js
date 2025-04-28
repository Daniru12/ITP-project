// Calculate points based on package type
export const calculateLoyaltyPoints = (packageType) => {
  // Points awarded for different package types
  const pointsMap = {
    basic: 20,     // $2 worth of points
    premium: 40,   // $4 worth of points
    luxury: 60     // $6 worth of points
  };
  return pointsMap[packageType] || 0;
};

// Calculate discount based on points
export const calculateDiscount = (points) => {
  if (!points || points < 20) return 0;
  
  // Every 20 points = $2 discount
  // Maximum discount of $50 (500 points)
  const possibleDiscount = Math.floor(points / 20) * 2;
  return Math.min(possibleDiscount, 50);
};

// Helper function to calculate points needed for a discount amount
export const calculatePointsNeeded = (discountAmount) => {
  // $2 discount requires 20 points
  return Math.ceil(discountAmount / 2) * 20;
};