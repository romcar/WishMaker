import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

// Wishes table schema
export const wishes = pgTable('wishes', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(), // Stack Auth user ID
    title: text('title').notNull(),
    description: text('description'),
    status: text('status', { enum: ['pending', 'fulfilled', 'cancelled'] })
        .notNull()
        .default('pending'),
    priority: integer('priority').default(1),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Export type for TypeScript
export type Wish = typeof wishes.$inferSelect;
export type NewWish = typeof wishes.$inferInsert;
