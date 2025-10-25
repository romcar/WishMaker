import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { wishAPI } from '../services/api';
import { isGitHubPages } from '../services/mock-api';
import { CreateWishInput, UpdateWishInput, Wish } from '../types/wish.types';

export function useWishes() {
    const { user } = useAuth();
    const [wishes, setWishes] = useState<Wish[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch wishes
    const fetchWishes = useCallback(async () => {
        if (!user) {
            setWishes([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const wishesData = await wishAPI.getAllWishes();
            setWishes(wishesData);
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'Failed to fetch wishes';
            setError(message);
            console.error('Error fetching wishes:', err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Load wishes when user changes
    useEffect(() => {
        fetchWishes();
    }, [fetchWishes]);

    // Note: Real-time updates removed - using backend API only

    // Create a new wish
    const createWish = useCallback(
        async (wishData: CreateWishInput): Promise<Wish> => {
            try {
                setError(null);
                const newWish = await wishAPI.createWish(wishData);

                // Update the UI (no real-time updates with backend API)
                setWishes(current => [newWish, ...current]);

                return newWish;
            } catch (err) {
                const message =
                    err instanceof Error
                        ? err.message
                        : 'Failed to create wish';
                setError(message);
                throw new Error(message);
            }
        },
        []
    );

    // Update an existing wish
    const updateWish = useCallback(
        async (id: number, updates: UpdateWishInput): Promise<Wish> => {
            try {
                setError(null);
                const updatedWish = await wishAPI.updateWish(id, updates);

                // Update the UI
                setWishes(current =>
                    current.map(wish => (wish.id === id ? updatedWish : wish))
                );

                // Also update for GitHub Pages
                if (isGitHubPages) {
                    setWishes(current =>
                        current.map(wish =>
                            wish.id === id ? updatedWish : wish
                        )
                    );
                }

                return updatedWish;
            } catch (err) {
                const message =
                    err instanceof Error
                        ? err.message
                        : 'Failed to update wish';
                setError(message);
                throw new Error(message);
            }
        },
        []
    );

    // Delete a wish
    const deleteWish = useCallback(async (id: number): Promise<void> => {
        try {
            setError(null);
            await wishAPI.deleteWish(id);

            // Update the UI
            setWishes(current => current.filter(wish => wish.id !== id));
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'Failed to delete wish';
            setError(message);
            throw new Error(message);
        }
    }, []);

    // Refresh wishes manually
    const refreshWishes = useCallback(() => {
        fetchWishes();
    }, [fetchWishes]);

    // Clear error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        wishes,
        loading,
        error,
        createWish,
        updateWish,
        deleteWish,
        refreshWishes,
        clearError,
    };
}

export default useWishes;
