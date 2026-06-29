import { createSlice } from '@reduxjs/toolkit';

// Cart is stored per user using their ID as the localStorage key
// This means each user's cart persists across page refreshes independently
function getCartKey() {
  const auth = JSON.parse(localStorage.getItem('auth') || 'null');
  return auth?.user?.id ? `cart_${auth.user.id}` : null;
}

// Load the current user's cart from localStorage
function loadCart() {
  const key = getCartKey();
  if (!key) return [];
  return JSON.parse(localStorage.getItem(key) || '[]');
}

// Save the current cart to localStorage under the user's key
function saveCart(items) {
  const key = getCartKey();
  if (!key) return;
  localStorage.setItem(key, JSON.stringify(items));
}

// Remove the current user's cart from localStorage (used on order completion)
function clearSavedCart() {
  const key = getCartKey();
  if (!key) return;
  localStorage.removeItem(key);
}

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: loadCart(),
    progress: 'none', // "none" | "cart" | "checkout"
    lastAdded: null,  // Name of the last added item, used to trigger toast notifications
  },
  reducers: {
    // Increment quantity if item exists, otherwise add it with quantity 1
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
    // Remove an item completely regardless of quantity
    removeItem(state, action) {
      state.items = state.items.filter(i => i.id !== action.payload);
      saveCart(state.items);
    },
    // Empty the cart and clear localStorage
    clearCart(state) {
      clearSavedCart();
      state.items = [];
      state.lastAdded = null;
    },
    // Load the logged-in user's saved cart from localStorage (called after login)
    loadUserCart(state) {
      state.items = loadCart();
    },
    showCart(state) { state.progress = 'cart'; },
    hideCart(state) { state.progress = 'none'; },
    showCheckout(state) { state.progress = 'checkout'; },
    hideCheckout(state) { state.progress = 'none'; },
  },
});

export const { addItem, removeItem, clearCart, loadUserCart, showCart, hideCart, showCheckout, hideCheckout } = cartSlice.actions;
export default cartSlice.reducer;