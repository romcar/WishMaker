// TODO: CRITICAL - Add missing middleware and security features
// 🎫 Linear Ticket: https://linear.app/romcar/issue/ROM-7/critical-implement-input-validation-and-sql-injection-protection
// 1. Add helmet for comprehensive security headers
// 2. Implement rate limiting with express-rate-limit
// 3. Add request logging middleware (morgan, winston)
// 4. Implement API versioning strategy
// 5. Add request validation middleware (joi, express-validator)
// 6. Add compression middleware for production
// 7. Add health check and metrics endpoints (/health, /metrics)
// 8. Implement graceful shutdown handling
// 9. Add API documentation with Swagger/OpenAPI
// 10. Add environment-specific configurations
import '@dotenvx/dotenvx/config';
import cors from 'cors';
import express, { Application } from 'express';
import { AuthController } from './controllers/auth.controller';
import authRoutes from './routes/auth.routes';
import wishRoutes from './routes/wish.routes';

// Initialize AuthController with JWT secret
AuthController.init();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// TODO: IMPROVEMENT - Enhanced middleware configuration
// 1. Configure CORS with specific origins and credentials
// 2. Add request size validation and file upload handling
// 3. Implement request parsing with better error handling
// 4. Add cookie parsing for session management
// 5. Configure trust proxy for load balancer support
// 6. Add response compression for better performance

// CORS Configuration
const corsOptions = {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: process.env.CORS_CREDENTIALS === 'true' || true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: process.env.REQUEST_SIZE_LIMIT || '10mb' })); // Configurable limit for WebAuthn responses
app.use(
    express.urlencoded({
        extended: true,
        limit: process.env.REQUEST_SIZE_LIMIT || '10mb',
    })
);

// TODO: CRITICAL - Enhance security headers and middleware
// 🎫 Linear Ticket: https://linear.app/romcar/issue/ROM-7/critical-implement-input-validation-and-sql-injection-protection
// 1. Add Content Security Policy (CSP) headers
// 2. Implement Strict Transport Security (HSTS)
// 3. Add Permissions-Policy headers
// 4. Implement request/response sanitization
// 5. Add CSRF protection middleware
// 6. Configure secure session management
// 7. Add IP filtering and geolocation restrictions
// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', wishRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'WishMaker API is running' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;
