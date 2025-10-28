import { useUser } from '@stackframe/react';
import { useEffect, useState } from 'react';
import type { NewWish, Wish } from '../lib/schema';
import { neonWishService } from '../services/neon-wish.service';

export function useNeonWishes() {
    const user = useUser();
    const [wishes, setWishes] = useState<Wish[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch wishes when user changes
    useEffect(() => {
        if (user) {
            fetchWishes();
        } else {
            setWishes([]);
            setLoading(false);
        }
    }, [user]);

    const fetchWishes = async () => {
        if (!user) {
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const userWishes = await neonWishService.getAllWishes(user);
            setWishes(userWishes);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch wishes');
            console.error('Error fetching wishes:', err);
        } finally {
            setLoading(false);
        }
    };

    const createWish = async (
        wishData: Omit<NewWish, 'userId' | 'id' | 'createdAt' | 'updatedAt'>
    ) => {
        if (!user) {
            throw new Error('User not authenticated');
        }

        try {
            const newWish = await neonWishService.createWish(user, wishData);
            setWishes(prev => [newWish, ...prev]);
            return newWish;
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to create wish';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const updateWish = async (
        id: string,
        updates: Partial<Omit<NewWish, 'id' | 'userId' | 'createdAt'>>
    ) => {
        if (!user) {
            throw new Error('User not authenticated');
        }

        try {
            const updatedWish = await neonWishService.updateWish(
                user,
                id,
                updates
            );
            setWishes(prev =>
                prev.map(wish => (wish.id === id ? updatedWish : wish))
            );
            return updatedWish;
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to update wish';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const deleteWish = async (id: string) => {
        if (!user) {
            throw new Error('User not authenticated');
        }

        try {
            await neonWishService.deleteWish(user, id);
            setWishes(prev => prev.filter(wish => wish.id !== id));
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to delete wish';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const updateWishStatus = async (
        id: string,
        status: 'pending' | 'fulfilled' | 'cancelled'
    ) => {
        return updateWish(id, { status });
    };

    return {
        wishes,
        loading,
        error,
        createWish,
        updateWish,
        deleteWish,
        updateWishStatus,
        refetch: fetchWishes,
    };
}
