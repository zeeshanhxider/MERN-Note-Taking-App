import ratelimit from "../config/upstash.js";

const rateLimiter = async (req, res, next) => {
  if (req.path === "/favicon.png") return next();
  try {
    if (
      req.path.startsWith("/assets") ||
      req.path === "/favicon.png" ||
      req.path.endsWith(".js") ||
      req.path.endsWith(".css") ||
      req.path.endsWith(".png") ||
      req.path.endsWith(".ico")
    ) {
      return next();
    }
    const { success } = await ratelimit.limit("rate-limit-key");
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
