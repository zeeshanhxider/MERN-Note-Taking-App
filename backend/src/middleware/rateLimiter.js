import ratelimit from "../config/upstash.js";

const rateLimiter = async (req, res, next) => {
  try {
    if (!req.path.startsWith("/api")) return next();

    const { success } = await ratelimit.limit(req.ip);
    if (!success) {
      return res
        .status(429)
        .json({ message: "Too many requests, please try again later." });
    }
    next();
  } catch (error) {
    console.log("Rate limiter error:", error);
    next(error);
  }
};

export default rateLimiter;
