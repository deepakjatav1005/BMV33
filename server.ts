import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import Razorpay from "razorpay";
import dotenv from "dotenv";

console.log("> Initializing server environment...");
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  console.log("> Starting server function...");
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // Global error handlers for debugging
  process.on("uncaughtException", (err) => {
    console.error("> Uncaught Exception:", err);
  });
  process.on("unhandledRejection", (reason, promise) => {
    console.error("> Unhandled Rejection at:", promise, "reason:", reason);
  });

  // Razorpay instance with ESM interop fix
  const RazorpayConstructor = (Razorpay as any).default || Razorpay;
  console.log("> Initializing Razorpay...");
  const razorpay = new RazorpayConstructor({
    key_id: process.env.VITE_RAZORPAY_KEY_ID || "",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "",
  });

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || 'development'
    });
  });

  app.get("/api/test", (req, res) => {
    res.send("Server is alive and reachable! Version 2.0");
  });

  app.post("/api/razorpay/order", async (req, res) => {
    console.log("> Received Razorpay order request");
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
      console.error("> Razorpay order error:", error);
      res.status(500).json({ error: "Failed to create Razorpay order" });
    }
  });

  const isProduction = process.env.NODE_ENV === "production";
  console.log(`> Mode: ${isProduction ? 'Production' : 'Development/Fallback'}`);

  if (isProduction) {
    const distPath = path.resolve(__dirname, "dist");
    console.log(`> Serving static files from: ${distPath}`);
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"), (err) => {
        if (err) {
          console.error("> Error sending index.html:", err);
          res.status(500).send("Server Error: index.html not found. Please ensure 'npm run build' was successful.");
        }
      });
    });
  } else {
    try {
      console.log("> Attempting to load Vite middleware...");
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      console.log("> Vite middleware enabled");
    } catch (e) {
      console.warn("> Vite not found, falling back to static serving");
      const distPath = path.resolve(__dirname, "dist");
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"), (err) => {
          if (err) {
            res.status(404).send("Frontend not built. Run 'npm run build' first.");
          }
        });
      });
    }
  }

  app.listen(PORT, () => {
    console.log(`> Server is running on port ${PORT}`);
    console.log(`> Access it at http://localhost:${PORT} or your domain`);
  });
}

console.log("> Calling startServer()...");
startServer().catch((err) => {
  console.error("> Failed to start server:", err);
  process.exit(1);
});
