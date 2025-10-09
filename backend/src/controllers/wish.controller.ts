import { Request, Response } from 'express';
import pool from '../db/pool';
import { CreateWishInput, UpdateWishInput, Wish } from '../models/wish.model';

export const getAllWishes = async (req: Request, res: Response): Promise<void> => {
  try {
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
    
    if (!title || title.trim() === '') {
      res.status(400).json({ error: 'Title is required' });
      return;
    }
    
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
