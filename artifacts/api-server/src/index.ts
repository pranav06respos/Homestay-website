import app from "./app";
import { logger } from "./lib/logger";
import { pool } from "@workspace/db";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const server = app.listen(port, () => {
  logger.info({ port }, "Server listening");

  // Probe DB connection at startup so Render logs show the exact error immediately.
  pool.connect()
    .then(async (client) => {
      try {
        const r = await client.query(
          "SELECT current_database() AS db, current_schema() AS sch"
        );
        const row = r.rows[0] as { db: string; sch: string };
        logger.info({ db: row.db, schema: row.sch }, "[DB] Connected to Postgres");
      } catch (err) {
        logger.error({ err }, "[DB] Startup query failed");
      } finally {
        client.release();
      }
    })
    .catch((err: Error & { code?: string }) => {
      logger.error(
        { message: err.message, code: err.code, cause: err.cause },
        "[DB] STARTUP CONNECTION FAILED — check DATABASE_URL and SSL settings on Render"
      );
    });
});

server.on("error", (err) => {
  logger.error({ err }, "Error listening on port");
  process.exit(1);
});

