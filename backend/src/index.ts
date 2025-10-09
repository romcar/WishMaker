import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import wishRoutes from './routes/wish.routes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
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
