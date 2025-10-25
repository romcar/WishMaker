import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

// TODO: CRITICAL - Improve database configuration and security
// 🎫 Linear Ticket: https://linear.app/romcar/issue/ROM-6/critical-fix-database-schema-security-issues
// 1. Add SSL configuration for production environments
// 2. Implement connection pooling optimization (min/max connections)
// 3. Add connection retry logic and failover support
// 4. Implement database health checks and monitoring
// 5. Add query timeout configuration
// 6. Implement connection encryption and certificate validation
// 7. Add database connection logging and metrics
// 8. Support for read replicas and load balancing
// 9. Add backup and disaster recovery configuration
// 10. Implement connection idle timeout and cleanup
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'wishmaker',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
});

export default pool;
