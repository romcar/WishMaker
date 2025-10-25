import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.warn(
        'Supabase credentials not found. Make sure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY are set in your environment variables.'
    );
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
    },
});

// Database types for TypeScript
export type Database = {
    public: {
        Tables: {
            wishes: {
                Row: {
                    id: number;
                    title: string;
                    description: string | null;
                    status: 'pending' | 'fulfilled' | 'cancelled';
                    created_at: string;
                    updated_at: string;
                    user_id: string;
                };
                Insert: {
                    id?: number;
                    title: string;
                    description?: string | null;
                    status?: 'pending' | 'fulfilled' | 'cancelled';
                    created_at?: string;
                    updated_at?: string;
                    user_id: string;
                };
                Update: {
                    id?: number;
                    title?: string;
                    description?: string | null;
                    status?: 'pending' | 'fulfilled' | 'cancelled';
                    created_at?: string;
                    updated_at?: string;
                    user_id?: string;
                };
            };
            profiles: {
                Row: {
                    id: string;
                    email: string;
                    first_name: string | null;
                    last_name: string | null;
                    avatar_url: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    email: string;
                    first_name?: string | null;
                    last_name?: string | null;
                    avatar_url?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    first_name?: string | null;
                    last_name?: string | null;
                    avatar_url?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
        };
    };
};

export type Tables = Database['public']['Tables'];
export type Wish = Tables['wishes']['Row'];
export type WishInsert = Tables['wishes']['Insert'];
export type WishUpdate = Tables['wishes']['Update'];
export type Profile = Tables['profiles']['Row'];
