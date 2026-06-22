import app from "./app";
import { logger } from "./lib/logger";
import {
  db,
  seedRbacDefaults,
  ensureStatusEvidenciasEnviadas,
} from "@workspace/db";

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

// Ensure default RBAC profiles/objects exist before serving requests.
// Idempotent: preserves any custom profiles, objects and grants.
seedRbacDefaults(db)
  .then(() => {
    logger.info("RBAC defaults ensured");
    return ensureStatusEvidenciasEnviadas(db);
  })
  .then(() => {
    logger.info("status_cenario defaults ensured");
  })
  .catch((err: unknown) => {
    logger.error({ err }, "Failed to seed defaults");
  });

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
