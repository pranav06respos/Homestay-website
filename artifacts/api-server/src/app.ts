import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import session from "express-session";
import path from "path";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.set("trust proxy", 1);

// Security Headers via Helmet
app.use(
  helmet({
    contentSecurityPolicy: false, // Disabled for dev proxying & dynamic previews compatibility
    crossOriginEmbedderPolicy: false,
  })
);

// Rate Limiter: Max 500 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per `window`
  standardHeaders: true, // Return standard rate limit info headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { error: "Too many requests from this IP, please try again later." },
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
  if (allowedOrigins.has(origin)) {
    return true;
  }

  try {
    const { hostname } = new URL(origin);
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "[::1]"
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
        return;
      }
      callback(new Error("Origin not allowed"));
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || (() => {
      throw new Error("SESSION_SECRET must be configured");
    })(),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  }),
);

// Serve uploaded files statically
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
app.use("/api/uploads", express.static(UPLOADS_DIR));

app.use("/api", router);

export default app;
