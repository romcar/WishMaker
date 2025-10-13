# 🎨 Component Types Reference

Complete reference for React component TypeScript types used throughout the WishMaker frontend application.

## 🎯 Overview

This document covers all TypeScript types related to React components, including props, state, event handlers, and component-specific interfaces used in the WishMaker application.

## 🧩 Common Component Types

### Base Component Props
```typescript
interface BaseComponentProps {
    className?: string;
    id?: string;
    'data-testid'?: string;
    children?: React.ReactNode;
}

interface BaseButtonProps extends BaseComponentProps {
    variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
    size?: "sm" | "md" | "lg";
    disabled?: boolean;
    loading?: boolean;
    icon?: React.ReactNode;
    iconPosition?: "left" | "right";
}

interface BaseInputProps extends BaseComponentProps {
    name: string;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    error?: string;
    helperText?: string;
}
```

## 📝 Form Component Types

### Form Input Components
```typescript
interface TextInputProps extends BaseInputProps {
    type?: "text" | "email" | "password" | "url" | "tel";
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    onFocus?: () => void;
    maxLength?: number;
    minLength?: number;
    pattern?: string;
    autoComplete?: string;
    autoFocus?: boolean;
}

interface TextAreaProps extends Omit<BaseInputProps, 'children'> {
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    onFocus?: () => void;
    rows?: number;
    maxLength?: number;
    resize?: "none" | "vertical" | "horizontal" | "both";
    autoResize?: boolean;
}

interface SelectProps<T = string> extends BaseInputProps {
    value: T;
    onChange: (value: T) => void;
    options: Array<{
        value: T;
        label: string;
        disabled?: boolean;
        icon?: React.ReactNode;
    }>;
    multiple?: boolean;
    searchable?: boolean;
    clearable?: boolean;
    loading?: boolean;
    emptyMessage?: string;
}

interface DatePickerProps extends BaseInputProps {
    value: string; // ISO date string
    onChange: (value: string) => void;
    minDate?: string;
    maxDate?: string;
    format?: string;
    showTime?: boolean;
    timezone?: string;
}

interface FileUploadProps extends BaseInputProps {
    value?: File | File[];
    onChange: (files: File | File[] | null) => void;
    accept?: string;
    multiple?: boolean;
    maxSize?: number; // in bytes
    maxFiles?: number;
    preview?: boolean;
    dragAndDrop?: boolean;
}
```

### Specialized Form Components
```typescript
interface TagInputProps extends BaseInputProps {
    value: string[];
    onChange: (tags: string[]) => void;
    suggestions?: string[];
    maxTags?: number;
    allowDuplicates?: boolean;
    caseSensitive?: boolean;
    separator?: string | RegExp;
    validateTag?: (tag: string) => boolean | string;
}

interface RichTextEditorProps extends BaseInputProps {
    value: string;
    onChange: (value: string) => void;
    format?: "html" | "markdown";
    toolbar?: Array<"bold" | "italic" | "underline" | "link" | "list" | "quote" | "code">;
    maxLength?: number;
    minHeight?: number;
    placeholder?: string;
}

interface RatingInputProps extends BaseInputProps {
    value: number;
    onChange: (rating: number) => void;
    max?: number;
    precision?: number; // 1 for whole numbers, 0.5 for half ratings
    icon?: React.ComponentType<{ filled: boolean }>;
    size?: "sm" | "md" | "lg";
    readonly?: boolean;
}
```

## 🎯 Wish-Related Component Types

### Wish Form Components
```typescript
interface WishFormProps {
    initialWish?: Partial<FrontendWish>;
    onSubmit: (wish: CreateWishRequest | UpdateWishRequest) => Promise<void>;
    onCancel?: () => void;
    isLoading?: boolean;
    mode: "create" | "edit";
    className?: string;
}

interface WishFormState {
    title: string;
    description: string;
    category: WishCategory;
    priority: WishPriority;
    status: WishStatus;
    target_date: string;
    is_public: boolean;
    tags: string[];
    estimated_cost: string;
    actual_cost: string;
    location: string;
    notes: string;
    image_file?: File;
}

interface WishFormErrors {
    [key: string]: string | undefined;
    title?: string;
    description?: string;
    category?: string;
    priority?: string;
    target_date?: string;
    estimated_cost?: string;
    actual_cost?: string;
    general?: string;
}

interface WishCategorySelectProps {
    value: WishCategory;
    onChange: (category: WishCategory) => void;
    disabled?: boolean;
    error?: string;
    showIcons?: boolean;
    className?: string;
}

interface WishPrioritySelectProps {
    value: WishPriority;
    onChange: (priority: WishPriority) => void;
    disabled?: boolean;
    error?: string;
    showColors?: boolean;
    className?: string;
}

interface WishStatusBadgeProps {
    status: WishStatus;
    size?: "sm" | "md" | "lg";
    showIcon?: boolean;
    interactive?: boolean;
    onClick?: (status: WishStatus) => void;
    className?: string;
}
```

### Wish Display Components
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
    onView?: (wish: FrontendWish) => void;
    className?: string;
}

interface WishListProps {
    wishes: FrontendWish[];
    isLoading?: boolean;
    error?: string;
    emptyMessage?: string;
    filters?: WishFilterState;
    onFilterChange?: (filters: WishFilterState) => void;
    onWishClick?: (wish: FrontendWish) => void;
    onWishEdit?: (wish: FrontendWish) => void;
    onWishDelete?: (wishId: number) => void;
    pagination?: PaginationProps;
    viewMode?: "grid" | "list" | "compact";
    sortOptions?: SortOptionsProps;
    className?: string;
}

interface WishGridProps {
    wishes: FrontendWish[];
    columns?: 1 | 2 | 3 | 4;
    gap?: "sm" | "md" | "lg";
    onWishClick?: (wish: FrontendWish) => void;
    onWishEdit?: (wish: FrontendWish) => void;
    onWishDelete?: (wishId: number) => void;
    className?: string;
}

interface WishDetailProps {
    wish: FrontendWish;
    isLoading?: boolean;
    error?: string;
    onEdit?: () => void;
    onDelete?: () => void;
    onStatusChange?: (status: WishStatus) => void;
    onClose?: () => void;
    showRelated?: boolean;
    className?: string;
}
```

### Wish Filter Components
```typescript
interface WishFilterProps {
    filters: WishFilterState;
    onFiltersChange: (filters: WishFilterState) => void;
    availableCategories?: WishCategory[];
    availableTags?: string[];
    availableUsers?: Array<{ id: number; username: string }>; // For admin view
    isCollapsible?: boolean;
    showAdvanced?: boolean;
    className?: string;
}

interface CategoryFilterProps {
    selectedCategories: WishCategory[];
    onCategoriesChange: (categories: WishCategory[]) => void;
    availableCategories?: WishCategory[];
    showIcons?: boolean;
    maxVisible?: number;
    className?: string;
}

interface TagFilterProps {
    selectedTags: string[];
    onTagsChange: (tags: string[]) => void;
    availableTags: string[];
    searchable?: boolean;
    maxVisible?: number;
    allowCustom?: boolean;
    className?: string;
}

interface DateRangeFilterProps {
    dateRange: { start?: string; end?: string };
    onDateRangeChange: (range: { start?: string; end?: string }) => void;
    presets?: Array<{
        label: string;
        value: { start?: string; end?: string };
    }>;
    className?: string;
}
```

## 🔐 Authentication Component Types

### Auth Form Components
```typescript
interface LoginFormProps {
    onSubmit: (credentials: LoginRequest) => Promise<void>;
    onRegisterClick?: () => void;
    onForgotPasswordClick?: () => void;
    isLoading?: boolean;
    error?: string;
    redirectTo?: string;
    className?: string;
}

interface RegisterFormProps {
    onSubmit: (userData: RegisterRequest) => Promise<void>;
    onLoginClick?: () => void;
    isLoading?: boolean;
    error?: string;
    requireEmailVerification?: boolean;
    className?: string;
}

interface ForgotPasswordFormProps {
    onSubmit: (email: string) => Promise<void>;
    onBackToLogin?: () => void;
    isLoading?: boolean;
    error?: string;
    successMessage?: string;
    className?: string;
}

interface ResetPasswordFormProps {
    token: string;
    onSubmit: (password: string, confirmPassword: string) => Promise<void>;
    isLoading?: boolean;
    error?: string;
    successMessage?: string;
    className?: string;
}
```

### Auth State Components
```typescript
interface AuthGuardProps {
    children: React.ReactNode;
    requireAuth?: boolean;
    requireVerification?: boolean;
    redirectTo?: string;
    fallback?: React.ReactNode;
    roles?: UserRole[];
}

interface UserProfileProps {
    user: User;
    onUpdate?: (updates: Partial<User>) => Promise<void>;
    onPasswordChange?: (currentPassword: string, newPassword: string) => Promise<void>;
    onDeleteAccount?: () => Promise<void>;
    isLoading?: boolean;
    error?: string;
    className?: string;
}

interface UserAvatarProps {
    user: Pick<User, 'username' | 'avatar_url'>;
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    showName?: boolean;
    showStatus?: boolean;
    onClick?: () => void;
    className?: string;
}
```

## 🎨 UI Component Types

### Layout Components
```typescript
interface LayoutProps {
    children: React.ReactNode;
    sidebar?: React.ReactNode;
    header?: React.ReactNode;
    footer?: React.ReactNode;
    className?: string;
}

interface HeaderProps {
    title?: string;
    subtitle?: string;
    actions?: React.ReactNode;
    breadcrumbs?: Array<{ label: string; href?: string }>;
    user?: User;
    onMenuClick?: () => void;
    className?: string;
}

interface SidebarProps {
    isOpen: boolean;
    onClose?: () => void;
    navigation: Array<{
        label: string;
        href: string;
        icon?: React.ReactNode;
        active?: boolean;
        badge?: string | number;
    }>;
    user?: User;
    className?: string;
}

interface PageContainerProps extends BaseComponentProps {
    title?: string;
    subtitle?: string;
    actions?: React.ReactNode;
    breadcrumbs?: Array<{ label: string; href?: string }>;
    maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
    padding?: "sm" | "md" | "lg";
}
```

### Navigation Components
```typescript
interface BreadcrumbsProps {
    items: Array<{
        label: string;
        href?: string;
        icon?: React.ReactNode;
    }>;
    separator?: React.ReactNode;
    className?: string;
}

interface TabsProps<T = string> {
    value: T;
    onChange: (value: T) => void;
    tabs: Array<{
        value: T;
        label: string;
        icon?: React.ReactNode;
        disabled?: boolean;
        badge?: string | number;
    }>;
    variant?: "line" | "pills" | "cards";
    size?: "sm" | "md" | "lg";
    className?: string;
}

interface PaginationProps {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    siblingCount?: number;
    showFirstLast?: boolean;
    showPrevNext?: boolean;
    size?: "sm" | "md" | "lg";
    className?: string;
}
```

### Feedback Components
```typescript
interface AlertProps {
    type: "success" | "error" | "warning" | "info";
    title?: string;
    message: string;
    dismissible?: boolean;
    onDismiss?: () => void;
    actions?: React.ReactNode;
    icon?: React.ReactNode;
    className?: string;
}

interface ToastProps {
    id: string;
    type: "success" | "error" | "warning" | "info";
    title?: string;
    message: string;
    duration?: number;
    dismissible?: boolean;
    onDismiss?: () => void;
    actions?: React.ReactNode;
}

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    size?: "sm" | "md" | "lg" | "xl" | "full";
    closable?: boolean;
    overlay?: boolean;
    className?: string;
    children: React.ReactNode;
}

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: "danger" | "warning" | "info";
    isLoading?: boolean;
}
```

### Data Display Components
```typescript
interface TableProps<T = any> {
    data: T[];
    columns: Array<{
        key: keyof T;
        label: string;
        sortable?: boolean;
        render?: (value: any, row: T, index: number) => React.ReactNode;
        width?: string;
        align?: "left" | "center" | "right";
    }>;
    onRowClick?: (row: T, index: number) => void;
    onSort?: (key: keyof T, direction: "asc" | "desc") => void;
    sortBy?: keyof T;
    sortDirection?: "asc" | "desc";
    loading?: boolean;
    emptyMessage?: string;
    selectable?: boolean;
    selectedRows?: T[];
    onSelectionChange?: (selected: T[]) => void;
    className?: string;
}

interface StatsCardProps {
    title: string;
    value: string | number;
    change?: {
        value: number;
        type: "increase" | "decrease";
        period?: string;
    };
    icon?: React.ReactNode;
    color?: "blue" | "green" | "yellow" | "red" | "purple" | "gray";
    loading?: boolean;
    className?: string;
}

interface ChartProps {
    data: any[];
    type: "line" | "bar" | "pie" | "donut" | "area";
    xKey?: string;
    yKey?: string;
    colorScheme?: string[];
    width?: number;
    height?: number;
    responsive?: boolean;
    legend?: boolean;
    tooltip?: boolean;
    className?: string;
}
```

## 🔄 Event Handler Types

### Common Event Handlers
```typescript
type ClickHandler = (event: React.MouseEvent<HTMLElement>) => void;
type ChangeHandler<T = string> = (value: T) => void;
type SubmitHandler = (event: React.FormEvent<HTMLFormElement>) => void;
type KeyboardHandler = (event: React.KeyboardEvent<HTMLElement>) => void;
type FocusHandler = (event: React.FocusEvent<HTMLElement>) => void;

interface FormEventHandlers<T = any> {
    onSubmit: (data: T) => void | Promise<void>;
    onChange?: (field: keyof T, value: any) => void;
    onValidate?: (data: T) => Record<keyof T, string> | null;
    onError?: (errors: Record<keyof T, string>) => void;
    onReset?: () => void;
}

interface WishEventHandlers {
    onWishCreate?: (wish: CreateWishRequest) => Promise<void>;
    onWishUpdate?: (id: number, wish: UpdateWishRequest) => Promise<void>;
    onWishDelete?: (id: number) => Promise<void>;
    onWishView?: (wish: FrontendWish) => void;
    onWishStatusChange?: (id: number, status: WishStatus) => Promise<void>;
    onWishShare?: (wish: FrontendWish) => void;
    onWishDuplicate?: (wish: FrontendWish) => Promise<void>;
}
```

## 🎣 React Hook Types

### Custom Hook Return Types
```typescript
interface UseAuthReturn {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (credentials: LoginRequest) => Promise<LoginResponse>;
    register: (userData: RegisterRequest) => Promise<RegisterResponse>;
    logout: () => Promise<void>;
    updateProfile: (updates: Partial<User>) => Promise<User>;
    changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
    error: string | null;
    clearError: () => void;
}

interface UseWishesReturn {
    wishes: FrontendWish[];
    currentWish: FrontendWish | null;
    isLoading: boolean;
    error: string | null;

    createWish: (wish: CreateWishRequest) => Promise<FrontendWish>;
    updateWish: (id: number, wish: UpdateWishRequest) => Promise<FrontendWish>;
    deleteWish: (id: number) => Promise<void>;
    fetchWishes: (params?: WishQueryParams) => Promise<void>;
    fetchWish: (id: number) => Promise<FrontendWish>;

    filters: WishFilterState;
    updateFilters: (filters: Partial<WishFilterState>) => void;
    clearFilters: () => void;

    pagination: PaginationState;
    stats: WishStatsResponse | null;
}

interface UseFormReturn<T> {
    data: T;
    errors: Record<keyof T, string>;
    isValid: boolean;
    isSubmitting: boolean;
    isDirty: boolean;

    setValue: (field: keyof T, value: any) => void;
    setData: (data: Partial<T>) => void;
    setError: (field: keyof T, error: string) => void;
    setErrors: (errors: Record<keyof T, string>) => void;
    clearErrors: () => void;
    reset: (data?: Partial<T>) => void;
    validate: () => boolean;
    submit: () => Promise<void>;
}

interface UsePaginationReturn {
    page: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    setPage: (page: number) => void;
    nextPage: () => void;
    prevPage: () => void;
    goToFirst: () => void;
    goToLast: () => void;
}
```

## 🎯 Context Types

### Theme Context
```typescript
interface ThemeContextType {
    theme: "light" | "dark" | "system";
    setTheme: (theme: "light" | "dark" | "system") => void;
    isDark: boolean;
    colors: Record<string, string>;
    fonts: Record<string, string>;
    breakpoints: Record<string, string>;
}

interface UIContextType {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    mobileMenuOpen: boolean;
    setMobileMenuOpen: (open: boolean) => void;
    notifications: ToastProps[];
    addNotification: (notification: Omit<ToastProps, 'id'>) => void;
    removeNotification: (id: string) => void;
    clearNotifications: () => void;
}
```

## 🔍 Component State Types

### Pagination State
```typescript
interface PaginationState {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
```

### Sort State
```typescript
interface SortState<T = string> {
    field: T;
    direction: "asc" | "desc";
}

interface SortOptionsProps<T = string> {
    field: T;
    direction: "asc" | "desc";
    options: Array<{ value: T; label: string }>;
    onChange: (field: T, direction: "asc" | "desc") => void;
    className?: string;
}
```

### Filter State
```typescript
interface FilterState<T = Record<string, any>> {
    filters: T;
    activeCount: number;
    hasActiveFilters: boolean;
}
```

## ❌ Component Error Types

### Error Boundary Types
```typescript
interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
    fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
    children: React.ReactNode;
}

interface ErrorFallbackProps {
    error: Error;
    resetError: () => void;
    className?: string;
}
```

## 🎫 Related Linear Tickets

- **[ROM-9](https://linear.app/romcar/issue/ROM-9/)** - Component architecture and type safety
- **[ROM-10](https://linear.app/romcar/issue/ROM-10/)** - UI component library

---

**File Locations:**
- Component Types: `frontend/src/types/components.types.ts`
- Hook Types: `frontend/src/hooks/types.ts`
- Context Types: `frontend/src/contexts/types.ts`
- Components: `frontend/src/components/`