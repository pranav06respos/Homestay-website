import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { pool } from "@workspace/db";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

router.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

router.get("/db-debug", async (_req, res) => {
  const dbUrl = process.env.DATABASE_URL || "";
  let parsedUrl: Record<string, string> = {};
  try {
    const u = new URL(dbUrl);
    parsedUrl = {
      protocol: u.protocol,
      hostname: u.hostname,
      port: u.port || "5432",
      database: u.pathname.replace(/^\//, ""),
      user: u.username,
      search: u.search,
    };
  } catch (e: any) {
    parsedUrl = { error: e.message };
  }

  const result: Record<string, any> = {
    dbUrlParsed: parsedUrl,
    nodeEnv: process.env.NODE_ENV,
  };

  try {
    const client = await pool.connect();
    try {
      const v = await client.query("SELECT current_database() AS db, current_schema() AS sch, version() AS version");
      result.connection = "SUCCESS";
      result.dbInfo = v.rows[0];

      const t = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name");
      result.tables = t.rows.map(r => r.table_name);

      try {
        const s = await client.query("SELECT * FROM settings LIMIT 1");
        result.settingsQuery = { status: "SUCCESS", rowCount: s.rows.length, sampleRow: s.rows[0] };
      } catch (sqErr: any) {
        result.settingsQuery = { status: "FAILED", error: sqErr.message, code: sqErr.code, detail: sqErr.detail, hint: sqErr.hint };
      }
    } finally {
      client.release();
    }
  } catch (connErr: any) {
    result.connection = "FAILED";
    result.connError = {
      message: connErr.message,
      code: connErr.code,
      cause: String(connErr.cause || ""),
      stack: connErr.stack,
    };
  }

  res.json(result);
});

export default router;
