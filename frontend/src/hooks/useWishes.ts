import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { isGitHubPages } from '../services/mock-api';
import { WishAPIService } from '../services/wish-api.service';
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
            const wishesData = await WishAPIService.getWishes();
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

    // Set up real-time subscription (only for Supabase)
    useEffect(() => {
        if (!user || isGitHubPages) {
            return;
        }

        let subscription: any = null;

        const setupSubscription = async () => {
            subscription = WishAPIService.subscribeToWishChanges(
                user.id,
                payload => {
                    console.log('Real-time wish change:', payload);

                    const {
                        eventType,
                        new: newRecord,
                        old: oldRecord,
                    } = payload;

                    setWishes(currentWishes => {
                        switch (eventType) {
                            case 'INSERT':
                                // Add new wish if it doesn't exist
                                if (
                                    newRecord &&
                                    !currentWishes.find(
                                        w => w.id === newRecord.id
                                    )
                                ) {
                                    return [newRecord, ...currentWishes];
                                }
                                return currentWishes;

                            case 'UPDATE':
                                // Update existing wish
                                if (newRecord) {
                                    return currentWishes.map(wish =>
                                        wish.id === newRecord.id
                                            ? newRecord
                                            : wish
                                    );
                                }
                                return currentWishes;

                            case 'DELETE':
                                // Remove deleted wish
                                if (oldRecord) {
                                    return currentWishes.filter(
                                        wish => wish.id !== oldRecord.id
                                    );
                                }
                                return currentWishes;

                            default:
                                return currentWishes;
                        }
                    });
                }
            );
        };

        setupSubscription();

        return () => {
            if (subscription) {
                WishAPIService.unsubscribeFromWishChanges(subscription);
            }
        };
    }, [user]);

    // Create a new wish
    const createWish = useCallback(
        async (wishData: CreateWishInput): Promise<Wish> => {
            try {
                setError(null);
                const newWish = await WishAPIService.createWish(wishData);

                // Optimistically update the UI for GitHub Pages (no real-time updates)
                if (isGitHubPages) {
                    setWishes(current => [newWish, ...current]);
                }

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
                const updatedWish = await WishAPIService.updateWish(
                    id,
                    updates
                );

                // Optimistically update the UI for GitHub Pages
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
            await WishAPIService.deleteWish(id);

            // Optimistically update the UI for GitHub Pages
            if (isGitHubPages) {
                setWishes(current => current.filter(wish => wish.id !== id));
            }
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
