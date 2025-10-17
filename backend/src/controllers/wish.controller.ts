import { Request, Response } from 'express';
import pool from '../db/pool';
import { CreateWishInput, UpdateWishInput } from '../models/wish.model';

// TODO: CRITICAL SECURITY ISSUE - No user authentication/authorization!
// 🎫 Linear Ticket: https://linear.app/romcar/issue/ROM-5/critical-fix-authentication-security-vulnerabilities
// Current implementation returns ALL wishes from ALL users - major privacy breach
// REQUIRED FIXES:
// 1. Add authentication middleware to verify JWT token
// 2. Extract user_id from token and filter wishes: WHERE user_id = $1
// 3. Add pagination: LIMIT $2 OFFSET $3
// 4. Add request rate limiting to prevent abuse
// 5. Add input validation and sanitization
export const getAllWishes = async (req: Request, res: Response): Promise<void> => {
  try {
    // TODO: MISSING - Add user_id filter: WHERE user_id = req.user.id
    const result = await pool.query('SELECT * FROM wishes ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching wishes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getWishById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM wishes WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Wish not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching wish:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createWish = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description }: CreateWishInput = req.body;

    // TODO: ENHANCEMENT - Expand input validation
    // 1. Check title length (min 1, max 255 characters)
    // 2. Sanitize HTML/XSS in title and description
    // 3. Check description length limit (e.g., max 2000 chars)
    // 4. Validate against profanity/inappropriate content
    // 5. Check user's wish creation rate limits
    if (!title || title.trim() === '') {
      res.status(400).json({ error: 'Title is required' });
      return;
    }

    // TODO: CRITICAL - Missing user_id in INSERT
    // Should be: INSERT INTO wishes (user_id, title, description) VALUES ($1, $2, $3)
    // user_id should come from authenticated user: req.user.id
    const result = await pool.query(
      'INSERT INTO wishes (title, description) VALUES ($1, $2) RETURNING *',
      [title, description || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating wish:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateWish = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, status }: UpdateWishInput = req.body;

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(title);
    }

    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }

    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }

    if (updates.length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `UPDATE wishes SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Wish not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating wish:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteWish = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM wishes WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Wish not found' });
      return;
    }

    res.json({ message: 'Wish deleted successfully' });
  } catch (error) {
    console.error('Error deleting wish:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
