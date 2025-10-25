import React, { useState } from 'react';
import './App.css';
import DemoBanner from './components/DemoBanner';
import WishForm from './components/WishForm';
import WishList from './components/WishList';
import {
    AuthProvider as SupabaseAuthProvider,
    useAuth,
} from './contexts/SupabaseAuthContext';
import { useWishes } from './hooks/useWishes';
import { isGitHubPages } from './services/mock-api';
import { CreateWishInput } from './types/wish.types';

// Authentication Modal Component
interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
    const [isLoading, setIsLoading] = useState(false);
    const { signIn, signUp, error, clearError } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        confirmPassword: '',
    });

    if (!isOpen) {
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        clearError();

        try {
            if (authMode === 'login') {
                await signIn(formData.email, formData.password);
                onClose();
            } else {
                if (formData.password !== formData.confirmPassword) {
                    throw new Error('Passwords do not match');
                }
                await signUp(
                    formData.email,
                    formData.password,
                    formData.firstName,
                    formData.lastName
                );
                alert('Check your email for the confirmation link!');
                onClose();
            }
        } catch (err) {
            console.error('Authentication error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            confirmPassword: '',
        });
        clearError();
    };

    const authModeSwitch = () => {
        setAuthMode(authMode === 'login' ? 'register' : 'login');
        resetForm();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        {authMode === 'login' ? 'Sign In' : 'Create Account'}
                    </h2>
                    <button className="modal-close" onClick={onClose}>
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {error && <div className="error-message">{error}</div>}

                    {authMode === 'register' && (
                        <>
                            <div className="form-group">
                                <label htmlFor="firstName">First Name</label>
                                <input
                                    type="text"
                                    id="firstName"
                                    value={formData.firstName}
                                    onChange={e =>
                                        setFormData({
                                            ...formData,
                                            firstName: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="lastName">Last Name</label>
                                <input
                                    type="text"
                                    id="lastName"
                                    value={formData.lastName}
                                    onChange={e =>
                                        setFormData({
                                            ...formData,
                                            lastName: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>
                        </>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={formData.email}
                            onChange={e =>
                                setFormData({
                                    ...formData,
                                    email: e.target.value,
                                })
                            }
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={formData.password}
                            onChange={e =>
                                setFormData({
                                    ...formData,
                                    password: e.target.value,
                                })
                            }
                            required
                        />
                    </div>

                    {authMode === 'register' && (
                        <div className="form-group">
                            <label htmlFor="confirmPassword">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={e =>
                                    setFormData({
                                        ...formData,
                                        confirmPassword: e.target.value,
                                    })
                                }
                                required
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        className="submit-button"
                        disabled={isLoading}
                    >
                        {isLoading
                            ? authMode === 'login'
                                ? 'Signing In...'
                                : 'Creating Account...'
                            : authMode === 'login'
                              ? 'Sign In'
                              : 'Create Account'}
                    </button>

                    <div className="auth-switch">
                        {authMode === 'login'
                            ? "Don't have an account? "
                            : 'Already have an account? '}
                        <button
                            type="button"
                            className="link-button"
                            onClick={authModeSwitch}
                        >
                            {authMode === 'login' ? 'Sign up' : 'Sign in'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// User Menu Component
const UserMenu: React.FC = () => {
    const { user, signOut } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    if (!user) {
        return null;
    }

    const handleSignOut = async () => {
        await signOut();
        setIsMenuOpen(false);
    };

    return (
        <div className="user-menu">
            <button
                className="user-menu-button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
                <span className="user-avatar">
                    {user.firstName.charAt(0)}
                    {user.lastName.charAt(0)}
                </span>
                <span className="user-name">
                    {user.firstName} {user.lastName}
                </span>
                <span className="user-menu-arrow">▼</span>
            </button>
            {isMenuOpen && (
                <div className="user-menu-dropdown">
                    <div className="user-menu-info">
                        <div className="user-menu-name">
                            {user.firstName} {user.lastName}
                        </div>
                        <p className="user-email">{user.email}</p>
                    </div>
                    <hr />
                    <button className="user-menu-item" onClick={handleSignOut}>
                        Sign Out
                    </button>
                </div>
            )}
        </div>
    );
};

// Main App Content Component
function AppContent() {
    const { user, loading: authLoading } = useAuth();
    const {
        wishes,
        loading: wishesLoading,
        error,
        createWish,
        updateWish,
        deleteWish,
        clearError,
    } = useWishes();
    const [authModalOpen, setAuthModalOpen] = useState(false);

    const loading = authLoading || wishesLoading;

    const handleCreateWish = async (wishData: CreateWishInput) => {
        try {
            await createWish(wishData);
        } catch (error) {
            console.error('Failed to create wish:', error);
        }
    };

    const handleStatusChange = async (
        id: number,
        status: 'pending' | 'fulfilled' | 'cancelled'
    ) => {
        try {
            await updateWish(id, { status });
        } catch (error) {
            console.error('Failed to update wish status:', error);
        }
    };

    const handleDeleteWish = async (id: number) => {
        try {
            await deleteWish(id);
        } catch (error) {
            console.error('Failed to delete wish:', error);
        }
    };

    return (
        <div className="App">
            {isGitHubPages && <DemoBanner />}

            <header className="App-header">
                <div className="header-content">
                    <div className="header-left">
                        <h1 className="app-title">🌟 WishMaker</h1>
                        <p className="app-subtitle">
                            Make your dreams come true
                        </p>
                    </div>

                    <div className="header-right">
                        {user ? (
                            <UserMenu />
                        ) : (
                            <button
                                className="auth-button"
                                onClick={() => setAuthModalOpen(true)}
                            >
                                Sign In
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="App-main">
                {error && (
                    <div className="error-banner">
                        <span>{error}</span>
                        <button onClick={clearError} className="error-close">
                            ×
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading your wishes...</p>
                    </div>
                ) : user ? (
                    <div className="dashboard">
                        <div className="welcome-section">
                            <h2>Welcome back, {user.firstName}!</h2>
                            <p>
                                What dreams would you like to make come true
                                today?
                            </p>
                        </div>

                        <div className="wish-section">
                            <WishForm onSubmit={handleCreateWish} />
                            <WishList
                                wishes={wishes}
                                onStatusChange={handleStatusChange}
                                onDelete={handleDeleteWish}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="landing-section">
                        <div className="hero">
                            <h2>Transform Your Dreams Into Reality</h2>
                            <p>
                                WishMaker helps you capture, organize, and
                                achieve your life goals. Start your journey
                                today!
                            </p>
                            <button
                                className="cta-button"
                                onClick={() => setAuthModalOpen(true)}
                            >
                                Get Started Free
                            </button>
                        </div>

                        <div className="features">
                            <div className="feature">
                                <h3>📝 Capture Dreams</h3>
                                <p>
                                    Write down your wishes and goals in a
                                    beautiful, organized way
                                </p>
                            </div>
                            <div className="feature">
                                <h3>🎯 Track Progress</h3>
                                <p>
                                    Monitor your journey and celebrate
                                    milestones along the way
                                </p>
                            </div>
                            <div className="feature">
                                <h3>✨ Stay Motivated</h3>
                                <p>
                                    Get inspired daily and turn your wishes into
                                    achievements
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <AuthModal
                isOpen={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
            />
        </div>
    );
}

// Main App with Supabase Provider
function SupabaseApp() {
    return (
        <SupabaseAuthProvider>
            <AppContent />
        </SupabaseAuthProvider>
    );
}

export default SupabaseApp;
