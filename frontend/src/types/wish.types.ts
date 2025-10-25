// TODO: ENHANCEMENT - Expand Wish model with missing features
// 1. ✅ Added user_id field for multi-user support (Supabase integration)
// 2. Add priority field (low, medium, high, urgent)
// 3. Add category/tags for organization (array of strings)
// 4. Add target_date for deadline tracking
// 5. Add progress percentage (0-100) for partial completion
// 6. Add privacy settings (private, friends, public)
// 7. Add attachments/images support (file URLs array)
// 8. Add cost estimation and budget tracking
// 9. Add location field for location-based wishes
// 10. Add sharing capabilities (share_token, shared_with array)
export interface Wish {
    id: number;
    title: string;
    description: string | null;
    created_at: string;
    updated_at: string;
    status: 'pending' | 'fulfilled' | 'cancelled';
    user_id: string; // Added for Supabase multi-user support
}

export interface CreateWishInput {
    title: string;
    description: string | null;
}

export interface UpdateWishInput {
    title?: string;
    description?: string | null;
    status?: 'pending' | 'fulfilled' | 'cancelled';
}

// TODO: MISSING INTERFACES - Add these missing type definitions:
// 1. WishFilter interface for search/filtering functionality
// 2. WishSort interface for sorting options
// 3. PaginatedWishResponse for large datasets
// 4. WishStats interface for dashboard analytics
// 5. WishCategory interface for categorization
// 6. WishComment interface for wish discussions
// 7. WishTemplate interface for reusable wish templates
