# 🎯 Wish Types Reference

Complete reference for wish-related TypeScript types used throughout the WishMaker application.

## 🎯 Overview

The wish system is the core feature of WishMaker, allowing users to create, manage, and track their wishes. This document covers all TypeScript types related to wish functionality.

## 🌟 Core Wish Types

### Primary Wish Interface
```typescript
interface Wish {
    id: number;
    title: string;
    description: string;
    category: WishCategory;
    priority: WishPriority;
    status: WishStatus;
    created_at: Date;
    updated_at: Date;
    target_date?: Date;
    is_public: boolean;
    tags: string[];
    image_url?: string;
    estimated_cost?: number;
    actual_cost?: number;
    location?: string;
    notes?: string;
}
```

### Wish Entity (Database Version)
```typescript
interface WishEntity {
    id: number;
    user_id: number; // Foreign key to users table
    title: string;
    description: string;
    category: WishCategory;
    priority: WishPriority;
    status: WishStatus;
    created_at: string; // Database returns as ISO string
    updated_at: string; // Database returns as ISO string
    target_date?: string; // Database returns as ISO string
    is_public: boolean;
    tags: string; // Database stores as JSON string
    image_url?: string;
    estimated_cost?: number; // Stored in cents
    actual_cost?: number; // Stored in cents
    location?: string;
    notes?: string;
}
```

### Frontend Wish (Client-Side)
```typescript
interface FrontendWish extends Omit<Wish, 'created_at' | 'updated_at' | 'target_date'> {
    created_at: string; // Frontend typically uses ISO strings
    updated_at: string;
    target_date?: string;
    user?: Pick<User, 'id' | 'username' | 'avatar_url'>; // For public wishes
}
```

## 📊 Wish Enumeration Types

### Wish Category
```typescript
type WishCategory =
    | "travel"
    | "career"
    | "health"
    | "relationships"
    | "education"
    | "material"
    | "experiences"
    | "personal-growth"
    | "finance"
    | "creativity"
    | "family"
    | "other";

const WISH_CATEGORIES = [
    { value: "travel", label: "Travel & Adventure", icon: "🌍" },
    { value: "career", label: "Career & Professional", icon: "💼" },
    { value: "health", label: "Health & Fitness", icon: "💪" },
    { value: "relationships", label: "Relationships", icon: "💝" },
    { value: "education", label: "Learning & Education", icon: "📚" },
    { value: "material", label: "Material Things", icon: "🛍️" },
    { value: "experiences", label: "Experiences", icon: "🎭" },
    { value: "personal-growth", label: "Personal Growth", icon: "🌱" },
    { value: "finance", label: "Financial Goals", icon: "💰" },
    { value: "creativity", label: "Creative Projects", icon: "🎨" },
    { value: "family", label: "Family & Home", icon: "🏡" },
    { value: "other", label: "Other", icon: "✨" }
] as const;
```

### Wish Priority
```typescript
type WishPriority =
    | "low"
    | "medium"
    | "high"
    | "urgent";

const WISH_PRIORITIES = [
    { value: "low", label: "Low", color: "#10B981", weight: 1 },
    { value: "medium", label: "Medium", color: "#F59E0B", weight: 2 },
    { value: "high", label: "High", color: "#EF4444", weight: 3 },
    { value: "urgent", label: "Urgent", color: "#DC2626", weight: 4 }
] as const;
```

### Wish Status
```typescript
type WishStatus =
    | "draft"
    | "active"
    | "in-progress"
    | "completed"
    | "cancelled"
    | "on-hold";

const WISH_STATUSES = [
    { value: "draft", label: "Draft", color: "#6B7280", description: "Still planning this wish" },
    { value: "active", label: "Active", color: "#3B82F6", description: "Ready to work on" },
    { value: "in-progress", label: "In Progress", color: "#F59E0B", description: "Currently working towards this" },
    { value: "completed", label: "Completed", color: "#10B981", description: "Wish fulfilled!" },
    { value: "cancelled", label: "Cancelled", color: "#EF4444", description: "No longer pursuing this" },
    { value: "on-hold", label: "On Hold", color: "#8B5CF6", description: "Paused temporarily" }
] as const;
```

## 📝 Wish Form & Input Types

### Create Wish Request
```typescript
interface CreateWishRequest {
    title: string;
    description: string;
    category: WishCategory;
    priority: WishPriority;
    target_date?: string; // ISO date string
    is_public?: boolean;
    tags?: string[];
    estimated_cost?: number; // In user's currency
    location?: string;
    notes?: string;
}
```

### Update Wish Request
```typescript
interface UpdateWishRequest extends Partial<CreateWishRequest> {
    id: number;
    status?: WishStatus;
    actual_cost?: number;
    image_url?: string; // Updated separately via file upload
}
```

### Wish Form State
```typescript
interface WishFormState {
    title: string;
    description: string;
    category: WishCategory;
    priority: WishPriority;
    status: WishStatus;
    target_date: string; // For date input
    is_public: boolean;
    tags: string[];
    estimated_cost: string; // String for input handling
    actual_cost: string;
    location: string;
    notes: string;
    image_file?: File; // For file uploads
}

interface WishFormErrors {
    title?: string;
    description?: string;
    category?: string;
    priority?: string;
    target_date?: string;
    estimated_cost?: string;
    actual_cost?: string;
    general?: string;
}
```

## 🔍 Wish Query & Filter Types

### Wish Query Parameters
```typescript
interface WishQueryParams {
    page?: number;
    limit?: number;
    category?: WishCategory | WishCategory[];
    priority?: WishPriority | WishPriority[];
    status?: WishStatus | WishStatus[];
    search?: string; // Search in title/description
    tags?: string | string[];
    is_public?: boolean;
    user_id?: number; // For admin or public wishes
    sort_by?: WishSortField;
    sort_order?: "asc" | "desc";
    created_after?: string; // ISO date
    created_before?: string; // ISO date
    target_after?: string; // ISO date
    target_before?: string; // ISO date
}
```

### Wish Sort Options
```typescript
type WishSortField =
    | "created_at"
    | "updated_at"
    | "title"
    | "priority"
    | "status"
    | "target_date"
    | "estimated_cost"
    | "category";

const WISH_SORT_OPTIONS = [
    { value: "created_at", label: "Date Created" },
    { value: "updated_at", label: "Last Updated" },
    { value: "title", label: "Title (A-Z)" },
    { value: "priority", label: "Priority" },
    { value: "status", label: "Status" },
    { value: "target_date", label: "Target Date" },
    { value: "estimated_cost", label: "Estimated Cost" },
    { value: "category", label: "Category" }
] as const;
```

### Wish Filter State
```typescript
interface WishFilterState {
    categories: WishCategory[];
    priorities: WishPriority[];
    statuses: WishStatus[];
    search: string;
    tags: string[];
    dateRange: {
        start?: string;
        end?: string;
    };
    costRange: {
        min?: number;
        max?: number;
    };
    showPublicOnly: boolean;
}
```

## 📊 Wish API Response Types

### Wish List Response
```typescript
interface WishListResponse {
    wishes: FrontendWish[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
    filters: {
        categories: WishCategory[];
        priorities: WishPriority[];
        statuses: WishStatus[];
        availableTags: string[];
    };
}
```

### Wish Detail Response
```typescript
interface WishDetailResponse {
    wish: FrontendWish;
    relatedWishes: Pick<FrontendWish, 'id' | 'title' | 'category' | 'status'>[];
    progress?: WishProgress;
}
```

### Wish Statistics Response
```typescript
interface WishStatsResponse {
    totalWishes: number;
    completedWishes: number;
    completionRate: number;
    categoryCounts: Record<WishCategory, number>;
    statusCounts: Record<WishStatus, number>;
    priorityCounts: Record<WishPriority, number>;
    monthlyCreated: Array<{
        month: string; // YYYY-MM format
        count: number;
    }>;
    monthlyCompleted: Array<{
        month: string;
        count: number;
    }>;
    totalEstimatedValue: number;
    totalActualSpent: number;
}
```

## 📈 Wish Progress & Analytics Types

### Wish Progress Tracking
```typescript
interface WishProgress {
    id: number;
    wish_id: number;
    progress_percentage: number; // 0-100
    milestones: WishMilestone[];
    last_updated: Date;
    notes?: string;
}

interface WishMilestone {
    id: number;
    title: string;
    description?: string;
    target_date?: Date;
    completed_at?: Date;
    is_completed: boolean;
    order_index: number;
}
```

### Wish Analytics
```typescript
interface WishAnalytics {
    averageCompletionTime: number; // in days
    completionTrends: Array<{
        period: string;
        completed: number;
        created: number;
    }>;
    categoryPerformance: Array<{
        category: WishCategory;
        completionRate: number;
        averageTime: number;
    }>;
    costAccuracy: {
        averageVariance: number; // percentage
        underBudget: number;
        overBudget: number;
        onBudget: number;
    };
}
```

## 🎨 Component Prop Types

### WishCard Props
```typescript
interface WishCardProps {
    wish: FrontendWish;
    variant?: "compact" | "detailed" | "grid";
    showActions?: boolean;
    showProgress?: boolean;
    showUser?: boolean; // For public wishes
    onEdit?: (wish: FrontendWish) => void;
    onDelete?: (wishId: number) => void;
    onStatusChange?: (wishId: number, status: WishStatus) => void;
    className?: string;
}
```

### WishForm Props
```typescript
interface WishFormProps {
    initialWish?: Partial<FrontendWish>;
    onSubmit: (wish: CreateWishRequest | UpdateWishRequest) => Promise<void>;
    onCancel?: () => void;
    isLoading?: boolean;
    mode: "create" | "edit";
    className?: string;
}
```

### WishList Props
```typescript
interface WishListProps {
    wishes: FrontendWish[];
    isLoading?: boolean;
    error?: string;
    filters?: WishFilterState;
    onFilterChange?: (filters: WishFilterState) => void;
    onWishClick?: (wish: FrontendWish) => void;
    onWishEdit?: (wish: FrontendWish) => void;
    onWishDelete?: (wishId: number) => void;
    pagination?: {
        page: number;
        totalPages: number;
        onPageChange: (page: number) => void;
    };
    viewMode?: "grid" | "list" | "compact";
    sortOptions?: {
        field: WishSortField;
        order: "asc" | "desc";
        onChange: (field: WishSortField, order: "asc" | "desc") => void;
    };
}
```

### WishFilter Props
```typescript
interface WishFilterProps {
    filters: WishFilterState;
    onFiltersChange: (filters: WishFilterState) => void;
    availableCategories?: WishCategory[];
    availableTags?: string[];
    isCollapsible?: boolean;
    className?: string;
}
```

## 🔄 Wish State Management Types

### Wish Redux State
```typescript
interface WishState {
    wishes: FrontendWish[];
    currentWish: FrontendWish | null;
    filters: WishFilterState;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    isLoading: boolean;
    error: string | null;
    stats: WishStatsResponse | null;
}
```

### Wish Action Types
```typescript
type WishActionType =
    | "FETCH_WISHES_START"
    | "FETCH_WISHES_SUCCESS"
    | "FETCH_WISHES_FAILURE"
    | "CREATE_WISH_SUCCESS"
    | "UPDATE_WISH_SUCCESS"
    | "DELETE_WISH_SUCCESS"
    | "SET_CURRENT_WISH"
    | "UPDATE_FILTERS"
    | "UPDATE_PAGINATION"
    | "CLEAR_ERROR";

interface WishAction {
    type: WishActionType;
    payload?: any;
}
```

### Wish Context Type
```typescript
interface WishContextType {
    wishes: FrontendWish[];
    currentWish: FrontendWish | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    createWish: (wish: CreateWishRequest) => Promise<FrontendWish>;
    updateWish: (id: number, wish: UpdateWishRequest) => Promise<FrontendWish>;
    deleteWish: (id: number) => Promise<void>;
    fetchWishes: (params?: WishQueryParams) => Promise<void>;
    fetchWish: (id: number) => Promise<FrontendWish>;

    // Filters
    filters: WishFilterState;
    updateFilters: (filters: Partial<WishFilterState>) => void;
    clearFilters: () => void;

    // Stats
    stats: WishStatsResponse | null;
    fetchStats: () => Promise<void>;
}
```

## ❌ Wish Error Types

### Wish Validation Errors
```typescript
interface WishValidationError {
    field: keyof CreateWishRequest | keyof UpdateWishRequest;
    message: string;
    code: string;
}

type WishErrorCode =
    | "WISH_NOT_FOUND"
    | "INVALID_TITLE"
    | "INVALID_DESCRIPTION"
    | "INVALID_CATEGORY"
    | "INVALID_PRIORITY"
    | "INVALID_STATUS"
    | "INVALID_DATE"
    | "INVALID_COST"
    | "UNAUTHORIZED_ACCESS"
    | "DUPLICATE_TITLE"
    | "TAGS_LIMIT_EXCEEDED"
    | "IMAGE_UPLOAD_FAILED";
```

## 🔍 Type Guards & Validation

### Wish Type Guards
```typescript
function isValidWishCategory(category: string): category is WishCategory {
    const validCategories: WishCategory[] = [
        "travel", "career", "health", "relationships", "education",
        "material", "experiences", "personal-growth", "finance",
        "creativity", "family", "other"
    ];
    return validCategories.includes(category as WishCategory);
}

function isValidWishPriority(priority: string): priority is WishPriority {
    return ["low", "medium", "high", "urgent"].includes(priority as WishPriority);
}

function isValidWishStatus(status: string): status is WishStatus {
    return ["draft", "active", "in-progress", "completed", "cancelled", "on-hold"]
        .includes(status as WishStatus);
}

function isWish(obj: any): obj is Wish {
    return obj &&
        typeof obj.id === 'number' &&
        typeof obj.title === 'string' &&
        typeof obj.description === 'string' &&
        isValidWishCategory(obj.category) &&
        isValidWishPriority(obj.priority) &&
        isValidWishStatus(obj.status) &&
        typeof obj.is_public === 'boolean' &&
        Array.isArray(obj.tags);
}

function isCreateWishRequest(obj: any): obj is CreateWishRequest {
    return obj &&
        typeof obj.title === 'string' &&
        obj.title.trim().length > 0 &&
        typeof obj.description === 'string' &&
        obj.description.trim().length > 0 &&
        isValidWishCategory(obj.category) &&
        isValidWishPriority(obj.priority);
}
```

### Wish Validation Functions
```typescript
interface WishValidationResult {
    isValid: boolean;
    errors: WishValidationError[];
}

function validateWishTitle(title: string): WishValidationError | null {
    if (!title || title.trim().length === 0) {
        return { field: 'title', message: 'Title is required', code: 'INVALID_TITLE' };
    }
    if (title.length > 200) {
        return { field: 'title', message: 'Title must be less than 200 characters', code: 'INVALID_TITLE' };
    }
    return null;
}

function validateWishDescription(description: string): WishValidationError | null {
    if (!description || description.trim().length === 0) {
        return { field: 'description', message: 'Description is required', code: 'INVALID_DESCRIPTION' };
    }
    if (description.length > 2000) {
        return { field: 'description', message: 'Description must be less than 2000 characters', code: 'INVALID_DESCRIPTION' };
    }
    return null;
}

function validateWish(wish: CreateWishRequest): WishValidationResult {
    const errors: WishValidationError[] = [];

    const titleError = validateWishTitle(wish.title);
    if (titleError) errors.push(titleError);

    const descError = validateWishDescription(wish.description);
    if (descError) errors.push(descError);

    if (!isValidWishCategory(wish.category)) {
        errors.push({ field: 'category', message: 'Invalid category', code: 'INVALID_CATEGORY' });
    }

    if (!isValidWishPriority(wish.priority)) {
        errors.push({ field: 'priority', message: 'Invalid priority', code: 'INVALID_PRIORITY' });
    }

    if (wish.tags && wish.tags.length > 10) {
        errors.push({ field: 'tags', message: 'Maximum 10 tags allowed', code: 'TAGS_LIMIT_EXCEEDED' });
    }

    if (wish.estimated_cost && wish.estimated_cost < 0) {
        errors.push({ field: 'estimated_cost', message: 'Cost cannot be negative', code: 'INVALID_COST' });
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}
```

## 📚 Usage Examples

### Creating a New Wish
```typescript
const createWish = async (wishData: CreateWishRequest): Promise<FrontendWish> => {
    // Validate the wish data
    const validation = validateWish(wishData);
    if (!validation.isValid) {
        throw new WishValidationError(validation.errors);
    }

    try {
        const response = await fetch('/api/wishes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify(wishData)
        });

        if (!response.ok) {
            throw new Error('Failed to create wish');
        }

        const newWish: FrontendWish = await response.json();
        return newWish;

    } catch (error) {
        console.error('Error creating wish:', error);
        throw error;
    }
};

// Usage in component
const handleCreateWish = async (formData: WishFormState) => {
    const wishRequest: CreateWishRequest = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        target_date: formData.target_date || undefined,
        is_public: formData.is_public,
        tags: formData.tags.filter(tag => tag.trim() !== ''),
        estimated_cost: formData.estimated_cost ? parseFloat(formData.estimated_cost) : undefined,
        location: formData.location || undefined,
        notes: formData.notes || undefined
    };

    try {
        const newWish = await createWish(wishRequest);
        console.log('Wish created:', newWish);
        // Navigate or update UI
    } catch (error) {
        console.error('Failed to create wish:', error);
        // Handle error
    }
};
```

### Filtering and Searching Wishes
```typescript
const useWishFilters = () => {
    const [filters, setFilters] = useState<WishFilterState>({
        categories: [],
        priorities: [],
        statuses: [],
        search: '',
        tags: [],
        dateRange: {},
        costRange: {},
        showPublicOnly: false
    });

    const applyFilters = useCallback((wishes: FrontendWish[]): FrontendWish[] => {
        return wishes.filter(wish => {
            // Category filter
            if (filters.categories.length > 0 && !filters.categories.includes(wish.category)) {
                return false;
            }

            // Priority filter
            if (filters.priorities.length > 0 && !filters.priorities.includes(wish.priority)) {
                return false;
            }

            // Status filter
            if (filters.statuses.length > 0 && !filters.statuses.includes(wish.status)) {
                return false;
            }

            // Search filter
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                const titleMatch = wish.title.toLowerCase().includes(searchLower);
                const descMatch = wish.description.toLowerCase().includes(searchLower);
                const tagMatch = wish.tags.some(tag => tag.toLowerCase().includes(searchLower));

                if (!titleMatch && !descMatch && !tagMatch) {
                    return false;
                }
            }

            // Date range filter
            if (filters.dateRange.start) {
                const wishDate = new Date(wish.created_at);
                const startDate = new Date(filters.dateRange.start);
                if (wishDate < startDate) return false;
            }

            if (filters.dateRange.end) {
                const wishDate = new Date(wish.created_at);
                const endDate = new Date(filters.dateRange.end);
                if (wishDate > endDate) return false;
            }

            // Cost range filter
            if (filters.costRange.min && wish.estimated_cost) {
                if (wish.estimated_cost < filters.costRange.min) return false;
            }

            if (filters.costRange.max && wish.estimated_cost) {
                if (wish.estimated_cost > filters.costRange.max) return false;
            }

            // Public only filter
            if (filters.showPublicOnly && !wish.is_public) {
                return false;
            }

            return true;
        });
    }, [filters]);

    return {
        filters,
        setFilters,
        applyFilters
    };
};
```

## 🎫 Related Linear Tickets

- **[ROM-7](https://linear.app/romcar/issue/ROM-7/)** - Wish system core functionality
- **[ROM-8](https://linear.app/romcar/issue/ROM-8/)** - Advanced wish features
- **[ROM-9](https://linear.app/romcar/issue/ROM-9/)** - Wish analytics and reporting

---

**File Locations:**
- Types: `backend/src/types/wish.types.ts`, `frontend/src/types/wish.types.ts`
- Models: `backend/src/models/wish.model.ts`
- Components: `frontend/src/components/WishForm.tsx`, `frontend/src/components/WishList.tsx`
- Services: `frontend/src/services/wishApi.ts`