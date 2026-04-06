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

const app = express();
const PORT = 3000;

// Trust proxy is important for apps behind a proxy like AI Studio's nginx
app.set('trust proxy', true);

// Supabase initialization
const supabaseUrl = process.env.SUPABASE_URL || "https://elitzchthcyjdbhgxpxk.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsaXR6Y2h0aGN5amRiaGd4cHhrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDkzMDI0NiwiZXhwIjoyMDkwNTA2MjQ2fQ.qBOU4TsvuaFco1BQB3D0diHLwa5k9-EI__7BB5t3kaA";

let supabase: any = null;
if (supabaseUrl && supabaseServiceKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log("[SERVER] Supabase client initialized with URL:", supabaseUrl);
    
    // Ensure 'images' bucket exists
    (async () => {
      try {
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();
        if (listError) {
          console.error("[SERVER] Error listing buckets:", listError);
          return;
        }
        
        const bucketExists = buckets?.some((b: any) => b.name === 'images');
        if (!bucketExists) {
          console.log("[SERVER] Creating 'images' bucket...");
          const { error: createError } = await supabase.storage.createBucket('images', {
            public: true,
            allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
          });
          if (createError) {
            console.error("[SERVER] Error creating bucket:", createError);
          } else {
            console.log("[SERVER] 'images' bucket created successfully");
          }
        } else {
          console.log("[SERVER] 'images' bucket already exists");
        }
      } catch (err) {
        console.error("[SERVER] Async bucket check failed:", err);
      }
    })();
  } catch (err) {
    console.error("[SERVER] Failed to initialize Supabase client:", err);
  }
} else {
  console.warn("[SERVER] Supabase environment variables missing. Uploads will fail.");
}

// Multer setup for memory storage
const multerInstance = (multer as any).default || multer;
const upload = multerInstance({ 
  storage: multerInstance.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit (more than client's 5MB to be safe)
  }
});

// Razorpay lazy initialization
let razorpay: Razorpay | null = null;
function getRazorpay() {
  if (!razorpay) {
    const key_id = process.env.VITE_RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!key_id || !key_secret) {
      throw new Error("Razorpay credentials (VITE_RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) are missing.");
    }
    
    razorpay = new Razorpay({
      key_id,
      key_secret,
    });
  }
  return razorpay;
}

app.use(express.json());

// API routes
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    console.log(`[SERVER] API Request: ${req.method} ${req.path}`);
  }
  next();
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", supabaseConfigured: !!supabase });
});

// Supabase Storage Upload Route
app.post("/api/upload", upload.single("file"), async (req, res) => {
  console.log(`[SERVER] Upload request received: ${req.file?.originalname} (${req.file?.size} bytes)`);
  try {
    if (!supabase) {
      console.error("[SERVER] Supabase not configured for upload");
      return res.status(503).json({ error: "Supabase is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Secrets." });
    }
    if (!req.file) {
      console.error("[SERVER] No file in upload request");
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { bucket, path: filePath } = req.body;
    console.log(`[SERVER] Uploading to bucket: ${bucket}, path: ${filePath}`);
    if (!bucket || !filePath) {
      console.error("[SERVER] Missing bucket or path in upload request body");
      return res.status(400).json({ error: "Bucket and path are required" });
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true,
      });

    if (error) {
      throw error;
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    res.json({
      message: "File uploaded successfully",
      data,
      publicUrl: publicUrlData.publicUrl,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Supabase Storage List Route
app.get("/api/files/:bucket", async (req, res) => {
  try {
    const { bucket } = req.params;
    const { data, error } = await supabase.storage.from(bucket).list();

    if (error) {
      throw error;
    }

    res.json({ files: data });
  } catch (error: any) {
    console.error("List error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Razorpay Order Creation Route
app.post("/api/razorpay/order", async (req, res) => {
  try {
    const rzp = getRazorpay();
    const { amount, currency, receipt, notes } = req.body;
    
    if (!amount || !currency) {
      return res.status(400).json({ error: "Amount and currency are required" });
    }

    const options = {
      amount: Math.round(amount * 100), // Convert to subunits (paise)
      currency,
      receipt,
      notes,
    };

    const order = await rzp.orders.create(options);
    res.json(order);
  } catch (error: any) {
    console.error("Razorpay order error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Catch-all for unmatched API routes
app.all("/api/*", (req, res) => {
  console.warn(`[SERVER] Unmatched API route: ${req.method} ${req.path}`);
  res.status(404).json({ error: `API route not found: ${req.method} ${req.path}` });
});

// Vite middleware for development
if (process.env.NODE_ENV !== "production") {
  console.log("[SERVER] Initializing Vite in development mode...");
  const vitePromise = createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });

  app.use(async (req, res, next) => {
    try {
      const vite = await vitePromise;
      vite.middlewares(req, res, next);
    } catch (err) {
      console.error("[SERVER] Vite middleware error:", err);
      next(err);
    }
  });
} else {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*all", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[SERVER] Express server started on port ${PORT}`);
  console.log(`[SERVER] NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
});
