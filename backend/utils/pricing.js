export const SIZE_MULTIPLIER = {
  small: 0.85,
  medium: 1,
  large: 1.25,
  premium: 1.55,
};

export const DELIVERY_FEE = { standard: 79, express: 149 };

export const computeCustomTotal = ({ flowers = [], size = "medium", wrappingPrice = 0, ribbonPrice = 0, addOns = [] }) => {
  const stems = flowers.reduce((s, f) => s + (f.unitPrice || 0) * (f.quantity || 0), 0);
  const sized = Math.round(stems * (SIZE_MULTIPLIER[size] || 1));
  const extras = addOns.reduce((s, a) => s + (a.price || 0), 0);
  return sized + wrappingPrice + ribbonPrice + extras;
};

export const applyCoupon = (coupon, subtotal) => {
  if (!coupon || !coupon.active) return 0;
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return 0;
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return 0;
  if (subtotal < (coupon.minOrder || 0)) return 0;
  if (coupon.type === "percent") return Math.round((subtotal * coupon.value) / 100);
  return Math.min(coupon.value, subtotal);
};

export const makeOrderId = () => {
  const n = Math.floor(100000 + Math.random() * 900000);
  return `BB${Date.now().toString().slice(-6)}${n}`;
};
