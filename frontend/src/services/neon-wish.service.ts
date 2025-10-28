import { desc, eq } from 'drizzle-orm';
import { db } from '../lib/neon';
import { wishes, type NewWish, type Wish } from '../lib/schema';

export class NeonWishService {
    /**
     * Validate that user is authenticated
     */
    private validateUser(user: any) {
        if (!user) {
            throw new Error('User not authenticated');
        }
        return user;
    }

    /**
     * Create a new wish
     */
    async createWish(
        user: any,
        wishData: Omit<NewWish, 'userId' | 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<Wish> {
        this.validateUser(user);

        const newWish: NewWish = {
            ...wishData,
            userId: user.id,
        };

        const [createdWish] = await db
            .insert(wishes)
            .values(newWish)
            .returning();

        return createdWish;
    }

    /**
     * Get all wishes for the current user
     */
    async getAllWishes(user: any): Promise<Wish[]> {
        this.validateUser(user);

        return await db
            .select()
            .from(wishes)
            .where(eq(wishes.userId, user.id))
            .orderBy(desc(wishes.createdAt));
    }

    /**
     * Get a specific wish by ID
     */
    async getWish(user: any, id: string): Promise<Wish | null> {
        this.validateUser(user);

        const [wish] = await db
            .select()
            .from(wishes)
            .where(eq(wishes.id, id))
            .limit(1);

        // Ensure the wish belongs to the current user
        if (wish && wish.userId !== user.id) {
            throw new Error(
                'Unauthorized: Wish does not belong to current user'
            );
        }

        return wish || null;
    }

    /**
     * Update a wish
     */
    async updateWish(
        user: any,
        id: string,
        updates: Partial<Omit<NewWish, 'id' | 'userId' | 'createdAt'>>
    ): Promise<Wish> {
        // First check if the wish exists and belongs to the user
        const existingWish = await this.getWish(user, id);
        if (!existingWish) {
            throw new Error('Wish not found');
        }

        const [updatedWish] = await db
            .update(wishes)
            .set({
                ...updates,
                updatedAt: new Date(),
            })
            .where(eq(wishes.id, id))
            .returning();

        return updatedWish;
    }

    /**
     * Delete a wish
     */
    async deleteWish(user: any, id: string): Promise<void> {
        // First check if the wish exists and belongs to the user
        const existingWish = await this.getWish(user, id);
        if (!existingWish) {
            throw new Error('Wish not found');
        }

        await db.delete(wishes).where(eq(wishes.id, id));
    }

    /**
     * Update wish status
     */
    async updateWishStatus(
        user: any,
        id: string,
        status: 'pending' | 'fulfilled' | 'cancelled'
    ): Promise<Wish> {
        return this.updateWish(user, id, { status });
    }
}

// Export singleton instance
export const neonWishService = new NeonWishService();
