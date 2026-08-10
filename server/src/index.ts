import express from "express";
import "dotenv/config";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import { registerRoutes } from "./routes/index.js";
import { errorHandler } from "./middleware/error-handler.middleware.js";


const clientUrl = process.env.CLIENT_URL ?? "http://localhost:3001";
const app = express();
const PORT = process.env.PORT || 8081;

app.use(
    cors({
        origin: clientUrl,
        credentials: true,
    }),
);

app.all('/api/auth/{*any}', toNodeHandler(auth));

app.use(express.json());

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