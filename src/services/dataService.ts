
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
        const result = await response.json();
        return result;
      } catch (err: any) {
        console.error(`[MYSQL CLIENT ERROR] ${table} ${method}:`, err);
        return { data: null, error: err };
      }
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
          formData.append('file', file);
          formData.append('path', path);
          formData.append('bucket', bucket);

          const response = await fetch('/api/storage/upload', {
            method: 'POST',
            body: formData
          });
          const result = await response.json();
          
          // Store the public URL temporarily for immediate use if needed,
          // though getPublicUrl would ideally handle this.
          if (result.data) {
            (window as any)[`__url_${result.data.path}`] = result.data.publicUrl;
          }
          
          return result;
        } catch (err: any) {
          console.error('[STORAGE UPLOAD ERROR]:', err);
          return { data: null, error: err };
        }
      },
      getPublicUrl: (path: string) => {
        const cachedUrl = (window as any)[`__url_${path}`];
        if (cachedUrl) return { data: { publicUrl: cachedUrl } };
        
        // Fallback or derive from current location if we only have the filename
        const baseUrl = window.location.origin;
        return { data: { publicUrl: `${baseUrl}/uploads/${path}` } };
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
      // For now, use the MySQL query API to check user
      const { data, error } = await mysqlDataService.from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .maybeSingle();

      if (data) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(data));
        return { data: { user: data, session: { user: data } }, error: null };
      }
      return { data: { user: null, session: null }, error: { message: error || 'Invalid credentials' } };
    },
    signOut: async () => {
      localStorage.removeItem(SESSION_KEY);
      return { error: null };
    },
    signUp: async ({ email, password, options }: any) => {
      const newUser = { 
        uid: Math.random().toString(36).substr(2, 9),
        email, 
        password, 
        ...options?.data 
      };
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
