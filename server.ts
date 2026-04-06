import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import Razorpay from "razorpay";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Trust proxy is important for apps behind a proxy like AI Studio's nginx
  app.set('trust proxy', true);
  app.use(express.json());

  // Supabase initialization
  const supabaseUrl = process.env.SUPABASE_URL || "https://elitzchthcyjdbhgxpxk.supabase.co";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsaXR6Y2h0aGN5amRiaGd4cHhrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDkzMDI0NiwiZXhwIjoyMDkwNTA2MjQ2fQ.qBOU4TsvuaFco1BQB3D0diHLwa5k9-EI__7BB5t3kaA";

  let supabase: any = null;
  if (supabaseUrl && supabaseServiceKey) {
    try {
      supabase = createClient(supabaseUrl, supabaseServiceKey);
      console.log("[SERVER] Supabase client initialized");
    } catch (err) {
      console.error("[SERVER] Failed to initialize Supabase client:", err);
    }
  }

  // Multer setup for memory storage (handling ESM/CJS default export)
  const multerInstance = (multer as any).default || multer;
  const upload = multerInstance({ 
    storage: multerInstance.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }
  });

  // Razorpay lazy initialization
  let razorpay: Razorpay | null = null;
  function getRazorpay() {
    if (!razorpay) {
      const key_id = process.env.VITE_RAZORPAY_KEY_ID;
      const key_secret = process.env.RAZORPAY_KEY_SECRET;
      if (!key_id || !key_secret) {
        throw new Error("Razorpay credentials missing.");
      }
      razorpay = new Razorpay({ key_id, key_secret });
    }
    return razorpay;
  }

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", supabaseConfigured: !!supabase });
  });

  app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
      if (!supabase) return res.status(503).json({ error: "Supabase not configured" });
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });

      const { bucket, path: filePath } = req.body;
      if (!bucket || !filePath) return res.status(400).json({ error: "Bucket and path are required" });

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: true,
        });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
      res.json({ message: "File uploaded successfully", data, publicUrl: publicUrlData.publicUrl });
    } catch (error: any) {
      console.error("Upload error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/files/:bucket", async (req, res) => {
    try {
      const { bucket } = req.params;
      const { data, error } = await supabase.storage.from(bucket).list();
      if (error) throw error;
      res.json({ files: data });
    } catch (error: any) {
      console.error("List error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/razorpay/order", async (req, res) => {
    try {
      const rzp = getRazorpay();
      const { amount, currency, receipt, notes } = req.body;
      const order = await rzp.orders.create({
        amount: Math.round(amount * 100),
        currency,
        receipt,
        notes,
      });
      res.json(order);
    } catch (error: any) {
      console.error("Razorpay order error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware or static files
  if (process.env.NODE_ENV !== "production") {
    console.log("[SERVER] Starting Vite...");
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
    console.log(`[SERVER] Running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("[SERVER] Startup failed:", err);
  process.exit(1);
});
