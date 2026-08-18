import express from "express";
import "dotenv/config";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import { registerRoutes } from "./routes/index.js";
import { errorHandler } from "./middleware/error-handler.middleware.js";
import { inngest } from "./inngest/client.js"
import { serve } from "inngest/express";
import { functions } from "./inngest/index.js"

const clientUrl = process.env.CLIENT_URL ?? "http://localhost:3000";
const app = express();
const PORT = process.env.PORT || 8081;

app.use(
    cors({
        origin: clientUrl,
        credentials: true,
        exposedHeaders: ["X-Conversation-Id", "x-conversation-id"],
    }),
);

app.all('/api/auth/*splat', toNodeHandler(auth));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use("/uploads", express.static("uploads"));


// Set up the "/api/inngest" (recommended) routes with the serve handler
app.use("/api/inngest", serve({ client: inngest, functions }));

app.get("/", (_req, res) => {
    res.send("Hello World");
});

app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});

registerRoutes(app);

app.use(errorHandler)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});