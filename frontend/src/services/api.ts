import axios, { AxiosError, AxiosResponse } from 'axios';
import { CreateWishInput, UpdateWishInput, Wish } from '../types/wish.types';
import { TokenManager } from './auth.service';
import { isGitHubPages, mockWishAPI } from './mock-api';

// TODO: ENVIRONMENT - Move API URL to environment configuration file
// Need to create .env file with REACT_APP_API_URL for production deployment
// Currently defaults to localhost which won't work in production
const API_BASE_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api`;

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add authentication token
api.interceptors.request.use(
    config => {
        const token = TokenManager.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Handle 401 errors (Unauthorized)
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // TODO: MISMATCH - Token refresh endpoint structure inconsistency
                // Backend may expect different field names or structure
                // Need to verify backend /auth/refresh endpoint expects refreshToken field
                // Also check response structure matches { accessToken, refreshToken }
                const refreshToken = TokenManager.getRefreshToken();
                if (refreshToken) {
                    const response: AxiosResponse<{
                        accessToken: string;
                        refreshToken: string;
                    }> = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                        refreshToken,
                    });

                    // TODO: ENHANCEMENT - Add response validation
                    // Should validate response structure before using data
                    // Add error handling for malformed refresh responses
                    const { accessToken, refreshToken: newRefreshToken } =
                        response.data;
                    TokenManager.setToken(accessToken);
                    TokenManager.setRefreshToken(newRefreshToken);

                    // Retry the original request with the new token
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return api(originalRequest);
                }
            } catch {
                // TODO: ERROR HANDLING - Improve refresh failure handling
                // Should log the specific error for debugging
                // Consider showing user-friendly notification
                // Add retry mechanism with exponential backoff
                TokenManager.clearTokens();

                // TODO: ENHANCEMENT - Make event system more robust
                // Consider using a proper event emitter or state management
                // Add event listener cleanup to prevent memory leaks
                window.dispatchEvent(
                    new CustomEvent('auth:logout', {
                        detail: { reason: 'token_refresh_failed' },
                    })
                );
            }
        }

        // TODO: ENHANCEMENT - Expand error handling coverage
        // Add handling for 429 (Too Many Requests), 422 (Validation Error)
        // Consider different user messages based on API context
        // Add error reporting/analytics integration
        if (error.response?.status === 403) {
            // Forbidden - user doesn't have permission
            throw new Error(
                'You do not have permission to perform this action.'
            );
        }

        if (error.response?.status === 404) {
            // Not found
            throw new Error('The requested resource was not found.');
        }

        if (error.response && error.response.status >= 500) {
            // TODO: IMPROVEMENT - Add server error details when in development
            // Include error ID or timestamp for support team
            // Consider offline/retry mechanisms for server errors
            throw new Error('A server error occurred. Please try again later.');
        }

        // TODO: ENHANCEMENT - Better network error detection
        // Distinguish between timeout, DNS failure, and connection refused
        // Add offline detection and retry strategies
        if (!error.response) {
            throw new Error(
                'Network error. Please check your internet connection.'
            );
        }

        // Pass through the original error for specific handling
        return Promise.reject(error);
    }
);

// Utility function to check if user is authenticated for API calls
export const isAuthenticatedForAPI = (): boolean => {
    return !!TokenManager.getToken();
};

// Utility function to handle API errors
export const handleAPIError = (error: any): string => {
    if (error.response?.data?.message) {
        return error.response.data.message;
    }

    if (error.message) {
        return error.message;
    }

    return 'An unexpected error occurred. Please try again.';
};

// Enhanced wishAPI with better error handling
export const wishAPI = {
    getAllWishes: async (): Promise<Wish[]> => {
        if (isGitHubPages) {
            return mockWishAPI.getWishes();
        }
        try {
            const response = await api.get<Wish[]>('/wishes');
            return response.data;
        } catch (error) {
            throw new Error(handleAPIError(error));
        }
    },

    getWishById: async (id: number): Promise<Wish> => {
        if (isGitHubPages) {
            return mockWishAPI.getWish(id);
        }
        try {
            const response = await api.get<Wish>(`/wishes/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(handleAPIError(error));
        }
    },

    createWish: async (wish: CreateWishInput): Promise<Wish> => {
        if (isGitHubPages) {
            return mockWishAPI.createWish(wish);
        }
        try {
            if (!isAuthenticatedForAPI()) {
                throw new Error('You must be logged in to create a wish.');
            }
            const response = await api.post<Wish>('/wishes', wish);
            return response.data;
        } catch (error) {
            throw new Error(handleAPIError(error));
        }
    },

    updateWish: async (id: number, wish: UpdateWishInput): Promise<Wish> => {
        if (isGitHubPages) {
            return mockWishAPI.updateWish(id, wish);
        }
        try {
            if (!isAuthenticatedForAPI()) {
                throw new Error('You must be logged in to update a wish.');
            }
            const response = await api.put<Wish>(`/wishes/${id}`, wish);
            return response.data;
        } catch (error) {
            throw new Error(handleAPIError(error));
        }
    },

    deleteWish: async (id: number): Promise<void> => {
        if (isGitHubPages) {
            return mockWishAPI.deleteWish(id);
        }
        try {
            if (!isAuthenticatedForAPI()) {
                throw new Error('You must be logged in to delete a wish.');
            }
            await api.delete(`/wishes/${id}`);
        } catch (error) {
            throw new Error(handleAPIError(error));
        }
    },
};

export default api;
