# 🌐 API Types Reference

Complete reference for API-related TypeScript types used throughout the WishMaker application for client-server communication.

## 🎯 Overview

This document covers all TypeScript types related to API communication, including request/response structures, error handling, HTTP client configurations, and API response formatting used across both frontend and backend.

## 📡 Base API Types

### HTTP Response Wrapper
```typescript
interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: ApiError;
    timestamp: string; // ISO timestamp
    requestId?: string; // For debugging/tracing
}

interface ApiError {
    code: string;
    message: string;
    details?: Record<string, any>;
    field?: string; // For validation errors
    statusCode: number;
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

interface ApiMeta {
    version: string;
    environment: "development" | "staging" | "production";
    timestamp: string;
    requestId: string;
}
```

### HTTP Client Configuration
```typescript
interface ApiClientConfig {
    baseURL: string;
    timeout: number;
    retries: number;
    retryDelay: number;
    headers: Record<string, string>;
    withCredentials: boolean;
}

interface RequestConfig {
    url: string;
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    headers?: Record<string, string>;
    params?: Record<string, any>;
    data?: any;
    timeout?: number;
    retries?: number;
    withAuth?: boolean;
}

interface ResponseInterceptor {
    onFulfilled?: (response: any) => any;
    onRejected?: (error: any) => any;
}

interface RequestInterceptor {
    onFulfilled?: (config: any) => any;
    onRejected?: (error: any) => any;
}
```

## 🔐 Authentication API Types

### Auth Request Types
```typescript
interface LoginApiRequest {
    email: string;
    password: string;
    rememberMe?: boolean;
    captcha?: string;
}

interface RegisterApiRequest {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    acceptTerms: boolean;
    captcha?: string;
}

interface ForgotPasswordApiRequest {
    email: string;
    captcha?: string;
}

interface ResetPasswordApiRequest {
    token: string;
    password: string;
    confirmPassword: string;
}

interface ChangePasswordApiRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

interface UpdateProfileApiRequest {
    username?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    bio?: string;
    dateOfBirth?: string;
    location?: string;
    website?: string;
    avatarUrl?: string;
}
```

### Auth Response Types
```typescript
interface LoginApiResponse extends ApiResponse<{
    user: User;
    token: string;
    refreshToken: string;
    expiresIn: number; // seconds
    permissions: string[];
}> {}

interface RegisterApiResponse extends ApiResponse<{
    user: User;
    token: string;
    refreshToken: string;
    requiresVerification: boolean;
    verificationEmailSent: boolean;
}> {}

interface TokenRefreshApiResponse extends ApiResponse<{
    token: string;
    refreshToken: string;
    expiresIn: number;
}> {}

interface UserProfileApiResponse extends ApiResponse<User> {}

interface VerifyEmailApiResponse extends ApiResponse<{
    verified: boolean;
    message: string;
}> {}

interface AuthStatusApiResponse extends ApiResponse<{
    isAuthenticated: boolean;
    user?: User;
    permissions?: string[];
    session?: {
        expiresAt: string;
        lastActivity: string;
    };
}> {}
```

## 🎯 Wish API Types

### Wish Request Types
```typescript
interface CreateWishApiRequest {
    title: string;
    description: string;
    category: WishCategory;
    priority: WishPriority;
    targetDate?: string; // ISO date
    isPublic?: boolean;
    tags?: string[];
    estimatedCost?: number;
    location?: string;
    notes?: string;
}

interface UpdateWishApiRequest extends Partial<CreateWishApiRequest> {
    status?: WishStatus;
    actualCost?: number;
    imageUrl?: string;
}

interface WishQueryApiParams {
    page?: number;
    limit?: number;
    category?: WishCategory | WishCategory[];
    priority?: WishPriority | WishPriority[];
    status?: WishStatus | WishStatus[];
    search?: string;
    tags?: string | string[];
    isPublic?: boolean;
    userId?: number;
    sortBy?: WishSortField;
    sortOrder?: "asc" | "desc";
    createdAfter?: string;
    createdBefore?: string;
    targetAfter?: string;
    targetBefore?: string;
}

interface BulkWishActionApiRequest {
    wishIds: number[];
    action: "delete" | "update-status" | "update-category" | "update-priority";
    data?: {
        status?: WishStatus;
        category?: WishCategory;
        priority?: WishPriority;
    };
}
```

### Wish Response Types
```typescript
interface WishApiResponse extends ApiResponse<FrontendWish> {}

interface WishListApiResponse extends PaginatedResponse<FrontendWish> {
    data: {
        wishes: FrontendWish[];
        filters: {
            availableCategories: WishCategory[];
            availableTags: string[];
            availablePriorities: WishPriority[];
            availableStatuses: WishStatus[];
        };
        stats: {
            total: number;
            byCategory: Record<WishCategory, number>;
            byStatus: Record<WishStatus, number>;
            byPriority: Record<WishPriority, number>;
        };
    };
}

interface WishStatsApiResponse extends ApiResponse<{
    totalWishes: number;
    completedWishes: number;
    completionRate: number;
    categoryCounts: Record<WishCategory, number>;
    statusCounts: Record<WishStatus, number>;
    priorityCounts: Record<WishPriority, number>;
    monthlyTrends: Array<{
        month: string;
        created: number;
        completed: number;
    }>;
    totalEstimatedValue: number;
    totalActualSpent: number;
    averageCompletionTime: number; // days
}> {}

interface BulkWishActionApiResponse extends ApiResponse<{
    processed: number;
    successful: number;
    failed: number;
    errors: Array<{
        wishId: number;
        error: string;
    }>;
}> {}
```

## 📁 File Upload API Types

### File Upload Request Types
```typescript
interface FileUploadApiRequest {
    file: File;
    type: "avatar" | "wish-image" | "document";
    entityId?: number; // Related wish ID, etc.
    metadata?: Record<string, any>;
}

interface MultiFileUploadApiRequest {
    files: File[];
    type: "wish-images" | "documents";
    entityId?: number;
    metadata?: Record<string, any>;
}

interface FileDeleteApiRequest {
    fileId: string;
    type: "avatar" | "wish-image" | "document";
}
```

### File Upload Response Types
```typescript
interface FileUploadApiResponse extends ApiResponse<{
    fileId: string;
    url: string;
    publicUrl?: string;
    filename: string;
    originalName: string;
    size: number;
    mimeType: string;
    uploadedAt: string;
    metadata?: Record<string, any>;
}> {}

interface MultiFileUploadApiResponse extends ApiResponse<{
    files: Array<{
        fileId: string;
        url: string;
        publicUrl?: string;
        filename: string;
        originalName: string;
        size: number;
        mimeType: string;
        status: "success" | "failed";
        error?: string;
    }>;
    summary: {
        total: number;
        successful: number;
        failed: number;
    };
}> {}
```

## 🔍 Search & Analytics API Types

### Search Request Types
```typescript
interface SearchApiRequest {
    query: string;
    type?: "wishes" | "users" | "all";
    filters?: {
        category?: WishCategory[];
        status?: WishStatus[];
        dateRange?: {
            start: string;
            end: string;
        };
    };
    page?: number;
    limit?: number;
    sortBy?: "relevance" | "date" | "popularity";
}

interface AdvancedSearchApiRequest {
    queries: Array<{
        field: string;
        operator: "contains" | "equals" | "gt" | "lt" | "between";
        value: any;
    }>;
    type: "wishes" | "users";
    logical: "AND" | "OR";
    page?: number;
    limit?: number;
}
```

### Search Response Types
```typescript
interface SearchApiResponse extends ApiResponse<{
    results: Array<{
        id: number;
        type: "wish" | "user";
        title: string;
        description?: string;
        url: string;
        relevance: number;
        highlights: string[];
    }>;
    totalResults: number;
    searchTime: number; // milliseconds
    suggestions: string[];
    facets: {
        categories: Record<WishCategory, number>;
        statuses: Record<WishStatus, number>;
        users: Array<{ id: number; username: string; count: number }>;
    };
}> {}

interface AutocompleteApiResponse extends ApiResponse<{
    suggestions: Array<{
        text: string;
        type: "wish" | "tag" | "user" | "category";
        count?: number;
    }>;
}> {}
```

### Analytics Request Types
```typescript
interface AnalyticsApiRequest {
    metric: "page_views" | "user_actions" | "wish_activity" | "api_usage";
    dateRange: {
        start: string; // ISO date
        end: string;   // ISO date
    };
    granularity: "hour" | "day" | "week" | "month";
    filters?: {
        userId?: number;
        action?: string;
        path?: string;
    };
}

interface EventTrackingApiRequest {
    event: string;
    properties: Record<string, any>;
    userId?: number;
    sessionId?: string;
    timestamp?: string;
}
```

### Analytics Response Types
```typescript
interface AnalyticsApiResponse extends ApiResponse<{
    metric: string;
    data: Array<{
        timestamp: string;
        value: number;
        metadata?: Record<string, any>;
    }>;
    summary: {
        total: number;
        average: number;
        peak: number;
        trend: "up" | "down" | "stable";
        changePercent: number;
    };
}> {}

interface UserActivityApiResponse extends ApiResponse<{
    activities: Array<{
        id: string;
        type: string;
        description: string;
        timestamp: string;
        metadata: Record<string, any>;
    }>;
    summary: {
        totalActivities: number;
        lastActivity: string;
        mostActiveHour: number;
        activityScore: number;
    };
}> {}
```

## ⚙️ Configuration API Types

### Settings Request Types
```typescript
interface UserSettingsApiRequest {
    notifications?: {
        email: boolean;
        push: boolean;
        wishReminders: boolean;
        weeklyDigest: boolean;
    };
    privacy?: {
        profilePublic: boolean;
        wishesPublic: boolean;
        showEmail: boolean;
    };
    preferences?: {
        theme: "light" | "dark" | "auto";
        language: string;
        timezone: string;
        currency: string;
    };
}

interface SystemConfigApiRequest {
    feature: string;
    enabled: boolean;
    config?: Record<string, any>;
}
```

### Settings Response Types
```typescript
interface UserSettingsApiResponse extends ApiResponse<{
    notifications: {
        email: boolean;
        push: boolean;
        wishReminders: boolean;
        weeklyDigest: boolean;
    };
    privacy: {
        profilePublic: boolean;
        wishesPublic: boolean;
        showEmail: boolean;
    };
    preferences: {
        theme: "light" | "dark" | "auto";
        language: string;
        timezone: string;
        currency: string;
    };
}> {}

interface SystemHealthApiResponse extends ApiResponse<{
    status: "healthy" | "degraded" | "down";
    services: Array<{
        name: string;
        status: "healthy" | "degraded" | "down";
        responseTime: number;
        lastCheck: string;
    }>;
    uptime: number; // seconds
    version: string;
    environment: string;
}> {}
```

## 🔔 Notification API Types

### Notification Request Types
```typescript
interface NotificationApiRequest {
    type: "wish_reminder" | "system_update" | "achievement" | "custom";
    recipientId: number;
    title: string;
    message: string;
    data?: Record<string, any>;
    scheduledFor?: string; // ISO date
    channels: Array<"email" | "push" | "in-app">;
}

interface NotificationQueryApiParams {
    page?: number;
    limit?: number;
    type?: string;
    read?: boolean;
    since?: string; // ISO date
}

interface MarkNotificationApiRequest {
    notificationIds: number[];
    action: "read" | "unread" | "delete" | "archive";
}
```

### Notification Response Types
```typescript
interface NotificationApiResponse extends ApiResponse<{
    id: number;
    type: string;
    title: string;
    message: string;
    data?: Record<string, any>;
    isRead: boolean;
    createdAt: string;
    readAt?: string;
    expiresAt?: string;
}> {}

interface NotificationListApiResponse extends PaginatedResponse<NotificationApiResponse['data']> {
    data: {
        notifications: NotificationApiResponse['data'][];
        unreadCount: number;
        summary: {
            total: number;
            unread: number;
            byType: Record<string, number>;
        };
    };
}
```

## ❌ API Error Types

### Standard Error Codes
```typescript
type ApiErrorCode =
    | "AUTHENTICATION_REQUIRED"
    | "INVALID_CREDENTIALS"
    | "ACCESS_DENIED"
    | "RESOURCE_NOT_FOUND"
    | "VALIDATION_FAILED"
    | "RATE_LIMIT_EXCEEDED"
    | "SERVER_ERROR"
    | "SERVICE_UNAVAILABLE"
    | "TIMEOUT"
    | "NETWORK_ERROR"
    | "INVALID_REQUEST"
    | "DUPLICATE_RESOURCE"
    | "INSUFFICIENT_PERMISSIONS"
    | "MAINTENANCE_MODE";

interface ValidationError {
    field: string;
    message: string;
    code: string;
    value?: any;
}

interface RateLimitError extends ApiError {
    retryAfter: number; // seconds
    limit: number;
    remaining: number;
    resetTime: string;
}

interface NetworkError extends ApiError {
    isNetworkError: true;
    offline: boolean;
    timeout: boolean;
    retryable: boolean;
}
```

### Error Response Types
```typescript
interface ValidationErrorResponse extends ApiResponse<never> {
    success: false;
    error: ApiError & {
        code: "VALIDATION_FAILED";
        validationErrors: ValidationError[];
    };
}

interface AuthErrorResponse extends ApiResponse<never> {
    success: false;
    error: ApiError & {
        code: "AUTHENTICATION_REQUIRED" | "INVALID_CREDENTIALS" | "ACCESS_DENIED";
        requiresReauth?: boolean;
        redirectTo?: string;
    };
}

interface RateLimitErrorResponse extends ApiResponse<never> {
    success: false;
    error: RateLimitError;
}
```

## 🔧 API Client Interface

### HTTP Client Interface
```typescript
interface ApiClient {
    get<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>>;
    post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>>;
    put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>>;
    patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>>;
    delete<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>>;

    setAuthToken(token: string): void;
    clearAuthToken(): void;

    addRequestInterceptor(interceptor: RequestInterceptor): number;
    addResponseInterceptor(interceptor: ResponseInterceptor): number;
    removeInterceptor(id: number): void;

    setBaseURL(url: string): void;
    setTimeout(timeout: number): void;
}

interface ApiService {
    client: ApiClient;

    // Auth endpoints
    login(credentials: LoginApiRequest): Promise<LoginApiResponse>;
    register(userData: RegisterApiRequest): Promise<RegisterApiResponse>;
    logout(): Promise<ApiResponse<{}>>;
    refreshToken(): Promise<TokenRefreshApiResponse>;

    // User endpoints
    getProfile(): Promise<UserProfileApiResponse>;
    updateProfile(data: UpdateProfileApiRequest): Promise<UserProfileApiResponse>;
    changePassword(data: ChangePasswordApiRequest): Promise<ApiResponse<{}>>;

    // Wish endpoints
    getWishes(params?: WishQueryApiParams): Promise<WishListApiResponse>;
    getWish(id: number): Promise<WishApiResponse>;
    createWish(data: CreateWishApiRequest): Promise<WishApiResponse>;
    updateWish(id: number, data: UpdateWishApiRequest): Promise<WishApiResponse>;
    deleteWish(id: number): Promise<ApiResponse<{}>>;

    // File upload
    uploadFile(data: FileUploadApiRequest): Promise<FileUploadApiResponse>;
    uploadFiles(data: MultiFileUploadApiRequest): Promise<MultiFileUploadApiResponse>;
    deleteFile(data: FileDeleteApiRequest): Promise<ApiResponse<{}>>;

    // Search
    search(data: SearchApiRequest): Promise<SearchApiResponse>;
    autocomplete(query: string): Promise<AutocompleteApiResponse>;

    // Analytics
    getAnalytics(data: AnalyticsApiRequest): Promise<AnalyticsApiResponse>;
    trackEvent(data: EventTrackingApiRequest): Promise<ApiResponse<{}>>;

    // Notifications
    getNotifications(params?: NotificationQueryApiParams): Promise<NotificationListApiResponse>;
    markNotifications(data: MarkNotificationApiRequest): Promise<ApiResponse<{}>>;
}
```

## 🎣 API Hook Types

### React Query Hook Types
```typescript
interface UseApiQueryOptions<T> {
    enabled?: boolean;
    staleTime?: number;
    cacheTime?: number;
    refetchOnWindowFocus?: boolean;
    refetchInterval?: number;
    retry?: number | boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: ApiError) => void;
    initialData?: T;
}

interface UseApiMutationOptions<T, V = any> {
    onSuccess?: (data: T, variables: V) => void;
    onError?: (error: ApiError, variables: V) => void;
    onSettled?: (data: T | undefined, error: ApiError | null, variables: V) => void;
    retry?: number | boolean;
}

interface ApiQueryResult<T> {
    data?: T;
    isLoading: boolean;
    isError: boolean;
    error?: ApiError;
    isFetching: boolean;
    refetch: () => Promise<T>;
    remove: () => void;
}

interface ApiMutationResult<T, V = any> {
    mutate: (variables: V) => void;
    mutateAsync: (variables: V) => Promise<T>;
    isLoading: boolean;
    isError: boolean;
    error?: ApiError;
    data?: T;
    reset: () => void;
}
```

## 📚 Usage Examples

### API Client Setup
```typescript
const apiClient: ApiClient = new HttpClient({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
    timeout: 30000,
    retries: 3,
    retryDelay: 1000,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
});

// Add auth interceptor
apiClient.addRequestInterceptor({
    onFulfilled: (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    }
});

// Add response interceptor for error handling
apiClient.addResponseInterceptor({
    onRejected: (error) => {
        if (error.response?.status === 401) {
            // Handle authentication errors
            localStorage.removeItem('authToken');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
});
```

### Custom API Hook
```typescript
function useWishApi() {
    const queryClient = useQueryClient();

    const getWishes = useQuery<WishListApiResponse, ApiError>({
        queryKey: ['wishes'],
        queryFn: () => apiService.getWishes(),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const createWish = useMutation<WishApiResponse, ApiError, CreateWishApiRequest>({
        mutationFn: (data) => apiService.createWish(data),
        onSuccess: (response) => {
            queryClient.invalidateQueries(['wishes']);
            toast.success('Wish created successfully!');
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to create wish');
        }
    });

    const updateWish = useMutation<WishApiResponse, ApiError, { id: number; data: UpdateWishApiRequest }>({
        mutationFn: ({ id, data }) => apiService.updateWish(id, data),
        onSuccess: (response, { id }) => {
            queryClient.invalidateQueries(['wishes']);
            queryClient.invalidateQueries(['wish', id]);
            toast.success('Wish updated successfully!');
        }
    });

    return {
        getWishes,
        createWish,
        updateWish,
        // ... other mutations
    };
}
```

## 🎫 Related Linear Tickets

- **[ROM-6](https://linear.app/romcar/issue/ROM-6/)** - API architecture and type safety
- **[ROM-10](https://linear.app/romcar/issue/ROM-10/)** - Error handling and response standards

---

**File Locations:**
- API Types: `backend/src/types/api.types.ts`, `frontend/src/types/api.types.ts`
- Client: `frontend/src/services/apiClient.ts`
- Hooks: `frontend/src/hooks/api.hooks.ts`