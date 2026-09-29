import "./silent-console";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { setupAuthRoutes } from "./auth-middleware";
import { dynamicMongoDB } from "./dynamic-mongodb";
import { mongodb } from "./mongodb";

const app = express();

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

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (!path.startsWith("/api")) return;

    const isProduction = process.env.NODE_ENV === "production";
    const isSlow = duration >= 1500;
    if (!isProduction) {
      log(`${req.method} ${path} ${res.statusCode} in ${duration}ms${isSlow ? " (slow)" : ""}`);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
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
