import crypto from "crypto";

const AUTH_SECRET =
  process.env.AUTH_SECRET ||
  "nabd-alamal-development-secret-change-this";

const TOKEN_TTL = 7 * 24 * 60 * 60 * 1000;

export function createToken(userId) {
  const payload = Buffer.from(
    JSON.stringify({
      userId,
      exp: Date.now() + TOKEN_TTL,
    })
  ).toString("base64url");

  const signature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(payload)
    .digest("base64url");

  return `${payload}.${signature}`;
}

export function verifyToken(token) {
  if (!token || typeof token !== "string") {
    return null;
  }

  const [payload, signature] = token.split(".");

  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(payload)
    .digest("base64url");

  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    actualBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(
      actualBuffer,
      expectedBuffer
    )
  ) {
    return null;
  }

  try {
    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    );

    if (!data.userId || !data.exp) {
      return null;
    }

    if (Date.now() > data.exp) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

export function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization || "";

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      error: "غير مصرح. يجب تسجيل الدخول أولاً",
    });
  }

  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({
      error: "جلسة الدخول غير صالحة أو منتهية",
    });
  }

  req.auth = payload;

  next();
}
