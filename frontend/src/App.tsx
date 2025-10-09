import React, { useState, useEffect } from 'react';
import './App.css';
import WishForm from './components/WishForm';
import WishList from './components/WishList';
import { wishAPI } from './services/api';
import { Wish, CreateWishInput } from './types/wish.types';

function App() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWishes();
  }, []);

  const fetchWishes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await wishAPI.getAllWishes();
      setWishes(data);
    } catch (err) {
      setError('Failed to fetch wishes. Make sure the backend server is running.');
      console.error('Error fetching wishes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWish = async (wish: CreateWishInput) => {
    try {
      const newWish = await wishAPI.createWish(wish);
      setWishes([newWish, ...wishes]);
    } catch (err) {
      setError('Failed to create wish');
      console.error('Error creating wish:', err);
    }
  };

  const handleDeleteWish = async (id: number) => {
    try {
      await wishAPI.deleteWish(id);
      setWishes(wishes.filter((wish) => wish.id !== id));
    } catch (err) {
      setError('Failed to delete wish');
      console.error('Error deleting wish:', err);
    }
  };

  const handleStatusChange = async (id: number, status: 'pending' | 'fulfilled' | 'cancelled') => {
    try {
      const updatedWish = await wishAPI.updateWish(id, { status });
      setWishes(wishes.map((wish) => (wish.id === id ? updatedWish : wish)));
    } catch (err) {
      setError('Failed to update wish status');
      console.error('Error updating wish:', err);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>✨ WishMaker ✨</h1>
        <p>Make your wishes come true</p>
      </header>
      <main className="App-main">
        {error && <div className="error-message">{error}</div>}
        <WishForm onSubmit={handleCreateWish} />
        {loading ? (
          <div className="loading">Loading wishes...</div>
        ) : (
          <WishList wishes={wishes} onDelete={handleDeleteWish} onStatusChange={handleStatusChange} />
        )}
      </main>
    </div>
  );
}

export default App;
