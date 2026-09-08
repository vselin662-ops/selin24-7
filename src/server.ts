import express from "express";
import dotenv from "dotenv";
import { Database } from "./db/Database.js";
import { SelinCore } from "./core/SelinCore.js";
import { MaxAdapter } from "./adapters/MaxAdapter.js";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

const db = new Database();
const core = new SelinCore(db);
const maxAdapter = new MaxAdapter(core);

app.get("/api/health", (req, res) => {
  res.json({ ok: true, status: "healthy", timestamp: new Date().toISOString() });
});

app.post("/api/webhooks/max", async (req, res) => {
  const signature = req.headers["x-max-signature"] as string | undefined;
  const result = await maxAdapter.handleWebhook(req.body, signature);
  if (!result.ok) {
    res.status(400).json(result);
  } else {
    res.status(200).json(result);
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Selin V2 Server running on port ${PORT}`);
});
