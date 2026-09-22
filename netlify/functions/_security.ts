import crypto from "node:crypto";
import { getStore } from "@netlify/blobs";

// 1. Secret de semnare HMAC (12 ore valabilitate)
// Prioritizăm variabila dedicată ACCESS_TOKEN_SECRET din Netlify / .env
// În caz că nu este încă adăugată în panoul Netlify, folosim o derivare sigură pentru a preveni căderea neintenționată a site-ului
function getSigningSecret(): string {
  if (process.env.ACCESS_TOKEN_SECRET && process.env.ACCESS_TOKEN_SECRET.trim().length > 0) {
    return process.env.ACCESS_TOKEN_SECRET.trim();
  }
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0) {
    return `edumetodist-seed-${process.env.GEMINI_API_KEY.slice(-16)}`;
  }
  return "edumetodist-romania-secure-hmac-key-2026-2027";
}

export interface TokenPayload {
  iat: number;
  exp: number;
  nonce: string;
}

export function generateAccessToken(): { token: string; expiresIn: number } {
  const secret = getSigningSecret();
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 12 * 3600; // 12 ore
  const nonce = crypto.randomBytes(8).toString("hex");

  const payload: TokenPayload = { iat: now, exp, nonce };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payloadB64)
    .digest("hex");

  return {
    token: `${payloadB64}.${signature}`,
    expiresIn: 12 * 3600,
  };
}

export function verifyAccessToken(token?: string | null): { valid: boolean; error?: string } {
  if (!token || typeof token !== "string") {
    return { valid: false, error: "Token de acces lipsă." };
  }

  const parts = token.trim().split(".");
  if (parts.length !== 2) {
    return { valid: false, error: "Format token invalid." };
  }

  const [payloadB64, signature] = parts;
  const secret = getSigningSecret();

  // Verificăm semnătura criptografică HMAC
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payloadB64)
    .digest("hex");

  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
    return { valid: false, error: "Semnătură token invalidă." };
  }

  // Verificăm expirarea
  try {
    const payload: TokenPayload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf-8"));
    const now = Math.floor(Date.now() / 1000);
    if (!payload.exp || now > payload.exp) {
      return { valid: false, error: "Tokenul de acces a expirat (valabilitate 12h depășită)." };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: "Payload token deteriorat." };
  }
}

// 2. CORS restrictiv adaptat
const ALLOWED_ORIGIN_PATTERNS = [
  /^https:\/\/(www\.)?sesuna\.ro$/,
  /^http:\/\/localhost(:[0-9]+)?$/,
  /^http:\/\/127\.0\.0\.1(:[0-9]+)?$/,
  /^https:\/\/[a-z0-9-]+\.netlify\.app$/,
  /^https:\/\/ais-(dev|pre)-[a-z0-9-]+\.europe-west3\.run\.app$/,
];

export function getCorsHeaders(requestOrigin?: string | null) {
  let allowOrigin = "https://sesuna.ro";

  if (requestOrigin) {
    const isAllowed = ALLOWED_ORIGIN_PATTERNS.some((pattern) => pattern.test(requestOrigin));
    if (isAllowed) {
      allowOrigin = requestOrigin;
    }
  }

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-access-token",
    "Access-Control-Max-Age": "86400",
  };
}

// 3. Extragere IP client
export function getClientIp(req: any): string {
  if (!req) return "127.0.0.1";

  // Dacă req este Request standard (Netlify Functions v2)
  if (req.headers && typeof req.headers.get === "function") {
    const nfIp = req.headers.get("x-nf-client-connection-ip");
    if (nfIp) return nfIp.trim();

    const clientIp = req.headers.get("client-ip");
    if (clientIp) return clientIp.trim();

    const fwd = req.headers.get("x-forwarded-for");
    if (fwd) return fwd.split(",")[0].trim();
  }

  // Dacă req este Express Request
  if (req.headers && typeof req.headers === "object") {
    const nfIp = req.headers["x-nf-client-connection-ip"];
    if (typeof nfIp === "string" && nfIp.trim()) return nfIp.trim();

    const clientIp = req.headers["client-ip"];
    if (typeof clientIp === "string" && clientIp.trim()) return clientIp.trim();

    const fwd = req.headers["x-forwarded-for"];
    if (typeof fwd === "string" && fwd.trim()) return fwd.split(",")[0].trim();

    if (req.ip && typeof req.ip === "string") return req.ip;
  }

  return "127.0.0.1";
}

// 4. Rate Limiting cu Netlify Blobs + Fallback în memorie
// Stocare în memorie pentru fallback local sau când Blobs nu e configurat
const memoryRateStore = new Map<string, { count: number; expireAt: number }>();

export async function checkRateLimit(
  ip: string,
  action: "generate" | "chat"
): Promise<{ allowed: boolean; limit: number; remaining: number; retryAfterSeconds: number }> {
  const limit =
    action === "generate"
      ? Number(process.env.RATE_LIMIT_GENERATE_PER_HOUR) || 10
      : Number(process.env.RATE_LIMIT_CHAT_PER_HOUR) || 20;

  const now = Date.now();
  const windowMs = 3600 * 1000; // 1 oră
  const currentWindowKey = Math.floor(now / windowMs);
  const blobKey = `${action}:${ip.replace(/[^a-zA-Z0-9_.-]/g, "_")}:${currentWindowKey}`;
  const expireAt = (currentWindowKey + 1) * windowMs;
  const retryAfterSeconds = Math.max(1, Math.ceil((expireAt - now) / 1000));

  let currentCount = 0;
  let usedNetlifyBlobs = false;

  // Încercăm întâi salvarea durabilă cu Netlify Blobs
  try {
    const store = getStore("rate-limits");
    const data = await store.get(blobKey, { type: "json" }) as { count: number } | null;
    currentCount = data && typeof data.count === "number" ? data.count : 0;
    usedNetlifyBlobs = true;
  } catch {
    // Netlify Blobs nu este disponibil (ex. mediul local sau lipsă context), trecem pe memorie
    usedNetlifyBlobs = false;
  }

  if (!usedNetlifyBlobs) {
    const existing = memoryRateStore.get(blobKey);
    if (existing && existing.expireAt > now) {
      currentCount = existing.count;
    } else {
      currentCount = 0;
    }
  }

  if (currentCount >= limit) {
    return {
      allowed: false,
      limit,
      remaining: 0,
      retryAfterSeconds,
    };
  }

  // Incrementăm
  const newCount = currentCount + 1;
  if (usedNetlifyBlobs) {
    try {
      const store = getStore("rate-limits");
      await store.setJSON(blobKey, { count: newCount, expireAt });
    } catch (e) {
      console.warn("Nu s-a putut salva în Netlify Blobs:", e);
    }
  } else {
    memoryRateStore.set(blobKey, { count: newCount, expireAt });
    // Curățenie periodică în memoria locală
    if (memoryRateStore.size > 2000) {
      for (const [k, v] of memoryRateStore.entries()) {
        if (v.expireAt <= now) {
          memoryRateStore.delete(k);
        }
      }
    }
  }

  return {
    allowed: true,
    limit,
    remaining: Math.max(0, limit - newCount),
    retryAfterSeconds,
  };
}

// 5. Validare dimensiune și sanitizare
export function validatePayloadSize(
  rawBody: string | undefined | null,
  maxBytes: number
): { valid: boolean; error?: string } {
  if (!rawBody) return { valid: true };
  const bytes = Buffer.byteLength(rawBody, "utf8");
  if (bytes > maxBytes) {
    const maxMb = (maxBytes / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `Dimensiunea cererii (${(bytes / (1024 * 1024)).toFixed(2)} MB) depășește limita permisă de ${maxMb} MB.`,
    };
  }
  return { valid: true };
}

export function extractBearerToken(req: any, bodyObj?: any): string | null {
  if (bodyObj && typeof bodyObj.accessToken === "string" && bodyObj.accessToken.trim()) {
    return bodyObj.accessToken.trim();
  }

  if (req.headers && typeof req.headers.get === "function") {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
      return authHeader.slice(7).trim();
    }
    const customHeader = req.headers.get("x-access-token");
    if (customHeader) return customHeader.trim();
  }

  if (req.headers && typeof req.headers === "object") {
    const authHeader = req.headers["authorization"];
    if (typeof authHeader === "string" && authHeader.toLowerCase().startsWith("bearer ")) {
      return authHeader.slice(7).trim();
    }
    const customHeader = req.headers["x-access-token"];
    if (typeof customHeader === "string") return customHeader.trim();
  }

  return null;
}
