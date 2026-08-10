import express from "express";
import "dotenv/config";


const app = express();
const PORT = process.env.PORT || 8081;

app.use(express.json());

app.get("/", (_req, res) => {
    res.send("Hello World");
});

app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});