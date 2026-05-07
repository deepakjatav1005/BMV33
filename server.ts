import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import Razorpay from "razorpay";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import multer from "multer";

console.log(">>> [BOOT] NODEJS PROCESS STARTED <<<");
console.log(">>> [BOOT] NODE VERSION:", process.version);
console.log(">>> [BOOT] CWD:", process.cwd());

dotenv.config({ override: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MySQL Connection Pool (Lazy initialization)
let pool: mysql.Pool;

async function startServer() {
  console.log(">>> [BOOT] Starting server initialization...");
  
  // Initialize pool inside startServer to ensure dotenv.config() has run
  pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: Number(process.env.MYSQL_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 30000,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  const app = express();
  const PORT = 3000;

  // Request logging middleware
  app.use((req, res, next) => {
    console.log(`> [REQ] ${req.method} ${req.url}`);
    next();
  });

  app.use(express.json());

  // Check for critical environment variables
  const requiredEnv = [
    'MYSQL_HOST',
    'MYSQL_USER',
    'MYSQL_PASSWORD',
    'MYSQL_DATABASE',
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

  // DB Test (Non-blocking)
  pool.getConnection().then(connection => {
    console.log(">>> [SUCCESS] MySQL Database connected successfully");
    connection.release();
  }).catch(err => {
    console.error(">>> [ERROR] MySQL Connection failed:", err);
  });

  // API routes
  app.get("/api/health", async (req, res) => {
    try {
      const connection = await pool.getConnection();
      connection.release();
      res.json({ 
        status: "ok", 
        database: "MySQL Connected",
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      res.status(503).json({ 
        status: "error", 
        database: "MySQL Disconnected",
        error: err.message,
        timestamp: new Date().toISOString()
      });
    }
  });

// Generic MySQL Query Proxy (Mimics Supabase logic)
  app.post("/api/db/:table/query", async (req, res) => {
    const { table } = req.params;
    const { method, filters, data, select } = req.body;
    console.log(`>>> [DB REQUEST] ${method} on ${table}`, { filters, select });

    try {
      // Auto-stringify arrays/objects for MySQL
      const prepareData = (d: any) => {
        const prepared = { ...d };
        for (const key in prepared) {
          if (prepared[key] !== null && typeof prepared[key] === 'object') {
            prepared[key] = JSON.stringify(prepared[key]);
          }
        }
        return prepared;
      };

      if (method === 'SELECT') {
        const { limit, order } = req.body;
        let sql = `SELECT ${select || '*'} FROM \`${table}\``;
        const params: any[] = [];
        
        if (filters && filters.length > 0) {
          sql += " WHERE " + filters.map((f: any) => {
            if (f.op === 'eq') {
              params.push(f.val);
              return `\`${f.col}\` = ?`;
            }
            if (f.op === 'neq') {
              params.push(f.val);
              return `\`${f.col}\` != ?`;
            }
            if (f.op === 'in') {
              params.push(...f.val);
              return `\`${f.col}\` IN (${f.val.map(() => '?').join(',')})`;
            }
            return "1=1";
          }).join(" AND ");
        }

        if (order && order.col) {
          sql += ` ORDER BY \`${order.col}\` ${order.ascending ? 'ASC' : 'DESC'}`;
        }

        if (limit) {
          sql += ` LIMIT ${Number(limit)}`;
        }

        const [rows]: any = await pool.query(sql, params);
        
        // Parse JSON strings back to objects
        const parsedRows = rows.map((row: any) => {
          const parsed = { ...row };
          for (const key in parsed) {
            const val = parsed[key];
            if (typeof val === 'string' && (val.startsWith('[') || val.startsWith('{'))) {
              try {
                parsed[key] = JSON.parse(val);
              } catch (e) { /* ignore */ }
            }
          }
          return parsed;
        });

        return res.json({ data: parsedRows, error: null });
      }

      if (method === 'INSERT') {
        const pd = prepareData(data);
        const columns = Object.keys(pd).map(c => `\`${c}\``).join(', ');
        const placeholders = Object.keys(pd).map(() => '?').join(', ');
        const values = Object.values(pd);
        
        const [result]: any = await pool.query(
          `INSERT INTO \`${table}\` (${columns}) VALUES (${placeholders})`,
          values
        );
        
        return res.json({ data: { id: result.insertId, ...data }, error: null });
      }

      if (method === 'UPDATE') {
        const pd = prepareData(data);
        const updates = Object.keys(pd).map(col => `\`${col}\` = ?`).join(', ');
        const values = Object.values(pd);
        
        let sql = `UPDATE \`${table}\` SET ${updates}`;
        const filterParams: any[] = [];

        if (filters && filters.length > 0) {
          sql += " WHERE " + filters.map((f: any) => {
            filterParams.push(f.val);
            return `\`${f.col}\` = ?`;
          }).join(" AND ");
        }

        await pool.query(sql, [...values, ...filterParams]);
        return res.json({ data: null, error: null });
      }

      if (method === 'UPSERT') {
        const pd = prepareData(data);
        const columns = Object.keys(pd).map(c => `\`${c}\``).join(', ');
        const placeholders = Object.keys(pd).map(() => '?').join(', ');
        const updates = Object.keys(pd).map(col => `\`${col}\` = VALUES(\`${col}\`)`).join(', ');
        const values = Object.values(pd);
        
        await pool.query(
          `INSERT INTO \`${table}\` (${columns}) VALUES (${placeholders}) ON DUPLICATE KEY UPDATE ${updates}`,
          [...values]
        );
        
        return res.json({ data: data, error: null });
      }

      if (method === 'DELETE') {
        let sql = `DELETE FROM \`${table}\``;
        const filterParams: any[] = [];

        if (filters && filters.length > 0) {
          sql += " WHERE " + filters.map((f: any) => {
            filterParams.push(f.val);
            return `\`${f.col}\` = ?`;
          }).join(" AND ");
        }

        await pool.query(sql, filterParams);
        return res.json({ data: null, error: null });
      }

      res.status(400).json({ error: "Unsupported method" });
    } catch (err: any) {
      console.error(`> [DB ERROR] ${table} ${method}:`, err);
      // Attempt to fix common column missing errors
      if (err.code === 'ER_BAD_FIELD_ERROR' || err.message.includes('Unknown column')) {
         console.warn(`>> DETECTED MISSING COLUMN in ${table}. Try adding it...`);
         const match = err.message.match(/Unknown column '(.+?)' in/);
         if (match && match[1]) {
           try {
             const col = match[1];
             await pool.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${col}\` LONGTEXT NULL`);
             console.log(`>>> [SUCCESS] AUTO-ADDED column ${col} to ${table}`);
             return res.status(500).json({ error: `Column ${col} was missing. I've added it. Please try again.` });
           } catch (alterErr) {
             console.error(`!!!! [MIGRATION FAILED] Could not add column ${match[1]}:`, alterErr);
           }
         }
      }
      res.status(500).json({ error: err.message });
    }
  });

  // File Upload Logic
  const uploadDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`>>> [STORAGE] Created upload directory at: ${uploadDir}`);
  }
  app.use("/uploads", express.static(uploadDir));

  // Modified storage to handle relative paths if we want to support subbundles
  const storage = (multer as any).diskStorage({
    destination: (req: any, file: any, cb: any) => {
      // Check if the request has a 'path' field to determine subdirectory
      const requestedPath = req.body.path || "";
      let targetDir = uploadDir;
      
      if (requestedPath) {
        // Extract directory part of the path
        const subDir = path.dirname(requestedPath);
        if (subDir !== ".") {
          targetDir = path.join(uploadDir, subDir);
          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
          }
        }
      }
      cb(null, targetDir);
    },
    filename: (req: any, file: any, cb: any) => {
      const requestedPath = req.body.path || "";
      if (requestedPath) {
        // Use the basename of the requested path
        cb(null, path.basename(requestedPath));
      } else {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
      }
    }
  });
  const upload = (multer as any)({ storage });

  app.post("/api/storage/upload", upload.single("file"), (req: any, res: any) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    
    // Get the relative path from the uploads directory
    const relativePath = path.relative(uploadDir, req.file.path).replace(/\\/g, '/');
    const publicUrl = `/uploads/${relativePath}`;
    
    res.json({ data: { path: relativePath, publicUrl }, error: null });
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
