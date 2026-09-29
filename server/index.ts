import "./silent-console";
import "express-async-errors";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { setupAuthRoutes } from "./auth-middleware";
import { dynamicMongoDB } from "./dynamic-mongodb";
import { mongodb } from "./mongodb";

const app = express();

app.use((req, res, next) => {
  const diagnosticsEnabled = process.env.NODE_ENV !== "production";
  const path = req.path;
  if (!diagnosticsEnabled || !(path === "/api" || path.startsWith("/api/"))) {
    return next();
  }

  const startedAt = Date.now();
  let finished = false;
  log(`[POS-DIAG][API] request started ${req.method} ${path}`, "express");

  res.on("finish", () => {
    finished = true;
    const durationMs = Date.now() - startedAt;
    const slowLabel = durationMs >= 1500 ? " (slow)" : "";
    log(
      `[POS-DIAG][API] response ${req.method} ${path} ${res.statusCode} in ${durationMs}ms${slowLabel}`,
      "express",
    );
  });

  res.on("close", () => {
    if (!finished) {
      log(
        `[POS-DIAG][API] connection closed before response ${req.method} ${path} after ${Date.now() - startedAt}ms`,
        "express",
      );
    }
  });

  next();
});

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
// QZ Tray signs the exact text/plain challenge it sends. This parser must
// come after JSON so normal API requests keep their existing behavior.
app.use(express.text({ type: "text/plain", limit: "32kb" }));
app.use(express.urlencoded({ extended: false }));

setupAuthRoutes(app);

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
      return next(err);
    }

    const mongoAvailabilityErrors = new Set([
      "MongoServerSelectionError",
      "MongoNetworkError",
      "MongoNetworkTimeoutError",
      "MongoNotConnectedError",
      "MongoTopologyClosedError",
      "MongoWaitQueueTimeoutError",
    ]);
    const isMongoUnavailable = mongoAvailabilityErrors.has(err?.name);
    const rawStatus = Number(err?.status ?? err?.statusCode);
    const status = isMongoUnavailable ? 503 : Number.isInteger(rawStatus) ? rawStatus : 500;
    if (process.env.NODE_ENV !== "production" && status >= 500) {
      const errorName = typeof err?.name === "string" ? err.name : "Error";
      log(`[POS-DIAG][API] handler error ${req.method} ${req.path} ${status} ${errorName}`, "express");
    }
    const message = isMongoUnavailable
      ? "Database temporarily unavailable. Please try again."
      : status < 500
        ? err?.message || "Request failed"
        : "Internal Server Error";

    res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  let shutdownPromise: Promise<void> | null = null;

  const shutdown = (signal: "SIGINT" | "SIGTERM"): Promise<void> => {
    if (shutdownPromise) return shutdownPromise;

    shutdownPromise = (async () => {
      log(`Received ${signal}; closing server and MongoDB pools`);

      const forceCloseTimer = setTimeout(() => {
        server.closeAllConnections();
      }, 10_000);
      forceCloseTimer.unref();

      try {
        await new Promise<void>((resolve, reject) => {
          server.close((error) => {
            if (error) reject(error);
            else resolve();
          });
        });
      } finally {
        clearTimeout(forceCloseTimer);
      }

      await dynamicMongoDB.closeAll();
      await mongodb.disconnect();
      log("Server and MongoDB pools closed");
    })();

    return shutdownPromise;
  };

  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });

  process.once("SIGINT", () => {
    void shutdown("SIGINT").catch((error) => {
      console.error("Error during SIGINT shutdown:", error);
      process.exitCode = 1;
    });
  });
  process.once("SIGTERM", () => {
    void shutdown("SIGTERM").catch((error) => {
      console.error("Error during SIGTERM shutdown:", error);
      process.exitCode = 1;
    });
  });
})();
