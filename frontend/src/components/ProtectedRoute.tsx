import React from "react";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    requireAuth?: boolean;
    redirectTo?: string;
}

/**
 * ProtectedRoute component that conditionally renders children based on authentication status
 *
 * @param children - The component(s) to render when access is granted
 * @param fallback - Optional component to render when access is denied (defaults to login prompt)
 * @param requireAuth - Whether authentication is required to access this route (default: true)
 * @param redirectTo - Optional redirect path (for future router integration)
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    fallback,
    requireAuth = true,
    redirectTo,
}) => {
    const { isAuthenticated, isLoading } = useAuth();

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Checking authentication...</p>
                </div>
            </div>
        );
    }

    // If authentication is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
        if (fallback) {
            return <>{fallback}</>;
        }

        // Default fallback: authentication required message
        return (
            <div className="auth-required-container">
                <div className="auth-required-card">
                    <div className="auth-required-icon">🔒</div>
                    <h2>Authentication Required</h2>
                    <p>
                        You need to be logged in to access this feature. Please
                        sign in to continue.
                    </p>
                    <div className="auth-required-actions">
                        <button
                            className="auth-required-button primary"
                            onClick={() => {
                                // This would trigger the login modal/component
                                // For now, we'll just log the action
                                console.log("Redirect to login", redirectTo);
                            }}
                        >
                            Sign In
                        </button>
                        <button
                            className="auth-required-button secondary"
                            onClick={() => {
                                // This would trigger the registration modal/component
                                console.log("Redirect to register");
                            }}
                        >
                            Create Account
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // If authentication is NOT required but user IS authenticated, show children
    // If authentication IS required and user IS authenticated, show children
    // If authentication is NOT required and user is NOT authenticated, show children
    return <>{children}</>;
};

/**
 * Higher-order component version of ProtectedRoute for wrapping components
 */
export const withAuth = <P extends object>(
    Component: React.ComponentType<P>,
    options?: Omit<ProtectedRouteProps, "children">
) => {
    const WrappedComponent: React.FC<P> = (props) => {
        return (
            <ProtectedRoute {...options}>
                <Component {...props} />
            </ProtectedRoute>
        );
    };

    WrappedComponent.displayName = `withAuth(${
        Component.displayName || Component.name
    })`;

    return WrappedComponent;
};

/**
 * Hook to check if user has specific permissions
 * This can be extended to support role-based access control (RBAC)
 */
export const usePermissions = () => {
    const { user, isAuthenticated } = useAuth();

    const hasPermission = (_permission: string): boolean => {
        if (!isAuthenticated || !user) {
            return false;
        }

        // For now, all authenticated users have all permissions
        // This can be extended to check user roles/permissions
        return true;
    };

    const hasRole = (_role: string): boolean => {
        if (!isAuthenticated || !user) {
            return false;
        }

        // For now, we don't have role-based access
        // This can be extended when user roles are implemented
        return user.id !== null; // Basic check that user exists
    };

    const canAccess = (resource: string, _action?: string): boolean => {
        if (!isAuthenticated || !user) {
            return false;
        }

        // Basic access control logic
        // This can be extended to support more granular permissions
        switch (resource) {
            case "wishes":
                return true; // All authenticated users can access wishes
            case "profile":
                return true; // All authenticated users can access their profile
            case "admin":
                return false; // Admin access not implemented yet
            default:
                return true; // Default to allow access for authenticated users
        }
    };

    return {
        hasPermission,
        hasRole,
        canAccess,
        isAuthenticated,
        user,
    };
};

/**
 * Component that conditionally renders content based on permissions
 */
export const PermissionGate: React.FC<{
    permission?: string;
    role?: string;
    resource?: string;
    action?: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}> = ({ permission, role, resource, action, children, fallback }) => {
    const { hasPermission, hasRole, canAccess } = usePermissions();

    let hasAccess = true;

    if (permission) {
        hasAccess = hasAccess && hasPermission(permission);
    }

    if (role) {
        hasAccess = hasAccess && hasRole(role);
    }

    if (resource) {
        hasAccess = hasAccess && canAccess(resource, action);
    }

    if (!hasAccess) {
        if (fallback) {
            return <>{fallback}</>;
        }

        return (
            <div className="permission-denied">
                <p>You don't have permission to access this feature.</p>
            </div>
        );
    }

    return <>{children}</>;
};

export default ProtectedRoute;
