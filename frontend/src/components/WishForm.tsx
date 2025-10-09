import React, { useState } from 'react';
import { CreateWishInput } from '../types/wish.types';

interface WishFormProps {
  onSubmit: (wish: CreateWishInput) => void;
}

const WishForm: React.FC<WishFormProps> = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
      });
      setTitle('');
      setDescription('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="wish-form">
      <h2>Make a Wish</h2>
      <div className="form-group">
        <label htmlFor="title">Wish Title *</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter your wish..."
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="description">Description (optional)</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add more details about your wish..."
          rows={4}
        />
      </div>
      <button type="submit" className="submit-button">
        ✨ Make This Wish
      </button>
    </form>
  );
};

export default WishForm;
