import rateLimit from "express-rate-limit";

const freeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Free user uchun 1 daqiqada 5 ta so'rov limiti." },
});

const premiumLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Premium user uchun limit oshib ketdi." },
});

export function aiRateLimit(req, res, next) {
  const isPremium = req.user?.isPremium;
  return isPremium ? premiumLimiter(req, res, next) : freeLimiter(req, res, next);
}

