import { createSlice } from '@reduxjs/toolkit';

function getCartKey() {
  const auth = JSON.parse(localStorage.getItem('auth') || 'null');
  return auth?.user?.id ? `cart_${auth.user.id}` : null;
}

function loadCart() {
  const key = getCartKey();
  if (!key) return [];
  return JSON.parse(localStorage.getItem(key) || '[]');
}

function saveCart(items) {
  const key = getCartKey();
  if (!key) return;
  localStorage.setItem(key, JSON.stringify(items));
}

function clearSavedCart() {
  const key = getCartKey();
  if (!key) return;
  localStorage.removeItem(key);
}

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: loadCart(),
    progress: 'none',
    lastAdded: null,
  },
  reducers: {
    addItem(state, action) {
      const existing = state.items.find(i => i.id === action.payload.id);
      if (existing) {
        existing.quantity++;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
      state.lastAdded = action.payload.name;
      saveCart(state.items);
    },
    removeItem(state, action) {
      state.items = state.items.filter(i => i.id !== action.payload);
      saveCart(state.items);
    },
    clearCart(state) {
      clearSavedCart();
      state.items = [];
      state.lastAdded = null;
    },
    loadUserCart(state) {
      state.items = loadCart();
    },
    showCart(state) {
      state.progress = 'cart';
    },
    hideCart(state) {
      state.progress = 'none';
    },
    showCheckout(state) {
      state.progress = 'checkout';
    },
    hideCheckout(state) {
      state.progress = 'none';
    },
  },
});

export const { addItem, removeItem, clearCart, loadUserCart, showCart, hideCart, showCheckout, hideCheckout } = cartSlice.actions;
export default cartSlice.reducer;