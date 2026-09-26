import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";

import path from "path";
import fs from "fs";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { eq } from "drizzle-orm";
import { db, mediaTable } from "@workspace/db";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.set("trust proxy", true);

// Security Headers via Helmet
app.use(
  helmet({
    contentSecurityPolicy: false, // Disabled for dev proxying & dynamic previews compatibility
    crossOriginEmbedderPolicy: false,
    // Allow images/assets to be loaded cross-origin (Cloudflare frontend → Render backend)
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Rate Limiter: Max 500 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per `window`
  standardHeaders: true, // Return standard rate limit info headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { error: "Too many requests from this IP, please try again later." },
  keyGenerator: (req) => {
    // Under Cloudflare, prioritize CF-Connecting-IP
    const cfIp = req.headers["cf-connecting-ip"];
    if (typeof cfIp === "string") return cfIp;
    
    // Fall back to Express trust proxy req.ip (which correctly parses X-Forwarded-For)
    return req.ip || "";
  },
});
app.use("/api", apiLimiter);

const configuredDomains = [
  process.env.REPLIT_DEV_DOMAIN,
  ...(process.env.REPLIT_DOMAINS?.split(",") ?? []),
]
  .filter((domain): domain is string => Boolean(domain))
  .map((domain) => domain.trim())
  .filter(Boolean);

const allowedOrigins = new Set([
  ...configuredDomains.flatMap((domain) => [
    `https://${domain.replace(/^https?:\/\//, "")}`,
    `http://${domain.replace(/^https?:\/\//, "")}`,
  ]),

  "http://localhost:3000",
  "http://localhost:5173",

  "https://neelkamalhomestaykasauli.in",
  "https://www.neelkamalhomestaykasauli.in",
]);

function isAllowedOrigin(origin: string): boolean {
  const normalized = origin.toLowerCase().trim();
  if (allowedOrigins.has(normalized)) {
    return true;
  }

  try {
    const { hostname } = new URL(origin);
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "[::1]" ||
      hostname.endsWith(".pages.dev") ||
      hostname.endsWith(".neelkamalhomestaykasauli.in") ||
      hostname.endsWith(".neelkamalhomestay.com") ||
      hostname === "neelkamalhomestay.com"
    );
  } catch {
    return false;
  }
}

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware removed – JWT auth used instead

// Lightweight built-in gzip compression middleware for API JSON responses
import zlib from "zlib";
app.use((req, res, next) => {
  const acceptEncoding = (req.headers["accept-encoding"] as string) || "";
  if (!acceptEncoding.includes("gzip") || req.url.startsWith("/api/uploads/")) {
    return next();
  }

  const originalSend = res.send;
  res.send = function (body: any) {
    if (res.headersSent) return originalSend.call(this, body);

    const contentType = String(res.getHeader("Content-Type") || "");
    const isCompressible = contentType.includes("json") || contentType.includes("text");

    if (!isCompressible || !body) {
      return originalSend.call(this, body);
    }

    const payload = Buffer.isBuffer(body)
      ? body
      : Buffer.from(typeof body === "string" ? body : JSON.stringify(body));

    if (payload.length < 1024) {
      return originalSend.call(this, body);
    }

    zlib.gzip(payload, (err, compressed) => {
      if (err) {
        return originalSend.call(this, body);
      }
      res.setHeader("Content-Encoding", "gzip");
      res.setHeader("Content-Length", compressed.length);
      return originalSend.call(this, compressed);
    });
    return res;
  };
  next();
});

// Serve uploaded files statically with aggressive immutable caching
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

app.use(
  "/api/uploads",
  express.static(UPLOADS_DIR, {
    maxAge: "365d",
    immutable: true,
    lastModified: true,
    etag: true,
    setHeaders: (res) => {
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      res.setHeader("Access-Control-Allow-Origin", "*");
    },
  })
);

// Retrieve uploaded files from local disk or reconstitute from PostgreSQL database store
app.get("/api/uploads/:filename", async (req, res): Promise<void> => {
  const filename = req.params.filename;

  // Fast-path: Check if file already exists on local disk
  const filePath = path.join(UPLOADS_DIR, filename);
  if (fs.existsSync(filePath)) {
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.sendFile(filePath);
    return;
  }

  const distinctPhotos = [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
  ];

  try {
    const [media] = await db.select().from(mediaTable).where(eq(mediaTable.filename, filename));

    if (media && media.data) {
      const buffer = Buffer.from(media.data, "base64");
      // Cache file back to local disk
      if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
      fs.writeFileSync(filePath, buffer);

      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.contentType(media.mimeType).send(buffer);
      return;
    }

    if (media) {
      const photoUrl = distinctPhotos[media.id % distinctPhotos.length];
      res.setHeader("Cache-Control", "public, max-age=86400");
      res.redirect(302, photoUrl);
      return;
    }
  } catch (err) {
    logger.error({ err }, "Failed to retrieve persistent media from database");
  }

  // Fallback gracefully to a deterministic photo based on filename hash so broken image icons never appear
  let hash = 0;
  for (let i = 0; i < filename.length; i++) {
    hash = (hash + filename.charCodeAt(i)) % distinctPhotos.length;
  }
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.redirect(302, distinctPhotos[hash]);
});

app.use("/api", router);

export default app;
