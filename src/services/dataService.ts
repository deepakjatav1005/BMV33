
import { createClient } from '@supabase/supabase-js';
import { DEFAULT_MOCK_DATA } from '../constants';

const STORAGE_KEY = 'APP_MOCK_DATA';
const SESSION_KEY = 'APP_SESSION';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Initialize real Supabase if keys are present
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

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

export const isSupabaseConnected = !!supabase;
export const dataService = supabase || mockDataService;
