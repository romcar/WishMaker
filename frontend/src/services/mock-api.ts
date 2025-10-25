// Mock API service for GitHub Pages demo
import { CreateWishInput, UpdateWishInput, Wish } from '../types/wish.types';

// Check if we're running in GitHub Pages mode (no backend available)
const isGitHubPages =
    import.meta.env.MODE === 'production' &&
    (window.location.hostname === 'romcar.github.io' ||
        import.meta.env.VITE_DEMO_MODE === 'true');

// Mock data for demo
// Mock wishes data for GitHub Pages demo
let mockWishes: Wish[] = [
    {
        id: 1,
        title: 'Learn TypeScript',
        description: 'Master TypeScript to build better React applications',
        status: 'pending',
        user_id: 'demo-user',
        created_at: new Date('2024-01-15').toISOString(),
        updated_at: new Date('2024-01-15').toISOString(),
    },
    {
        id: 2,
        title: 'Travel to Japan',
        description: 'Experience the culture, food, and beautiful landscapes',
        status: 'pending',
        user_id: 'demo-user',
        created_at: new Date('2024-01-20').toISOString(),
        updated_at: new Date('2024-01-20').toISOString(),
    },
    {
        id: 3,
        title: 'Start a garden',
        description: 'Grow my own vegetables and herbs',
        status: 'fulfilled',
        user_id: 'demo-user',
        created_at: new Date('2024-01-10').toISOString(),
        updated_at: new Date('2024-02-01').toISOString(),
    },
];

// Mock API responses with realistic delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockWishAPI = {
    async getWishes(): Promise<Wish[]> {
        await delay(300); // Simulate network delay
        return [...mockWishes];
    },

    async getWish(id: number): Promise<Wish> {
        await delay(200);
        const wish = mockWishes.find(w => w.id === id);
        if (!wish) {
            throw new Error(`Wish with id ${id} not found`);
        }
        return { ...wish };
    },

    createWish: async (wishData: CreateWishInput): Promise<Wish> => {
        await delay(400); // Simulate network delay

        const newWish: Wish = {
            id: Date.now(), // Simple ID generation
            title: wishData.title,
            description: wishData.description,
            status: 'pending',
            user_id: 'demo-user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        mockWishes.push(newWish);
        return { ...newWish };
    },

    updateWish: async (
        id: number,
        wishData: UpdateWishInput
    ): Promise<Wish> => {
        await delay(350); // Simulate network delay
        const index = mockWishes.findIndex(w => w.id === id);
        if (index === -1) {
            throw new Error(`Wish with id ${id} not found`);
        }

        mockWishes[index] = {
            ...mockWishes[index],
            ...wishData,
            updated_at: new Date().toISOString(),
        };

        return { ...mockWishes[index] };
    },

    deleteWish: async (id: number): Promise<void> => {
        await delay(300); // Simulate network delay
        const index = mockWishes.findIndex(wish => wish.id === id);
        if (index === -1) {
            throw new Error('Wish not found');
        }
        mockWishes.splice(index, 1);
    },
};

export { isGitHubPages };
