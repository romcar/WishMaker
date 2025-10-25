import type { Profile, Wish, WishInsert, WishUpdate } from '../config/supabase';
import { supabase } from '../config/supabase';
import { CreateWishInput, UpdateWishInput } from '../types/wish.types';

export class SupabaseService {
    // Authentication methods
    static async signUp(
        email: string,
        password: string,
        firstName?: string,
        lastName?: string
    ) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    first_name: firstName,
                    last_name: lastName,
                },
            },
        });

        if (error) {
            throw error;
        }

        // Create profile after successful signup
        if (data.user) {
            await this.createProfile(data.user.id, {
                email: data.user.email!,
                first_name: firstName || null,
                last_name: lastName || null,
                avatar_url: null,
            });
        }

        return data;
    }

    static async signIn(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            throw error;
        }

        return data;
    }

    static async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) {
            throw error;
        }
    }

    static async getCurrentUser() {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        return user;
    }

    static async getCurrentSession() {
        const {
            data: { session },
        } = await supabase.auth.getSession();
        return session;
    }

    // Profile methods
    static async createProfile(
        userId: string,
        profileData: Omit<Profile, 'id' | 'created_at' | 'updated_at'>
    ) {
        const { data, error } = await supabase
            .from('profiles')
            .insert({
                id: userId,
                ...profileData,
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        return data;
    }

    static async getProfile(userId: string): Promise<Profile | null> {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null;
            } // No rows returned
            throw error;
        }
        return data;
    }

    static async updateProfile(
        userId: string,
        updates: Partial<Omit<Profile, 'id' | 'created_at'>>
    ) {
        const { data, error } = await supabase
            .from('profiles')
            .update({
                ...updates,
                updated_at: new Date().toISOString(),
            })
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return data;
    }

    // Wish methods
    static async getWishes(): Promise<Wish[]> {
        const user = await this.getCurrentUser();
        if (!user) {
            throw new Error('User not authenticated');
        }

        const { data, error } = await supabase
            .from('wishes')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        return data || [];
    }

    static async createWish(wishData: CreateWishInput): Promise<Wish> {
        const user = await this.getCurrentUser();
        if (!user) {
            throw new Error('User not authenticated');
        }

        const insertData: WishInsert = {
            title: wishData.title,
            description: wishData.description || null,
            user_id: user.id,
            status: 'pending',
        };

        const { data, error } = await supabase
            .from('wishes')
            .insert(insertData)
            .select()
            .single();

        if (error) {
            throw error;
        }
        return data;
    }

    static async updateWish(
        id: number,
        updates: UpdateWishInput
    ): Promise<Wish> {
        const user = await this.getCurrentUser();
        if (!user) {
            throw new Error('User not authenticated');
        }

        const updateData: WishUpdate = {
            ...updates,
            updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
            .from('wishes')
            .update(updateData)
            .eq('id', id)
            .eq('user_id', user.id) // Ensure user owns the wish
            .select()
            .single();

        if (error) {
            throw error;
        }
        return data;
    }

    static async deleteWish(id: number): Promise<void> {
        const user = await this.getCurrentUser();
        if (!user) {
            throw new Error('User not authenticated');
        }

        const { error } = await supabase
            .from('wishes')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id); // Ensure user owns the wish

        if (error) {
            throw error;
        }
    }

    // Real-time subscriptions
    static subscribeToWishChanges(
        userId: string,
        callback: (payload: any) => void
    ) {
        return supabase
            .channel('wishes_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'wishes',
                    filter: `user_id=eq.${userId}`,
                },
                callback
            )
            .subscribe();
    }

    static unsubscribeFromWishChanges(subscription: any) {
        return supabase.removeChannel(subscription);
    }

    // Utility methods
    static onAuthStateChange(callback: (event: string, session: any) => void) {
        return supabase.auth.onAuthStateChange(callback);
    }
}

export default SupabaseService;
