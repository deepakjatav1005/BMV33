import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import Razorpay from "razorpay";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import multer from "multer";
import compression from "compression";

console.log(">>> [BOOT] NODEJS PROCESS STARTED <<<");
console.log(">>> [BOOT] NODE VERSION:", process.version);
console.log(">>> [BOOT] CWD:", process.cwd());

dotenv.config({ override: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MySQL Connection Pool (Lazy initialization)
let pool: mysql.Pool;
let isDbHealthy = true;
let lastDbCheck = 0;
let lastOutboundIp = "Checking...";
let lastDbError: any = null;
const DB_CHECK_INTERVAL = 5000; // Check every 5s if requested

// adding comment to check override issue

async function getOutboundIp() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (err) {
    console.error(">>> [NETWORK] Failed to fetch outbound IP");
    return "Error fetching IP";
  }
}

async function checkDbHealth(force = false) {
  const now = Date.now();
  
  if (force || lastOutboundIp === "Checking...") {
    lastOutboundIp = await getOutboundIp();
    console.log(">>> [NETWORK] Current Outbound IP:", lastOutboundIp);
  }

  if (!force && now - lastDbCheck < DB_CHECK_INTERVAL) return isDbHealthy;
  
  lastDbCheck = now;
  try {
    console.log(">>> [HEALTH CHECK] Testing MySQL connection...");
    // Use a quick query to test connection
    const connection = await pool.getConnection();
    await connection.query('SELECT 1');
    connection.release();
    console.log(">>> [HEALTH CHECK] Connection successful.");
    isDbHealthy = true;
    lastDbError = null;
    return true;
  } catch (err: any) {
    lastDbError = err;
    console.error(">>> [HEALTH CHECK] MySQL Connection ERROR:", err.message);
    if (err.code) console.error(">>> [HEALTH CHECK] ERROR CODE:", err.code);
    
    if (err.code === 'ETIMEDOUT') {
      console.error(">>> [CRITICAL ADVICE] Your MySQL host is not responding. This is 99% a Firewall/IP whitelisting issue.");
      console.error(">>> [ACTION REQUIRED] Go to your Hosting Panel (Hostinger/CPanel) -> Remote MySQL -> Add '%' as an allowed host.");
      console.error(">>> [CURRENT_HOST]:", process.env.MYSQL_HOST);
      console.error(">>> [WHITELIST THIS IP]:", lastOutboundIp);
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error(">>> [CRITICAL ADVICE] MySQL Access Denied. Your host is reachable, but rejecting the connection.");
      console.error(">>> [ACTION REQUIRED] Go to your Hosting Panel (Hostinger/CPanel) -> Remote MySQL -> Ensure user has access and '%' or '" + lastOutboundIp + "' is whitelisted.");
      console.error(">>> [WHITELIST THIS IP]:", lastOutboundIp);
    }
    
    console.warn(">>> [HEALTH CHECK] MySQL Database is unreachable. Enabling fail-fast mode.");
    isDbHealthy = false;
    return false;
  }
}

async function startServer() {
  console.log(">>> [BOOT] Starting server initialization...");
  
  // Validate configuration before initializing
  const mysqlHost = process.env.MYSQL_HOST || 'localhost';
  console.log(">>> [CONFIG] Host:", mysqlHost);
  console.log(">>> [CONFIG] Port:", process.env.MYSQL_PORT || '3306');
  console.log(">>> [CONFIG] User:", process.env.MYSQL_USER ? '********' : 'MISSING');
  console.log(">>> [CONFIG] Database:", process.env.MYSQL_DATABASE || 'MISSING');

  if (!process.env.MYSQL_HOST || !process.env.MYSQL_USER || !process.env.MYSQL_DATABASE) {
    console.error(">>> [CRITICAL] Missing MySQL configuration! Please check your environment variables.");
    console.error(`>>> [CONFIG] HOST: ${process.env.MYSQL_HOST ? 'SET' : 'MISSING'}`);
    console.error(`>>> [CONFIG] USER: ${process.env.MYSQL_USER ? 'SET' : 'MISSING'}`);
    console.error(`>>> [CONFIG] DB: ${process.env.MYSQL_DATABASE ? 'SET' : 'MISSING'}`);
    // We continue so the server starts, but it will be in fail-fast/offline mode
    isDbHealthy = false;
  }

  // Initialize pool inside startServer to ensure dotenv.config() has run
  console.log(">>> [BOOT] Initializing MySQL connection pool...");
  pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: Number(process.env.MYSQL_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 30000,   // Wait up to 30s for connection
    enableKeepAlive: true,    // Prevent idle disconnects
    keepAliveInitialDelay: 10000,
    decimalNumbers: true,    // Support decimal as numbers
    ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: false } : undefined
  });

  // Init health check with retry
  let retries = 3;
  const initDb = async () => {
    while (retries > 0) {
      const healthy = await checkDbHealth();
      if (healthy) {
        console.log(">>> [SUCCESS] MySQL Database connected and verified healthy.");
        // Initialize uploaded_files table for persistence across deployments
        try {
          await pool.query(`
            CREATE TABLE IF NOT EXISTS uploaded_files (
              \`path\` VARCHAR(500) PRIMARY KEY,
              \`base64_content\` LONGTEXT NOT NULL,
              \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
          `);
          console.log(">>> [STORAGE SETUP] Checked and verified uploaded_files table in database.");
        } catch (tableErr: any) {
          console.error(">>> [STORAGE SETUP ERROR] Failed to create or verify uploaded_files table:", tableErr.message);
        }
        break;
      }
      retries--;
      if (retries > 0) {
        console.log(`>>> [RETRY] DB connection failed. Retrying in 2s... (${retries} retries left)`);
        await new Promise(r => setTimeout(r, 2000));
      }
    }
    if (!isDbHealthy) {
      console.error(">>> [FAILURE] MySQL Database could not be reached after multiple attempts.");
      console.error(">>> [ADVICE] Check if your remote MySQL host (Hostinger/CPanel) has whitelisted '%' for Remote MySQL access.");
    }
  };
  
  initDb();
  
  const app = express();
  const PORT = 3000;

  // Gzip compression middleware
  app.use(compression());

  // Request logging middleware
  app.use((req, res, next) => {
    console.log(`> [REQ] ${req.method} ${req.url}`);
    next();
  });

  app.use(express.json());

  // Strict API logging and error barrier
  app.use("/api", (req, res, next) => {
    console.log(`>>> [API CALL] ${req.method} ${req.url}`);
    
    // Set standard JSON headers for all /api responses
    res.setHeader('Content-Type', 'application/json');
    next();
  });

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
    const force = req.query.force === 'true';
    try {
      const healthy = await checkDbHealth(force);
      const host = process.env.MYSQL_HOST || 'localhost';
      const maskedHost = host.length > 5 ? host.substring(0, 3) + '...' + host.substring(host.length - 2) : '***';
      
      if (!healthy) {
        const errorMsg = lastDbError ? lastDbError.message : "Database connection failed or timed out.";
        const errorCode = lastDbError ? lastDbError.code : "ETIMEDOUT";
        
        let troubleshooting = [
          "1. Double-check that '%' is whitelisted in Hostinger/CPanel Remote MySQL.",
          `2. If '%' doesn't work, try whitelisting specific outbound IP: ${lastOutboundIp}`,
          "3. Verify Host, Port, Database name, User, and Password in your configuration.",
          "4. Ensure your DB user has permissions for the specific database.",
          "5. Verify if your host requires SSL (some do). If so, set MYSQL_SSL=true."
        ];

        if (errorCode === 'ER_ACCESS_DENIED_ERROR') {
          troubleshooting = [
            "1. ACCESS DENIED: The connection succeeded but the credentials were rejected or the IP is blocked.",
            `2. Fix: Whitelist '%' or '${lastOutboundIp}' in your Hostinger/cPanel 'Remote MySQL' panel.`,
            "3. Double-check your MYSQL_USER and MYSQL_PASSWORD are correct.",
            "4. Make sure your user actually has ALL PRIVILEGES granted to the target database."
          ];
        }

        return res.status(503).json({
          status: "error",
          database: "MySQL Unreachable",
          host: maskedHost,
          outbound_ip: lastOutboundIp,
          error_message: errorMsg,
          error_code: errorCode,
          troubleshooting: troubleshooting,
          timestamp: new Date().toISOString()
        });
      }
      res.json({ 
        status: "ok", 
        database: "MySQL Connected",
        host: maskedHost,
        outbound_ip: lastOutboundIp,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      res.status(503).json({ 
        status: "error", 
        database: "MySQL Error",
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

    // Check health before trying
    if (!isDbHealthy) {
      console.warn(`>>> [FAIL-FAST] Skipping ${method} on ${table} due to known DB downtime.`);
      return res.status(503).json({ 
        error: "Database currently unreachable. Working in offline mode.",
        code: "DB_UNREACHABLE"
      });
    }

    try {
      // Auto-stringify arrays/objects for MySQL
      const prepareData = (d: any) => {
        if (!d) return d;
        const prepared = { ...d };
        for (const key in prepared) {
          if (prepared[key] !== null && typeof prepared[key] === 'object') {
            prepared[key] = JSON.stringify(prepared[key]);
          }
        }
        return prepared;
      };

      if (method === 'SELECT') {
        const { limit, order, count, head } = req.body;
        const isHead = !!head;
        const countQuery = !!count;
        
        let sql = "SELECT ";
        if (countQuery || isHead) {
          sql += "COUNT(*) as aggregate_count FROM ";
        } else {
          sql += (select || "*") + " FROM ";
        }
        sql += `\`${table}\``;
        const params: any[] = [];
        
        if (filters && filters.length > 0) {
          const whereClauses = filters.map((f: any) => {
            if (f.op === 'or') {
              const parts = f.val.split(',');
              const orClauses = parts.map((part: string) => {
                const pieces = part.split('.');
                const col = pieces[0];
                const op = pieces[1];
                const val = pieces.slice(2).join('.');
                params.push(val);
                const mysqlOp = op === 'eq' ? '=' : 
                               op === 'neq' ? '!=' :
                               op === 'gt' ? '>' :
                               op === 'gte' ? '>=' :
                               op === 'lt' ? '<' :
                               op === 'lte' ? '<=' :
                               op === 'like' ? 'LIKE' : '=';
                return `\`${col}\` ${mysqlOp} ?`;
              });
              return `(${orClauses.join(' OR ')})`;
            }
            if (f.op === 'eq') {
              params.push(f.val);
              return `\`${f.col}\` = ?`;
            }
            if (f.op === 'neq') {
              params.push(f.val);
              return `\`${f.col}\` != ?`;
            }
            if (f.op === 'gt') {
              params.push(f.val);
              return `\`${f.col}\` > ?`;
            }
            if (f.op === 'gte') {
              params.push(f.val);
              return `\`${f.col}\` >= ?`;
            }
            if (f.op === 'lt') {
              params.push(f.val);
              return `\`${f.col}\` < ?`;
            }
            if (f.op === 'lte') {
              params.push(f.val);
              return `\`${f.col}\` <= ?`;
            }
            if (f.op === 'like') {
              params.push(f.val);
              return `\`${f.col}\` LIKE ?`;
            }
            if (f.op === 'in') {
              if (!Array.isArray(f.val) || f.val.length === 0) return "1=0";
              params.push(...f.val);
              return `\`${f.col}\` IN (${f.val.map(() => '?').join(',')})`;
            }
            return "1=1";
          });
          sql += " WHERE " + whereClauses.join(" AND ");
        }

        if (order && order.col) {
          sql += ` ORDER BY \`${order.col}\` ${order.ascending ? 'ASC' : 'DESC'}`;
        }

        if (limit) {
          sql += ` LIMIT ${Number(limit)}`;
        }

        if (countQuery || isHead) {
          console.log(`>>> [SQL] COUNT on ${table}`);
          const [rows]: any = await pool.query(sql, params);
          const countValue = rows[0]?.aggregate_count || 0;
          
          return res.json({ 
            data: isHead ? null : [], 
            count: countValue, 
            error: null 
          });
        }

        console.log(`>>> [SQL] SELECT on ${table}`);
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

        return res.json({ data: parsedRows, count: parsedRows.length, error: null });
      }

      if (method === 'INSERT') {
        const items = Array.isArray(data) ? data : [data];
        if (items.length === 0) return res.json({ data: [], error: null });

        // Assume all items have the same keys (standard for bulk inserts)
        const sample = items[0];
        const columns = Object.keys(sample).map(c => `\`${c}\``).join(', ');
        const placeholders = `(${Object.keys(sample).map(() => '?').join(', ')})`;
        const allPlaceholders = items.map(() => placeholders).join(', ');
        
        const allValues: any[] = [];
        items.forEach(item => {
          const prepared = prepareData(item);
          Object.keys(sample).forEach(key => {
            allValues.push(prepared[key]);
          });
        });

        console.log(`>>> [SQL] INSERT into ${table} (${items.length} items)`);
        const [result]: any = await pool.query(
          `INSERT INTO \`${table}\` (${columns}) VALUES ${allPlaceholders}`,
          allValues
        );
        
        return res.json({ data: items.length === 1 ? { id: result.insertId, ...items[0] } : items, error: null });
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

        console.log(`>>> [SQL] UPDATE on ${table}`);
        await pool.query(sql, [...values, ...filterParams]);
        return res.json({ data: null, error: null });
      }

      if (method === 'UPSERT') {
        const items = Array.isArray(data) ? data : [data];
        if (items.length === 0) return res.json({ data: [], error: null });

        const sample = items[0];
        const columns = Object.keys(sample).map(c => `\`${c}\``).join(', ');
        const placeholders = `(${Object.keys(sample).map(() => '?').join(', ')})`;
        const allPlaceholders = items.map(() => placeholders).join(', ');
        const updates = Object.keys(sample).map(col => `\`${col}\` = VALUES(\`${col}\`)`).join(', ');
        
        const allValues: any[] = [];
        items.forEach(item => {
          const prepared = prepareData(item);
          Object.keys(sample).forEach(key => {
            allValues.push(prepared[key]);
          });
        });

        console.log(`>>> [SQL] UPSERT on ${table} (${items.length} items)`);
        await pool.query(
          `INSERT INTO \`${table}\` (${columns}) VALUES ${allPlaceholders} ON DUPLICATE KEY UPDATE ${updates}`,
          allValues
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
      
      // Update health if we got a connection error
      if (err.code === 'ETIMEDOUT' || err.code === 'ECONNREFUSED' || err.message.includes('connect')) {
        isDbHealthy = false;
        lastDbCheck = Date.now(); // Reset check timer
        console.error(">>> [CONNECTION ADVICE] If you are using Hostinger or CPanel, please ensure you have whitelisted '%' in the 'Remote MySQL' settings.");
      }

      // Attempt to fix common column/table errors
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

      if (err.code === 'ER_NO_SUCH_TABLE' || err.message.includes("doesn't exist")) {
        console.error(`>>> [CRITICAL] Table '${table}' is missing in your MySQL database.`);
        return res.status(404).json({ 
          error: `Table '${table}' does not exist. Please execute the SQL script provided in App.tsx (top comments) in your PHPMyAdmin/MySQL editor.`,
          code: "TABLE_MISSING"
        });
      }

      res.status(500).json({ error: err.message });
    }
  });

  // File Upload Logic
  // Use environment variable UPLOAD_DIR if available (for persistent storage outside app root)
  const uploadDir = path.resolve(process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads"));
  
  if (!fs.existsSync(uploadDir)) {
    try {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log(`>>> [STORAGE] Created/Verified upload directory at: ${uploadDir}`);
    } catch (err) {
      console.error(`>>> [STORAGE ERROR] Could not create upload directory at ${uploadDir}:`, err);
    }
  } else {
    console.log(`>>> [STORAGE] Using upload directory: ${uploadDir}`);
  }

  // Auto-healing middleware for uploads: if a file requested under /uploads is missing on disk
  // (e.g. after a new deployment/rebuild on ephemeral server container), we retrieve it from the
  // uploaded_files database table, write it back to local disk, and serve it.
  app.use("/uploads", async (req, res, next) => {
    try {
      const decodedUrl = decodeURIComponent(req.path);
      const relativePath = decodedUrl.replace(/^\//, '');
      const fullPath = path.join(uploadDir, relativePath);

      // If file exists on disk, let express.static serve it
      if (fs.existsSync(fullPath)) {
        return next();
      }

      // If database is unhealthy or not loaded, we can't fetch from DB
      if (!isDbHealthy || !pool) {
        return next();
      }

      console.log(`>>> [STORAGE AUTO-HEAL] File missing on disk: ${relativePath}. Querying DB...`);
      const [rows]: any = await pool.query(
        "SELECT `base64_content` FROM uploaded_files WHERE \`path\` = ?",
        [relativePath]
      );

      if (rows && rows.length > 0) {
        const base64Content = rows[0].base64_content;
        const fileBuffer = Buffer.from(base64Content, 'base64');

        // Ensure parent directory exists
        const fileDir = path.dirname(fullPath);
        if (!fs.existsSync(fileDir)) {
          fs.mkdirSync(fileDir, { recursive: true });
        }

        // Write file back to disk so next requests are served instantly by express.static
        await fs.promises.writeFile(fullPath, fileBuffer);
        console.log(`>>> [STORAGE AUTO-HEAL] Restored ${relativePath} from database to disk.`);

        // Determine correct Content-Type
        const ext = path.extname(relativePath).toLowerCase();
        let contentType = 'application/octet-stream';
        if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
        else if (ext === '.png') contentType = 'image/png';
        else if (ext === '.gif') contentType = 'image/gif';
        else if (ext === '.svg') contentType = 'image/svg+xml';
        else if (ext === '.webp') contentType = 'image/webp';
        else if (ext === '.pdf') contentType = 'application/pdf';
        else if (ext === '.mp4') contentType = 'video/mp4';

        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=2592000, must-revalidate');
        return res.send(fileBuffer);
      } else {
        console.log(`>>> [STORAGE AUTO-HEAL] File not found in DB: ${relativePath}`);
      }
    } catch (err: any) {
      console.error(`>>> [STORAGE AUTO-HEAL ERROR] Failed to recover ${req.path} from DB:`, err.message);
    }
    next();
  });

  // Serve uploads. 
  // IMPORTANT: On production VPS, it is better to point UPLOAD_DIR outside your deploy/build folder 
  // so that new uploads don't wipe out your existing files.
  app.use("/uploads", express.static(uploadDir, {
    maxAge: '30d',
    etag: true,
    setHeaders: (res, filePath) => {
      res.setHeader('Cache-Control', 'public, max-age=2592000, must-revalidate');
    }
  }));

  // ESM Interop for multer
  const multerLib = (multer as any).default || multer;

  // Modified storage to handle relative paths if we want to support subbundles
  const storage = multerLib.diskStorage({
    destination: (req: any, file: any, cb: any) => {
      let requestedPath = req.body.path || "";
      let targetDir = uploadDir;
      
      if (requestedPath) {
        // Strip potential 'uploads/' or '/uploads/' prefix
        requestedPath = requestedPath.replace(/^(\/?uploads\/)/, '');
        
        const subDir = path.dirname(requestedPath);
        if (subDir !== "." && subDir !== "/" && subDir !== "\\") {
          targetDir = path.resolve(uploadDir, subDir);
          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
          }
        }
      }
      cb(null, targetDir);
    },
    filename: (req: any, file: any, cb: any) => {
      let requestedPath = req.body.path || "";
      if (requestedPath) {
        requestedPath = requestedPath.replace(/^(\/?uploads\/)/, '');
        cb(null, path.basename(requestedPath));
      } else {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
      }
    }
  });
  const uploadMiddleware = multerLib({ storage });

  app.post("/api/storage/upload", uploadMiddleware.single("file"), async (req: any, res: any) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    
    // Get the relative path from the uploads directory
    const relativePath = path.relative(uploadDir, req.file.path).replace(/\\/g, '/');
    const publicUrl = `/uploads/${relativePath}`;
    
    console.log(`>>> [STORAGE] Uploaded: ${relativePath} -> ${publicUrl}`);

    // Back up to the MySQL database to persist across new deployments
    if (isDbHealthy && pool) {
      try {
        const fileBuffer = await fs.promises.readFile(req.file.path);
        const base64Content = fileBuffer.toString('base64');
        await pool.query(
          "INSERT INTO uploaded_files (`path`, `base64_content`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `base64_content` = ?, `created_at` = CURRENT_TIMESTAMP",
          [relativePath, base64Content, base64Content]
        );
        console.log(`>>> [STORAGE SYNC] Successfully backed up ${relativePath} to database.`);
      } catch (syncErr: any) {
        console.error(`>>> [STORAGE SYNC ERROR] Failed to back up ${relativePath} to DB:`, syncErr.message);
      }
    } else {
      console.warn(`>>> [STORAGE SYNC SKIP] Database not healthy or pool uninitialized. Skipping database backup for ${relativePath}.`);
    }
    
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
  
  // API 404 Handler (Should be after all API routes but BEFORE Vite/Static fallback)
  app.all("/api/*", (req, res) => {
    console.warn(`>>> [API 404] Route not found: ${req.method} ${req.url}`);
    res.status(404).json({ error: "API route not found", path: req.url });
  });

  const distPath = path.resolve(__dirname, "dist");
  const isProduction = process.env.NODE_ENV === "production" || fs.existsSync(distPath);
  console.log(`>>> [BOOT] Mode: ${isProduction ? 'Production' : 'Development/Fallback'}`);

  if (isProduction) {
    console.log(`>>> [BOOT] Serving static files from: ${distPath}`);
    
    if (!fs.existsSync(distPath)) {
      console.error(`>>> [ERROR] DIST FOLDER NOT FOUND AT: ${distPath}`);
      console.log(">>> [INFO] Current directory contents:", fs.readdirSync(__dirname));
    }

    app.use(express.static(distPath, {
      maxAge: '1y',
      etag: true,
      immutable: true,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        } else {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
      }
    }));
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
      app.use(express.static(distPath, {
        maxAge: '1y',
        etag: true,
        immutable: true,
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          } else {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          }
        }
      }));
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
