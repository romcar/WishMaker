import React, { useState } from 'react';
import { CreateWishInput } from '../types/wish.types';

interface WishFormProps {
  onSubmit: (wish: CreateWishInput) => void;
}

// TODO: ENHANCEMENT - Add missing form fields and features
// 🎫 Linear Ticket: https://linear.app/romcar/issue/ROM-9/enhanced-wish-management-features
// 1. Priority selector (low, medium, high, urgent)
// 2. Category/tag selector with autocomplete
// 3. Target date picker for deadlines
// 4. Cost estimation field with currency selector
// 5. Privacy settings (private, friends, public)
// 6. File attachment support (drag & drop)
// 7. Location field with geocoding
// 8. Progress tracking setup (milestones)
// 9. Collaboration settings (who can edit/view)
// 10. Template selection for common wish types
const WishForm: React.FC<WishFormProps> = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // TODO: IMPROVEMENT - Enhanced form validation and submission
  // 1. Add client-side validation with error states
  // 2. Character limits with live counters (title: 100, desc: 500)
  // 3. Prevent duplicate submissions with loading states
  // 4. Auto-save draft functionality
  // 5. Form validation schema (e.g., Yup, Joi)
  // 6. Success/error toast notifications
  // 7. Debounced validation for real-time feedback
  // 8. Accessibility improvements (ARIA labels, screen reader support)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSubmit({ title, description });
      setTitle('');
      setDescription('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="wish-form">
      <h2>Make a Wish</h2>
      <div className="form-group">
        <label htmlFor="title">Wish Title *</label>
        {/* TODO: ENHANCEMENT - Improve input components */}
        {/* 1. Add character counters and validation states */}
        {/* 2. Rich text editor for description (e.g., TinyMCE, Draft.js) */}
        {/* 3. Auto-resize textarea based on content */}
        {/* 4. Input sanitization and XSS protection */}
        {/* 5. Keyboard shortcuts (Ctrl+Enter to submit) */}
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
      {/* TODO: ENHANCEMENT - Improve button and form actions */}
      {/* 1. Add loading state with spinner during submission */}
      {/* 2. Disable button when form is invalid or submitting */}
      {/* 3. Add "Save as Draft" secondary button */}
      {/* 4. Cancel/Reset button to clear form */}
      {/* 5. Keyboard accessibility (Enter/Escape handling) */}
      <button type="submit" className="submit-button">
        ✨ Make This Wish
      </button>
    </form>
  );
};

export default WishForm;
