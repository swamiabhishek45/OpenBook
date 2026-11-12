import "./lib/polyfills.js";
import express from "express";
import "dotenv/config";
import cors from "cors";
import helmet from "helmet";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import { registerRoutes } from "./routes/index.js";
import { errorHandler } from "./middleware/error-handler.middleware.js";
import { inngest } from "./inngest/client.js";
import { serve } from "inngest/express";
import { functions } from "./inngest/index.js";
import {
    configureInngestServeEnv,
    logInngestStartupMode,
} from "./inngest/config.js";
import { assertServerEnv, getServerEnv } from "./config/env.js";
import { logger } from "./lib/logger.js";
import { globalApiLimiter } from "./middleware/rate-limit.middleware.js";
import { runHealthChecks } from "./services/health.services.js";
import { handleRazorpayWebhook } from "./controllers/payment.controller.js";
import { asyncHandler } from "./utils/async-handler.js";

configureInngestServeEnv();
const env = assertServerEnv();

const rawClientUrls = env.CLIENT_URL || "http://localhost:3000";
const allowedOrigins = rawClientUrls
    .split(",")
    .map((url) => url.trim().replace(/\/$/, ""))
    .filter(Boolean);

if (!allowedOrigins.includes("http://localhost:3000")) {
    allowedOrigins.push("http://localhost:3000");
}

const app = express();
app.set("trust proxy", true);
const PORT = env.PORT;

app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
);

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);
            const normalizedOrigin = origin.replace(/\/$/, "");
            if (
                allowedOrigins.includes(normalizedOrigin) ||
                allowedOrigins.includes("*")
            ) {
                return callback(null, true);
            }
            callback(new Error(`Origin ${origin} not allowed by CORS`));
        },
        credentials: true,
        exposedHeaders: ["X-Conversation-Id", "x-conversation-id"],
    }),
);

app.all("/api/auth/*splat", toNodeHandler(auth));

app.post(
    "/api/payment/webhook",
    express.raw({ type: "application/json" }),
    asyncHandler(handleRazorpayWebhook),
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

if (env.NODE_ENV !== "production") {
    app.use("/uploads", express.static("uploads"));
}

app.use("/api/inngest", serve({ client: inngest, functions }));

app.get("/", (_req, res) => {
    res.send("OpenBook API");
});

app.get("/health", async (_req, res) => {
    const { ok, checks } = await runHealthChecks();
    res.status(ok ? 200 : 503).json({
        status: ok ? "ok" : "degraded",
        checks,
    });
});

app.use("/api", globalApiLimiter);

registerRoutes(app);

app.use(errorHandler);

app.listen(Number(PORT), "0.0.0.0", () => {
    logger.info("Server listening", { port: PORT, nodeEnv: env.NODE_ENV });
    logInngestStartupMode();
});
