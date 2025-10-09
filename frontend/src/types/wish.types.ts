export interface Wish {
  id: number;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
  status: 'pending' | 'fulfilled' | 'cancelled';
}

export interface CreateWishInput {
  title: string;
  description?: string;
}

export interface UpdateWishInput {
  title?: string;
  description?: string;
  status?: 'pending' | 'fulfilled' | 'cancelled';
}
