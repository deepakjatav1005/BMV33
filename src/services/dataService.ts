
import { createClient } from '@supabase/supabase-js';
import { DEFAULT_MOCK_DATA } from '../constants';

const STORAGE_KEY = 'BEST_VANUE_OPTION_DATA_V1';
const SESSION_KEY = 'APP_SESSION';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Add fallback check for common deployment mistakes (missing VITE_ prefix)
const rawUrl = supabaseUrl && supabaseUrl !== 'undefined' ? supabaseUrl : undefined;
const rawKey = supabaseAnonKey && supabaseAnonKey !== 'undefined' ? supabaseAnonKey : undefined;

// Initialize real Supabase if keys are present
let supabaseInstance: any = null;
let forceOffline = false;

const initSupabase = () => {
  if (rawUrl && rawKey && rawUrl.startsWith('http')) {
    try {
      // Validate URL format
      new URL(rawUrl);
      
      return createClient(rawUrl, rawKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
    } catch (err) {
      console.error('❌ Invalid Supabase URL configuration:', err);
      return null;
    }
  }
  return null;
};

supabaseInstance = initSupabase();

export const setOfflineMode = (offline: boolean) => {
  forceOffline = offline;
  if (offline) {
    console.warn('📡 App is now running in OFFLINE MODE (Mock Data)');
  } else {
    console.log('📡 App is attempting to run in ONLINE MODE (Supabase)');
  }
};

export const getIsOffline = () => forceOffline || !supabaseInstance;

export const checkConnection = async () => {
  if (!supabaseInstance || forceOffline) return false;
  try {
    const { error } = await supabaseInstance.from('users').select('count', { count: 'exact', head: true });
    if (error) {
      // Treat network errors as disconnection
      if (error.message?.includes('fetch') || error.message?.includes('Network')) {
        return false;
      }
      return false;
    }
    return true;
  } catch (err) {
    console.error('[DATABASE] Connection check error:', err);
    return false;
  }
};

if (supabaseInstance) {
  console.log('✅ Supabase initialized successfully.');
  checkConnection().then(connected => {
    if (connected) console.log('📡 Live connection to Supabase active.');
    else console.error('❌ Supabase Connection Failed (Network or Keys)');
  });
} else {
  console.warn('⚠️ Supabase URL or Anon Key is missing or invalid!');
  console.warn('VITE_SUPABASE_URL:', supabaseUrl ? 'Defined' : 'MISSING');
  console.warn('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Defined' : 'MISSING');
  console.info('Falling back to LocalStorage Mock Data Service.');
  
  if (typeof window !== 'undefined') {
    // Expose keys status for debugging
    (window as any).__SUPABASE_DEBUG__ = {
      urlPresent: !!supabaseUrl,
      keyPresent: !!supabaseAnonKey,
      hostname: window.location.hostname,
      protocol: window.location.protocol
    };
  }
}

const getLocalData = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_MOCK_DATA));
  return DEFAULT_MOCK_DATA;
};

const saveLocalData = (data: any) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const mockDataService = {
  from: (table: string) => {
    const getTableData = () => getLocalData()[table] || [];
    
    const createQueryBuilder = (data: any[], options: any = {}) => {
      const builder: any = {
        data,
        select: (cols: string, opts: any = {}) => createQueryBuilder(data, opts),
        order: () => builder,
        limit: (n: number) => createQueryBuilder(data.slice(0, n), options),
        eq: (col: string, val: any) => createQueryBuilder(data.filter(item => item[col] === val), options),
        neq: (col: string, val: any) => createQueryBuilder(data.filter(item => item[col] !== val), options),
        in: (col: string, vals: any[]) => createQueryBuilder(data.filter(item => vals.includes(item[col])), options),
        or: (query: string) => builder, // Mock or
        single: () => Promise.resolve({ data: data[0] || null, error: null }),
        maybeSingle: () => Promise.resolve({ data: data[0] || null, error: null }),
        then: (onfulfilled: any) => {
          const result: any = { data, error: null };
          if (options.count === 'exact') result.count = data.length;
          return Promise.resolve(result).then(onfulfilled);
        }
      };
      return builder;
    };

    return {
      select: (cols: string, opts: any = {}) => createQueryBuilder(getTableData(), opts),
      insert: (newData: any) => {
        const data = getLocalData();
        const items = Array.isArray(newData) ? newData : [newData];
        const insertedItems = items.map(item => ({
          id: Math.random().toString(36).substr(2, 9),
          created_at: new Date().toISOString(),
          ...item
        }));
        if (data[table]) {
          data[table].push(...insertedItems);
          saveLocalData(data);
        }
        return Promise.resolve({ data: insertedItems, error: null });
      },
      update: (updateData: any) => {
        const updateInTable = (predicate: (item: any) => boolean) => {
          const data = getLocalData();
          if (data[table]) {
            data[table] = data[table].map((item: any) => predicate(item) ? { ...item, ...updateData, updated_at: new Date().toISOString() } : item);
            saveLocalData(data);
          }
          return Promise.resolve({ data: null, error: null });
        };

        return {
          eq: (col: string, val: any) => updateInTable((item) => item[col] === val),
          neq: (col: string, val: any) => updateInTable((item) => item[col] !== val),
          match: (query: any) => updateInTable((item) => Object.entries(query).every(([k, v]) => item[k] === v))
        };
      },
      delete: () => {
        const deleteFromTable = (predicate: (item: any) => boolean) => {
          const data = getLocalData();
          if (data[table]) {
            data[table] = data[table].filter((item: any) => !predicate(item));
            saveLocalData(data);
          }
          return Promise.resolve({ data: null, error: null });
        };

        return {
          eq: (col: string, val: any) => deleteFromTable((item) => item[col] === val),
          neq: (col: string, val: any) => deleteFromTable((item) => item[col] !== val)
        };
      },
      upsert: (upsertData: any) => {
        const data = getLocalData();
        const items = Array.isArray(upsertData) ? upsertData : [upsertData];
        if (data[table]) {
          items.forEach(item => {
            const index = data[table].findIndex((i: any) => i.id === item.id);
            if (index > -1) data[table][index] = { ...data[table][index], ...item, updated_at: new Date().toISOString() };
            else data[table].push({ id: Math.random().toString(36).substr(2, 9), created_at: new Date().toISOString(), ...item });
          });
          saveLocalData(data);
        }
        return Promise.resolve({ data: items, error: null });
      }
    };
  },
  channel: (name: string) => {
    const channelObj: any = {
      on: (event: string, config: any, callback: any) => channelObj,
      subscribe: () => ({ 
        unsubscribe: () => {} 
      })
    };
    return channelObj;
  },
  removeChannel: (channel: any) => {},
  storage: {
    from: (bucket: string) => ({
      upload: (path: string, file: any, options?: any) => Promise.resolve({ data: { path }, error: null }),
      getPublicUrl: (path: string) => ({ data: { publicUrl: `https://picsum.photos/seed/${path.replace(/\//g, '_')}/1200/1200` } })
    })
  },
  auth: {
    getUser: () => {
      const session = localStorage.getItem(SESSION_KEY);
      return Promise.resolve({ data: { user: session ? JSON.parse(session) : null }, error: null });
    },
    getSession: () => {
      const session = localStorage.getItem(SESSION_KEY);
      return Promise.resolve({ data: { session: session ? { user: JSON.parse(session) } : null }, error: null });
    },
    onAuthStateChange: (callback: any) => {
      const session = localStorage.getItem(SESSION_KEY);
      callback('SIGNED_IN', session ? { user: JSON.parse(session) } : null);
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
    signInWithPassword: ({ email, password }: any) => {
      const data = getLocalData();
      const user = data.users.find((u: any) => u.email === email && u.password === password);
      if (user) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
        return Promise.resolve({ data: { user, session: { user } }, error: null });
      }
      return Promise.resolve({ data: { user: null, session: null }, error: { message: 'Invalid credentials' } });
    },
    signOut: () => {
      localStorage.removeItem(SESSION_KEY);
      return Promise.resolve({ error: null });
    },
    signUp: ({ email, password, options }: any) => {
      const data = getLocalData();
      const newUser = { 
        id: Math.random().toString(36).substr(2, 9), 
        uid: Math.random().toString(36).substr(2, 9),
        email, 
        password, 
        created_at: new Date().toISOString(),
        ...options?.data 
      };
      data.users.push(newUser);
      saveLocalData(data);
      localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
      return Promise.resolve({ data: { user: newUser, session: { user: newUser } }, error: null });
    }
  }
};

// Helper to generate a UUID v4
export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const mysqlDataService = {
  from: (table: string) => {
    const filters: any[] = [];
    let selectVal = '*';
    let limitVal: number | null = null;
    let orderVal: any = null;

    const execute = async (method: string, data?: any) => {
      try {
        const response = await fetch(`/api/db/${table}/query`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            method, 
            filters, 
            data, 
            select: selectVal,
            limit: limitVal,
            order: orderVal
          })
        });

        // Handle non-OK responses from the server
        if (!response.ok) {
          const errorResult = await response.json().catch(() => ({ error: 'Unknown server error' }));
          
          // Detect database connection errors (like ETIMEDOUT, ECONNREFUSED)
          const dbErrorKeywords = ['connect', 'ETIMEDOUT', 'ECONNREFUSED', 'ER_ACCESS_DENIED_ERROR', 'database', 'MySQL Disconnected'];
          const isDbError = typeof errorResult.error === 'string' && 
                          dbErrorKeywords.some(k => errorResult.error.toLowerCase().includes(k.toLowerCase()));

          if (isDbError || response.status === 503) {
            console.warn(`📡 Detected MySQL Connection Failure (${errorResult.error}). Switching to OFFLINE MOCK DATA.`);
            setOfflineMode(true);
            return handleOfflineFallback(method, data);
          }
          
          throw new Error(errorResult.error || `Server returned ${response.status}`);
        }

        const result = await response.json();
        if (result.error && typeof result.error === 'string') {
          result.error = { message: result.error };
        }
        return result;
      } catch (err: any) {
        console.error(`[MYSQL CLIENT ERROR] ${table} ${method}:`, err);
        // Automatically switch to offline mode on fetch failures (e.g. backend down or no network)
        if (err.message === 'Failed to fetch' || err.name === 'TypeError' || err.message.includes('network')) {
          console.warn('⚠️ Detected network failure. Switching to OFFLINE MOCK DATA.');
          setOfflineMode(true);
          return handleOfflineFallback(method, data);
        }
        return { data: null, error: { message: err.message || String(err) } };
      }
    };

    // Helper for consistency in fallback
    const handleOfflineFallback = (method: string, data?: any) => {
      const mockTable = mockDataService.from(table);
      if (method === 'SELECT') {
        const builder = mockTable.select(selectVal);
        if (limitVal) builder.limit(limitVal);
        filters.forEach(f => {
          if (f.op === 'eq') builder.eq(f.col, f.val);
          else if (f.op === 'neq') builder.neq(f.col, f.val);
          else if (f.op === 'in') builder.in(f.col, f.val);
        });
        return builder;
      }
      if (method === 'INSERT') return mockTable.insert(data);
      if (method === 'UPDATE') {
        const query: any = {};
        filters.forEach(f => { if (f.op === 'eq') query[f.col] = f.val; });
        return mockTable.update(data).match(query);
      }
      if (method === 'DELETE') {
         const col = filters[0]?.col;
         const val = filters[0]?.val;
         return (mockTable as any).delete().eq(col, val);
      }
      if (method === 'UPSERT') return mockTable.upsert(data);
      return { data: null, error: { message: 'Mock fallback incomplete' } };
    };

    const builder: any = {
      select: (cols: string = '*') => {
        selectVal = cols;
        return builder;
      },
      order: (col: string, { ascending }: any = { ascending: true }) => {
        orderVal = { col, ascending };
        return builder;
      },
      limit: (n: number) => {
        limitVal = n;
        return builder;
      },
      eq: (col: string, val: any) => {
        filters.push({ col, op: 'eq', val });
        return builder;
      },
      neq: (col: string, val: any) => {
        filters.push({ col, op: 'neq', val });
        return builder;
      },
      in: (col: string, vals: any[]) => {
        filters.push({ col, op: 'in', val: vals });
        return builder;
      },
      single: async () => {
        const res = await execute('SELECT');
        return { data: res.data?.[0] || null, error: res.error };
      },
      maybeSingle: async () => {
        const res = await execute('SELECT');
        return { data: res.data?.[0] || null, error: res.error };
      },
      then: async (onfulfilled: any) => {
        const res = await execute('SELECT');
        return Promise.resolve(res).then(onfulfilled);
      },
      insert: (data: any) => execute('INSERT', data),
      upsert: (data: any) => execute('UPSERT', data),
      update: (data: any) => {
        const updateBuilder = {
          eq: (col: string, val: any) => {
            filters.push({ col, op: 'eq', val });
            return execute('UPDATE', data);
          },
          match: (query: any) => {
            Object.entries(query).forEach(([col, val]) => {
              filters.push({ col, op: 'eq', val });
            });
            return execute('UPDATE', data);
          }
        };
        return updateBuilder;
      },
      delete: () => {
        const deleteBuilder = {
          eq: (col: string, val: any) => {
            filters.push({ col, op: 'eq', val });
            return execute('DELETE');
          }
        };
        return deleteBuilder;
      }
    };

    return builder;
  },
  channel: (name: string) => {
    const channelObj: any = {
      on: (event: string, config: any, callback: any) => channelObj,
      subscribe: () => ({ 
        unsubscribe: () => {} 
      })
    };
    return channelObj;
  },
  removeChannel: (channel: any) => {},
  storage: {
    from: (bucket: string) => ({
      upload: async (path: string, file: any, options?: any) => {
        try {
          const formData = new FormData();
          formData.append('path', path);
          formData.append('bucket', bucket);
          formData.append('file', file);

          const response = await fetch('/api/storage/upload', {
            method: 'POST',
            body: formData
          });
          const result = await response.json();
          
          if (result.data) {
            // Cache by original path requested and the returned filename
            (window as any)[`__url_${path}`] = result.data.publicUrl;
            (window as any)[`__url_${result.data.path}`] = result.data.publicUrl;
          }
          
          return result;
        } catch (err: any) {
          console.error('[STORAGE UPLOAD ERROR]:', err);
          return { data: null, error: err };
        }
      },
      getPublicUrl: (path: string) => {
        if (!path) return { data: { publicUrl: '' } };

        // If it's already a full URL or relative path handled by browser
        if (path.startsWith('http') || path.startsWith('/') || path.startsWith('data:')) {
          // Fix broken localhost URLs from previous versions
          if (path.includes('localhost:3000') || path.includes('127.0.0.1:3000')) {
            const relativePart = path.split('/uploads/')[1];
            if (relativePart) {
              return { data: { publicUrl: `/uploads/${relativePart}` } };
            }
          }
          return { data: { publicUrl: path } };
        }

        const cachedUrl = (window as any)[`__url_${path}`];
        if (cachedUrl) return { data: { publicUrl: cachedUrl } };
        
        // Derive from current location. Ensure path doesn't have duplicate slashes
        const baseUrl = window.location.origin;
        const cleanPath = path.startsWith('/') ? path.slice(1) : path;
        
        // If the path contains 'uploads/', it's already structured
        if (cleanPath.includes('uploads/')) {
          return { data: { publicUrl: `${baseUrl}/${cleanPath}` } };
        }
        
        return { data: { publicUrl: `${baseUrl}/uploads/${cleanPath}` } };
      }
    })
  },
  auth: {
    // MySQL backend will handle auth mapping via Firebase if needed,
    // but for now we'll keep the local auth session pattern if preferred.
    getUser: async () => {
      const session = localStorage.getItem(SESSION_KEY);
      return { data: { user: session ? JSON.parse(session) : null }, error: null };
    },
    getSession: async () => {
      const session = localStorage.getItem(SESSION_KEY);
      return { data: { session: session ? { user: JSON.parse(session) } : null }, error: null };
    },
    onAuthStateChange: (callback: any) => {
      const session = localStorage.getItem(SESSION_KEY);
      callback('SIGNED_IN', session ? { user: JSON.parse(session) } : null);
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
    signInWithPassword: async ({ email, password }: any) => {
      if (forceOffline) {
        const user = DEFAULT_MOCK_DATA.users.find(u => u.email === email && u.password === password);
        if (user) {
          localStorage.setItem(SESSION_KEY, JSON.stringify(user));
          return Promise.resolve({ data: { user, session: { user } }, error: null });
        }
        return Promise.resolve({ data: { user: null, session: null }, error: { message: 'Invalid credentials' } });
      }

      const { data, error } = await mysqlDataService.from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .maybeSingle();

      if (data) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(data));
        return { data: { user: data, session: { user: data } }, error: null };
      }
      return { data: { user: null, session: null }, error: { message: error?.message || error || 'Invalid credentials' } };
    },
    signOut: async () => {
      localStorage.removeItem(SESSION_KEY);
      return { error: null };
    },
    signUp: async ({ email, password, options }: any) => {
      const newUser = { 
        uid: generateUUID(),
        email, 
        password, 
        created_at: new Date().toISOString(),
        ...options?.data 
      };
      if (forceOffline) {
        const data = getLocalData();
        data.users.push(newUser);
        saveLocalData(data);
        localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
        return Promise.resolve({ data: { user: newUser, session: { user: newUser } }, error: null });
      }
      
      const { error } = await mysqlDataService.from('users').insert(newUser);
      if (!error) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
        return { data: { user: newUser, session: { user: newUser } }, error: null };
      }
      return { data: { user: null, session: null }, error };
    }
  }
};

export const supabase = null; // No longer using direct Supabase
export const isSupabaseConnected = true; // Pretend we are connected to our new MySQL backend

// Proxy the dataService to allow runtime switching between MySQL/Mock modes
export const dataService = new Proxy({} as any, {
  get: (_, prop) => {
    const activeService = forceOffline ? mockDataService : mysqlDataService;
    return (activeService as any)[prop];
  }
});

export const resolveUrl = (path: string | null | undefined): string | null => {
  if (!path || path === '') return null;
  // Ensure we don't double-resolve if it's already a full URL or relative path
  if (path.startsWith('http') || path.startsWith('/') || path.startsWith('data:')) {
    return path;
  }
  return dataService.storage.from('images').getPublicUrl(path).data.publicUrl;
};
