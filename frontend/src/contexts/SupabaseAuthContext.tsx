import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from 'react';
import { SupabaseService } from '../services/supabase.service';
import { Profile, User } from '../types/auth.types';

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    session: Session | null;
    loading: boolean;
    error: string | null;
    signUp: (
        email: string,
        password: string,
        firstName?: string,
        lastName?: string
    ) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    updateProfile: (updates: Partial<Profile>) => Promise<void>;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Convert Supabase user to our User type
    const convertSupabaseUser = (
        supabaseUser: SupabaseUser,
        userProfile?: Profile | null
    ): User => {
        // Helper to prefer profile value, then metadata value, then default
        const getString = (
            profileVal?: string | null,
            metadataVal?: any,
            defaultVal = ''
        ): string => profileVal ?? metadataVal ?? defaultVal;

        const metadata = supabaseUser.user_metadata ?? {};

        return {
            id: supabaseUser.id,
            email: supabaseUser.email ?? '',
            firstName: getString(userProfile?.first_name, metadata.first_name),
            lastName: getString(userProfile?.last_name, metadata.last_name),
            two_factor_enabled: false, // Supabase MFA would be handled differently
            email_verified: supabaseUser.email_confirmed_at != null,
            created_at: supabaseUser.created_at,
            avatar_url:
                getString(
                    userProfile?.avatar_url,
                    metadata.avatar_url,
                    undefined as any
                ) || undefined,
        };
    };

    // Helper: throw early if no authenticated user
    const throwIfNoUser = (u: User | null) => {
        if (!u) {
            throw new Error('No authenticated user');
        }
    };

    // Helper: apply first/last name updates to a User object if needed
    const applyNameUpdates = (
        prev: User | null,
        updates: Partial<Profile>
    ): User | null => {
        if (!prev) {
            return prev;
        }
        const firstName = updates.first_name ?? prev.firstName;
        const lastName = updates.last_name ?? prev.lastName;

        // If nothing changed, return previous reference
        if (firstName === prev.firstName && lastName === prev.lastName) {
            return prev;
        }

        return {
            ...prev,
            firstName,
            lastName,
        };
    };

    // Initialize auth state
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                setLoading(true);

                // Get initial session
                const session = await SupabaseService.getCurrentSession();

                if (session?.user) {
                    // Get user profile
                    const userProfile = await SupabaseService.getProfile(
                        session.user.id
                    );

                    setSession(session);
                    setUser(convertSupabaseUser(session.user, userProfile));
                    setProfile(userProfile);
                }
            } catch (err) {
                console.error('Error initializing auth:', err);
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Authentication initialization failed'
                );
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();

        // Listen for auth changes
        const {
            data: { subscription },
        } = SupabaseService.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event, session);

            if (session?.user) {
                // User signed in
                const userProfile = await SupabaseService.getProfile(
                    session.user.id
                );

                setSession(session);
                setUser(convertSupabaseUser(session.user, userProfile));
                setProfile(userProfile);
            } else {
                // User signed out
                setSession(null);
                setUser(null);
                setProfile(null);
            }

            setLoading(false);
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    const signUp = async (
        email: string,
        password: string,
        firstName?: string,
        lastName?: string
    ) => {
        try {
            setLoading(true);
            setError(null);

            await SupabaseService.signUp(email, password, firstName, lastName);

            // Note: User will need to confirm email before they can sign in
            setError(null);
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'Sign up failed';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            setLoading(true);
            setError(null);

            const { user: supabaseUser, session } =
                await SupabaseService.signIn(email, password);

            if (supabaseUser && session) {
                const userProfile = await SupabaseService.getProfile(
                    supabaseUser.id
                );

                setSession(session);
                setUser(convertSupabaseUser(supabaseUser, userProfile));
                setProfile(userProfile);
            }
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'Sign in failed';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        try {
            setLoading(true);
            setError(null);

            await SupabaseService.signOut();

            setSession(null);
            setUser(null);
            setProfile(null);
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'Sign out failed';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (updates: Partial<Profile>) => {
        throwIfNoUser(user);

        try {
            setLoading(true);
            setError(null);

            const updatedProfile = await SupabaseService.updateProfile(
                user!.id,
                updates
            );

            setProfile(updatedProfile);

            // Update user object if firstName or lastName changed
            setUser(prev => applyNameUpdates(prev, updates));
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'Profile update failed';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    };

    const clearError = () => {
        setError(null);
    };

    const value: AuthContextType = {
        user,
        profile,
        session,
        loading,
        error,
        signUp,
        signIn,
        signOut,
        updateProfile,
        clearError,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export default AuthProvider;
