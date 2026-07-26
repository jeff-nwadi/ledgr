import { create } from 'zustand';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  cost: number;
  quantity: number;
  maxStock: number;
}

interface CartState {
  items: CartItem[];
  mode: 'sale' | 'waste';
  setMode: (mode: 'sale' | 'waste') => void;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  mode: 'sale',
  setMode: (mode) => set({ mode }),
  
  addItem: (product) => set((state) => {
    const existing = state.items.find(i => i.productId === product.productId);
    if (existing) {
      return {
        items: state.items.map(i => 
          i.productId === product.productId 
            ? { ...i, quantity: Math.min(i.quantity + 1, i.maxStock) } // Optionally restrict by max stock, though some businesses sell negative stock. Let's restrict for safety.
            : i
        )
      };
    }
    return { items: [...state.items, { ...product, quantity: 1 }] };
  }),

  removeItem: (productId) => set((state) => ({
    items: state.items.filter(i => i.productId !== productId)
  })),

  updateQuantity: (productId, quantity) => set((state) => {
    if (quantity <= 0) {
      return { items: state.items.filter(i => i.productId !== productId) };
    }
    return {
      items: state.items.map(i => 
        i.productId === productId ? { ...i, quantity } : i
      )
    };
  }),

  clearCart: () => set({ items: [] }),

  getTotal: () => {
    const { items } = get();
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }
}));
