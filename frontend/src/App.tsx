// TODO: ARCHITECTURE IMPROVEMENTS - App.tsx is doing too much
// Consider splitting into smaller, focused components:
// 1. AuthModalManager for authentication state
// 2. WishManager for wish CRUD operations
// 3. NavigationHeader for header/user menu
// 4. ErrorBoundary for global error handling
// 5. NotificationProvider for user feedback
// 6. Router setup for multiple pages/views
import {
    StackHandler,
    StackProvider,
    StackTheme,
    useUser,
} from '@stackframe/react';
import { Suspense, useState } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import './App.css';
import DemoBanner from './components/DemoBanner';
import DeveloperToolbar from './components/DeveloperToolbar';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Register from './components/Register';
import WishForm from './components/WishForm';
import WishList from './components/WishList';
import { useAuth } from './contexts/AuthContext';
import { useNeonWishes } from './hooks/useNeonWishes';
import { stackClientApp } from './stack';
import { CreateWishInput } from './types/wish.types';

function HandleRoutes() {
    const location = useLocation();

    return (
        <StackHandler
            app={stackClientApp}
            location={location.pathname}
            fullPage
        />
    );
}

// Authentication Modal Component
interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

    if (!isOpen) {
        return null;
    }

    const handleSwitchToLogin = () => setAuthMode('login');
    const handleSwitchToRegister = () => setAuthMode('register');
    const handleAuthSuccess = () => {
        onClose();
        setAuthMode('login'); // Reset to login for next time
    };

    return (
        <div className="auth-modal-overlay" onClick={onClose}>
            <div
                className="auth-modal-content"
                onClick={e => e.stopPropagation()}
            >
                <button className="auth-modal-close" onClick={onClose}>
                    ✕
                </button>
                {authMode === 'login' ? (
                    <Login
                        onSwitchToRegister={handleSwitchToRegister}
                        onSuccess={handleAuthSuccess}
                    />
                ) : (
                    <Register
                        onSwitchToLogin={handleSwitchToLogin}
                        onSuccess={handleAuthSuccess}
                    />
                )}
            </div>
        </div>
    );
};

// User Menu Component
const UserMenu: React.FC = () => {
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    if (!user) {
        return null;
    }

    const handleLogout = async () => {
        await logout();
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
            </button>
            {isMenuOpen && (
                <div className="user-menu-dropdown">
                    <div className="user-menu-info">
                        <p>
                            <strong>
                                {user.firstName} {user.lastName}
                            </strong>
                        </p>
                        <p className="user-email">{user.email}</p>
                    </div>
                    <hr />
                    <button
                        className="user-menu-item"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Profile Settings
                    </button>
                    <button
                        className="user-menu-item"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Account Security
                    </button>
                    <hr />
                    <button
                        className="user-menu-item logout"
                        onClick={handleLogout}
                    >
                        Sign Out
                    </button>
                </div>
            )}
        </div>
    );
};

// Main App Content Component
function AppContent() {
    const user = useUser();
    const {
        wishes,
        loading,
        error,
        createWish: neonCreateWish,
        deleteWish: neonDeleteWish,
        updateWishStatus: neonUpdateWishStatus,
    } = useNeonWishes();
    const [authModalOpen, setAuthModalOpen] = useState(false);

    const isAuthenticated = !!user;

    const handleCreateWish = async (wish: CreateWishInput) => {
        try {
            await neonCreateWish(wish);
        } catch (err: any) {
            console.error('Error creating wish:', err);
        }
    };

    const handleDeleteWish = async (id: string) => {
        try {
            await neonDeleteWish(id);
        } catch (err: any) {
            console.error('Error deleting wish:', err);
        }
    };

    const handleStatusChange = async (
        id: string,
        status: 'pending' | 'fulfilled' | 'cancelled'
    ) => {
        try {
            await neonUpdateWishStatus(id, status);
        } catch (err: any) {
            console.error('Error updating wish status:', err);
        }
    };

    const handleOpenAuth = () => {
        setAuthModalOpen(true);
    };

    const handleCloseAuth = () => {
        setAuthModalOpen(false);
    };

    return (
        <div className="App">
            <DemoBanner />
            <header className="App-header">
                <div className="header-content">
                    <div className="header-left">
                        <h1>✨ WishMaker ✨</h1>
                        <p>Make your wishes come true</p>
                    </div>
                    <div className="header-right">
                        {isAuthenticated ? (
                            <UserMenu />
                        ) : (
                            <button
                                className="auth-button primary"
                                onClick={handleOpenAuth}
                            >
                                Sign In
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="App-main">
                {error && <div className="error-message">{error}</div>}

                {isAuthenticated ? (
                    <>
                        <ProtectedRoute requireAuth={true}>
                            <WishForm onSubmit={handleCreateWish} />
                            {loading ? (
                                <div className="loading">Loading wishes...</div>
                            ) : (
                                <WishList
                                    wishes={wishes}
                                    onDelete={handleDeleteWish}
                                    onStatusChange={handleStatusChange}
                                />
                            )}
                        </ProtectedRoute>
                    </>
                ) : (
                    <div className="welcome-section">
                        <div className="welcome-content">
                            <h2>Welcome to WishMaker</h2>
                            <p>
                                Create, track, and make your wishes come true!
                                Sign in to start managing your personal wish
                                list.
                            </p>
                            <div className="welcome-features">
                                <div className="feature">
                                    <div className="feature-icon">🌟</div>
                                    <h3>Create Wishes</h3>
                                    <p>
                                        Add your dreams and goals to track them
                                    </p>
                                </div>
                                <div className="feature">
                                    <div className="feature-icon">📋</div>
                                    <h3>Track Progress</h3>
                                    <p>Monitor the status of your wishes</p>
                                </div>
                                <div className="feature">
                                    <div className="feature-icon">🎉</div>
                                    <h3>Celebrate Success</h3>
                                    <p>
                                        Mark wishes as fulfilled when achieved
                                    </p>
                                </div>
                                <div className="feature">
                                    <div className="feature-icon">🔒</div>
                                    <h3>Secure & Private</h3>
                                    <p>
                                        Your wishes are protected with biometric
                                        auth
                                    </p>
                                </div>
                            </div>
                            <div className="welcome-actions">
                                <button
                                    className="welcome-button primary large"
                                    onClick={handleOpenAuth}
                                >
                                    Get Started
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <AuthModal isOpen={authModalOpen} onClose={handleCloseAuth} />

            <DeveloperToolbar />
        </div>
    );
}

const Fallback = () => <div className="loading">Loading application...</div>;

// Main App Component wrapped with AuthProvider
function App() {
    return (
        <Suspense fallback={<Fallback />}>
            <BrowserRouter>
                <StackProvider app={stackClientApp}>
                    <StackTheme>
                        <Routes>
                            <Route
                                path="/handler/*"
                                element={<HandleRoutes />}
                            />
                            <Route path="/*" element={<AppContent />} />
                        </Routes>
                    </StackTheme>
                </StackProvider>
            </BrowserRouter>
        </Suspense>
    );
}

export default App;
