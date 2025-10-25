import { CreateWishInput, UpdateWishInput, Wish } from '../types/wish.types';
import { isGitHubPages, mockWishAPI } from './mock-api';
import { SupabaseService } from './supabase.service';

/**
 * Unified API service that automatically switches between Supabase (production)
 * and Mock API (GitHub Pages demo) based on the environment
 */
export class WishAPIService {
    // Get all wishes for the current user
    static async getWishes(): Promise<Wish[]> {
        if (isGitHubPages) {
            return mockWishAPI.getWishes();
        }

        try {
            const wishes = await SupabaseService.getWishes();
            return wishes;
        } catch (error) {
            console.error('Failed to fetch wishes from Supabase:', error);
            throw error;
        }
    }

    // Create a new wish
    static async createWish(wishData: CreateWishInput): Promise<Wish> {
        if (isGitHubPages) {
            return mockWishAPI.createWish(wishData);
        }

        try {
            const wish = await SupabaseService.createWish(wishData);
            return wish;
        } catch (error) {
            console.error('Failed to create wish in Supabase:', error);
            throw error;
        }
    }

    // Update an existing wish
    static async updateWish(
        id: number,
        updates: UpdateWishInput
    ): Promise<Wish> {
        if (isGitHubPages) {
            return mockWishAPI.updateWish(id, updates);
        }

        try {
            const wish = await SupabaseService.updateWish(id, updates);
            return wish;
        } catch (error) {
            console.error('Failed to update wish in Supabase:', error);
            throw error;
        }
    }

    // Delete a wish
    static async deleteWish(id: number): Promise<void> {
        if (isGitHubPages) {
            return mockWishAPI.deleteWish(id);
        }

        try {
            await SupabaseService.deleteWish(id);
        } catch (error) {
            console.error('Failed to delete wish in Supabase:', error);
            throw error;
        }
    }

    // Subscribe to real-time wish changes (only works with Supabase)
    static subscribeToWishChanges(
        userId: string,
        callback: (payload: any) => void
    ) {
        if (isGitHubPages) {
            console.log('Real-time subscriptions not available in demo mode');
            return null;
        }

        return SupabaseService.subscribeToWishChanges(userId, callback);
    }

    // Unsubscribe from wish changes
    static unsubscribeFromWishChanges(subscription: any) {
        if (isGitHubPages || !subscription) {
            return;
        }

        return SupabaseService.unsubscribeFromWishChanges(subscription);
    }
}

export default WishAPIService;
