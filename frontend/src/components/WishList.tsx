import React from 'react';
import { Wish } from '../types/wish.types';

// TODO: ENHANCEMENT - Expand WishList component features
// 🎫 Linear Ticket: https://linear.app/romcar/issue/ROM-9/enhanced-wish-management-features
// 1. Add search/filter functionality (by status, date, priority)
// 2. Sorting options (date, priority, alphabetical, completion)
// 3. Pagination or infinite scroll for large lists
// 4. Bulk operations (select multiple wishes, batch delete/update)
// 5. Virtualization for performance with large datasets
// 6. Export functionality (PDF, CSV, JSON)
// 7. Drag & drop reordering with priority updates
// 8. Advanced filtering (date ranges, custom tags)
interface WishListProps {
  wishes: Wish[];
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: 'pending' | 'fulfilled' | 'cancelled') => void;
}

const WishList: React.FC<WishListProps> = ({ wishes, onDelete, onStatusChange }) => {
  // TODO: IMPROVEMENT - Enhanced date and time handling
  // 1. Add relative time display (e.g., "2 days ago", "in 3 weeks")
  // 2. Timezone awareness and user locale preferences
  // 3. Multiple date format options (user preference)
  // 4. Countdown timers for wishes with deadlines
  // 5. Calendar integration for deadline management
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // TODO: CRITICAL - Fix inline styles accessibility issue
  // 1. Move all inline styles to external CSS classes
  // 2. Implement CSS custom properties for theming
  // 3. Add dark/light mode support with CSS variables
  // 4. Use semantic color names instead of hex values
  // 5. Ensure color contrast meets WCAG 2.1 AA standards
  // 6. Add color-blind friendly alternatives (icons, patterns)
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fulfilled':
        return '#4caf50';
      case 'cancelled':
        return '#f44336';
      default:
        return '#ff9800';
    }
  };

  return (
    <div className="wish-list">
      {/* TODO: ENHANCEMENT - Improve empty state and list structure */}
      {/* 1. Add animated empty state with call-to-action */}
      {/* 2. Loading skeleton components for better UX */}
      {/* 3. Error boundary for individual wish cards */}
      {/* 4. Lazy loading for images/attachments */}
      {/* 5. Virtual scrolling for performance */}
      {wishes.length === 0 ? (
        <p className="empty-message">No wishes yet. Make your first wish!</p>
      ) : (
        wishes.map((wish) => (
          <div key={wish.id} className="wish-card">
            <div className="wish-header">
              <h3>{wish.title}</h3>
              <span
                className="wish-status"
                style={{ backgroundColor: getStatusColor(wish.status) }}
              >
                {wish.status}
              </span>
            </div>
            {wish.description && <p className="wish-description">{wish.description}</p>}
            <div className="wish-footer">
              <span className="wish-date">Created: {formatDate(wish.created_at)}</span>
              <div className="wish-actions">
                {/* TODO: CRITICAL - Fix accessibility issues */}
                {/* 1. Add aria-label to select for screen readers */}
                {/* 2. Add confirmation dialog for delete action */}
                {/* 3. Keyboard navigation support */}
                {/* 4. Focus management after actions */}
                {/* 5. Add icons to status options for visual clarity */}
                <select
                  value={wish.status}
                  onChange={(e) =>
                    onStatusChange(wish.id, e.target.value as 'pending' | 'fulfilled' | 'cancelled')
                  }
                  className="status-select"
                  aria-label={`Change status for wish: ${wish.title}`}
                  title="Change wish status"
                >
                  <option value="pending">Pending</option>
                  <option value="fulfilled">Fulfilled</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                {/* TODO: ENHANCEMENT - Improve action buttons */}
                {/* 1. Add edit functionality with inline editing */}
                {/* 2. Share/export individual wishes */}
                {/* 3. Duplicate wish feature */}
                {/* 4. Archive instead of permanent delete */}
                {/* 5. Undo functionality for accidental actions */}
                <button onClick={() => onDelete(wish.id)} className="delete-button">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default WishList;
