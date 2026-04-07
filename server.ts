import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import Razorpay from "razorpay";
import dotenv from "dotenv";

console.log(">>> [BOOT] NODEJS PROCESS STARTED <<<");
console.log(">>> [BOOT] NODE VERSION:", process.version);
console.log(">>> [BOOT] CWD:", process.cwd());

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  console.log(">>> [BOOT] Starting server initialization...");
  
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Request logging middleware
  app.use((req, res, next) => {
    console.log(`> [REQ] ${req.method} ${req.url}`);
    next();
  });

  app.use(express.json());

  // Check for critical environment variables
  const requiredEnv = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET'
  ];
  
  console.log(">>> [BOOT] Checking environment variables...");
  requiredEnv.forEach(key => {
    if (!process.env[key]) {
      console.warn(`>>> [WARN] Missing environment variable: ${key}`);
    } else {
      console.log(`>>> [INFO] Found environment variable: ${key}`);
    }
  });

  // Global error handlers
  process.on("uncaughtException", (err) => {
    console.error(">>> [CRITICAL] Uncaught Exception:", err);
  });
  process.on("unhandledRejection", (reason, promise) => {
    console.error(">>> [CRITICAL] Unhandled Rejection at:", promise, "reason:", reason);
  });

  // Razorpay instance with ESM interop fix
  let razorpay: any = null;
  try {
    const RazorpayConstructor = (Razorpay as any).default || Razorpay;
    console.log(">>> [BOOT] Initializing Razorpay...");
    razorpay = new RazorpayConstructor({
      key_id: process.env.VITE_RAZORPAY_KEY_ID || "",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "",
    });
    console.log(">>> [BOOT] Razorpay initialized");
  } catch (err) {
    console.error(">>> [ERROR] Failed to initialize Razorpay:", err);
  }

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || 'development',
      uptime: process.uptime()
    });
  });

  app.get("/api/test", (req, res) => {
    res.send("Server is alive and reachable! Version 3.0");
  });

  app.post("/api/razorpay/order", async (req, res) => {
    console.log("> [API] Received Razorpay order request");
    if (!razorpay) {
      return res.status(500).json({ error: "Razorpay not initialized" });
    }
    try {
      const { amount, currency, receipt, notes } = req.body;
      const options = {
        amount: amount * 100,
        currency,
        receipt,
        notes,
      };

      const order = await razorpay.orders.create(options);
      res.json(order);
    } catch (error) {
      console.error("> [ERROR] Razorpay order error:", error);
      res.status(500).json({ error: "Failed to create Razorpay order" });
    }
  });

  const isProduction = process.env.NODE_ENV === "production";
  console.log(`>>> [BOOT] Mode: ${isProduction ? 'Production' : 'Development/Fallback'}`);

  if (isProduction) {
    const distPath = path.resolve(__dirname, "dist");
    console.log(`>>> [BOOT] Serving static files from: ${distPath}`);
    
    if (!fs.existsSync(distPath)) {
      console.error(`>>> [ERROR] DIST FOLDER NOT FOUND AT: ${distPath}`);
      console.log(">>> [INFO] Current directory contents:", fs.readdirSync(__dirname));
    }

    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      const indexPath = path.join(distPath, "index.html");
      if (!fs.existsSync(indexPath)) {
        console.error(`>>> [ERROR] index.html NOT FOUND AT: ${indexPath}`);
        return res.status(404).send("Frontend build missing (index.html not found).");
      }
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error("> [ERROR] Error sending index.html:", err);
          res.status(500).send("Server Error: Failed to send index.html");
        }
      });
    });
  } else {
    try {
      console.log(">>> [BOOT] Attempting to load Vite middleware...");
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      console.log(">>> [BOOT] Vite middleware enabled");
    } catch (e) {
      console.warn(">>> [WARN] Vite not found, falling back to static serving");
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

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`>>> [SUCCESS] Server is running on port ${PORT}`);
    console.log(`>>> [SUCCESS] Host: 0.0.0.0`);
    console.log(`>>> [SUCCESS] Local URL: http://localhost:${PORT}`);
  });

  server.on('error', (err: any) => {
    console.error(">>> [ERROR] Server failed to start:", err);
    if (err.code === 'EADDRINUSE') {
      console.error(`>>> [ERROR] Port ${PORT} is already in use`);
    }
  });
}

console.log(">>> [BOOT] Calling startServer()...");
startServer().catch((err) => {
  console.error(">>> [CRITICAL] Failed to start server:", err);
  process.exit(1);
});
