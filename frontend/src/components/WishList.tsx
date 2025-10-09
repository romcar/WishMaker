import React from 'react';
import { Wish } from '../types/wish.types';

interface WishListProps {
  wishes: Wish[];
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: 'pending' | 'fulfilled' | 'cancelled') => void;
}

const WishList: React.FC<WishListProps> = ({ wishes, onDelete, onStatusChange }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

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
                <select
                  value={wish.status}
                  onChange={(e) =>
                    onStatusChange(wish.id, e.target.value as 'pending' | 'fulfilled' | 'cancelled')
                  }
                  className="status-select"
                >
                  <option value="pending">Pending</option>
                  <option value="fulfilled">Fulfilled</option>
                  <option value="cancelled">Cancelled</option>
                </select>
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
