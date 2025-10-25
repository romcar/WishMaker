import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useReducer,
} from 'react';
import { AuthService, mockDemoUser } from '../services/auth.service';
import { isGitHubPages } from '../services/mock-api';
import {
    AuthContextType,
    AuthState,
    LoginRequest,
    LoginResponse,
    PublicKeyCredentialCreationOptionsJSON,
    PublicKeyCredentialJSON,
    RegisterRequest,
    RegistrationResponse,
    User,
} from '../types/auth.types';

// TODO: ENHANCEMENT - Improve AuthContext functionality
// 🎫 Linear Ticket: https://linear.app/romcar/issue/ROM-8/implement-complete-authentication-system
// 1. Add user preference management (theme, language, etc.)
// 2. Implement session timeout warnings and auto-renewal
// 3. Add user role and permission management
// 4. Implement device fingerprinting for security
// 5. Add audit logging for authentication events
// 6. Support for multiple simultaneous sessions
// 7. Add offline authentication fallbacks
// 8. Implement account linking (social providers)

// TODO: IMPROVEMENT - Enhance initial state management
// 1. Add user preferences and settings to initial state
// 2. Implement state persistence with configurable storage
// 3. Add session metadata (login time, device info, location)
// 4. Support for multiple authentication states (MFA pending, etc.)
// 5. Add connection status and sync state indicators
// Initial state
const initialState: AuthState = {
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
};

// Action types
type AuthAction =
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null }
    | {
          type: 'LOGIN_SUCCESS';
          payload: { user: User; token: string; refreshToken?: string };
      }
    | { type: 'LOGOUT' }
    | { type: 'CLEAR_ERROR' }
    | {
          type: 'REFRESH_SUCCESS';
          payload: { user: User; token: string; refreshToken?: string };
      };

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
        case 'SET_LOADING':
            return {
                ...state,
                isLoading: action.payload,
            };
        case 'SET_ERROR':
            return {
                ...state,
                error: action.payload,
                isLoading: false,
            };
        case 'LOGIN_SUCCESS':
        case 'REFRESH_SUCCESS':
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                refreshToken: action.payload.refreshToken || state.refreshToken,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            };
        case 'LOGOUT':
            return {
                ...initialState,
                isLoading: false,
            };
        case 'CLEAR_ERROR':
            return {
                ...state,
                error: null,
            };
        default:
            return state;
    }
};

// Create context
const AuthContext = createContext<AuthContextType | null>(null);

// Provider component
interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Initialize auth state on app start
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                dispatch({ type: 'SET_LOADING', payload: true });

                // In GitHub Pages demo mode, automatically "log in" demo user
                if (isGitHubPages) {
                    dispatch({
                        type: 'LOGIN_SUCCESS',
                        payload: {
                            user: mockDemoUser,
                            token: 'demo-token',
                            refreshToken: 'demo-refresh-token',
                        },
                    });
                    dispatch({ type: 'SET_LOADING', payload: false });
                    return;
                }

                const authState = AuthService.getAuthState();

                if (
                    authState.isAuthenticated &&
                    authState.user &&
                    authState.token
                ) {
                    dispatch({
                        type: 'LOGIN_SUCCESS',
                        payload: {
                            user: authState.user,
                            token: authState.token,
                            refreshToken: authState.refreshToken || undefined,
                        },
                    });
                } else if (authState.refreshToken) {
                    // Try to refresh token
                    const newSession = await AuthService.refreshToken();
                    if (newSession) {
                        dispatch({
                            type: 'REFRESH_SUCCESS',
                            payload: {
                                user: newSession.user,
                                token: newSession.token,
                                refreshToken: newSession.refresh_token,
                            },
                        });
                    } else {
                        dispatch({ type: 'LOGOUT' });
                    }
                } else {
                    dispatch({ type: 'SET_LOADING', payload: false });
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                dispatch({ type: 'LOGOUT' });
            }
        };

        initializeAuth();
    }, []);

    // Login function
    const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            dispatch({ type: 'CLEAR_ERROR' });

            const response = await AuthService.login(credentials);

            if (response.success && !response.require_2fa) {
                // Direct login success (no 2FA required)
                if (response.user && response.session_token) {
                    dispatch({
                        type: 'LOGIN_SUCCESS',
                        payload: {
                            user: response.user,
                            token: response.session_token,
                            refreshToken: response.refresh_token,
                        },
                    });
                }
            } else {
                // 2FA required or login pending
                dispatch({ type: 'SET_LOADING', payload: false });
            }

            return response;
        } catch (error: any) {
            const errorMessage = error.message || 'Login failed';
            dispatch({ type: 'SET_ERROR', payload: errorMessage });
            throw new Error(errorMessage);
        }
    };

    // Register function
    const register = async (
        userData: RegisterRequest
    ): Promise<RegistrationResponse> => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            dispatch({ type: 'CLEAR_ERROR' });

            const response = await AuthService.register(userData);

            // Registration doesn't automatically log in
            dispatch({ type: 'SET_LOADING', payload: false });

            return response;
        } catch (error: any) {
            const errorMessage = error.message || 'Registration failed';
            dispatch({ type: 'SET_ERROR', payload: errorMessage });
            throw new Error(errorMessage);
        }
    };

    // WebAuthn verification function
    const verifyWebAuthn = async (
        credential: PublicKeyCredentialJSON,
        challenge: string
    ): Promise<boolean> => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            dispatch({ type: 'CLEAR_ERROR' });

            const session = await AuthService.verifyWebAuthn(
                credential,
                challenge
            );

            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: {
                    user: session.user,
                    token: session.token,
                    refreshToken: session.refresh_token,
                },
            });

            return true;
        } catch (error: any) {
            const errorMessage =
                error.message || 'WebAuthn verification failed';
            dispatch({ type: 'SET_ERROR', payload: errorMessage });
            throw new Error(errorMessage);
        }
    };

    // WebAuthn setup function
    const setupWebAuthn = async (
        deviceName?: string
    ): Promise<PublicKeyCredentialCreationOptionsJSON> => {
        try {
            dispatch({ type: 'CLEAR_ERROR' });

            if (!state.user) {
                throw new Error('User not authenticated');
            }

            return await AuthService.initiateWebAuthnRegistration({
                userId: state.user.id,
                deviceName,
            });
        } catch (error: any) {
            const errorMessage = error.message || 'WebAuthn setup failed';
            dispatch({ type: 'SET_ERROR', payload: errorMessage });
            throw new Error(errorMessage);
        }
    };

    // Logout function
    const logout = async (): Promise<void> => {
        try {
            // In demo mode, don't call backend logout service
            if (!isGitHubPages) {
                await AuthService.logout();
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            dispatch({ type: 'LOGOUT' });
        }
    };

    // Clear error function
    const clearError = (): void => {
        dispatch({ type: 'CLEAR_ERROR' });
    };

    // Refresh session function
    const refreshSession = async (): Promise<boolean> => {
        try {
            const newSession = await AuthService.refreshToken();

            if (newSession) {
                dispatch({
                    type: 'REFRESH_SUCCESS',
                    payload: {
                        user: newSession.user,
                        token: newSession.token,
                        refreshToken: newSession.refresh_token,
                    },
                });
                return true;
            }

            return false;
        } catch (error) {
            console.error('Session refresh error:', error);
            dispatch({ type: 'LOGOUT' });
            return false;
        }
    };

    const contextValue: AuthContextType = {
        ...state,
        login,
        register,
        logout,
        verifyWebAuthn,
        setupWebAuthn,
        clearError,
        refreshSession,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
};

// HOC for components that require authentication
interface WithAuthOptions {
    redirectTo?: string;
    requireAuth?: boolean;
}

export const withAuth = <P extends object>(
    Component: React.ComponentType<P>,
    options: WithAuthOptions = { requireAuth: true }
) => {
    return (props: P) => {
        const { isAuthenticated, isLoading } = useAuth();

        if (isLoading) {
            return (
                <div className="auth-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading...</p>
                </div>
            );
        }

        if (options.requireAuth && !isAuthenticated) {
            return (
                <div className="auth-required">
                    <h2>Authentication Required</h2>
                    <p>Please log in to access this content.</p>
                </div>
            );
        }

        if (!options.requireAuth && isAuthenticated && options.redirectTo) {
            // Redirect authenticated users away from login/register pages
            window.location.href = options.redirectTo;
            return null;
        }

        return <Component {...props} />;
    };
};

export default AuthContext;
