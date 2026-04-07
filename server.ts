import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // Razorpay instance
  const razorpay = new Razorpay({
    key_id: process.env.VITE_RAZORPAY_KEY_ID || "",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "",
  });

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/razorpay/order", async (req, res) => {
    try {
      const { amount, currency, receipt, notes } = req.body;
      const options = {
        amount: amount * 100, // amount in the smallest currency unit (paise)
        currency,
        receipt,
        notes,
      };

      const order = await razorpay.orders.create(options);
      res.json(order);
    } catch (error) {
      console.error("Razorpay order error:", error);
      res.status(500).json({ error: "Failed to create Razorpay order" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`> Server is running on port ${PORT}`);
    console.log(`> Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`> Mode: ${process.env.NODE_ENV === 'production' ? 'Production' : 'Development (Vite Middleware)'}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
