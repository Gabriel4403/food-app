import { createSlice } from '@reduxjs/toolkit';

// Restore auth state from localStorage so the user stays logged in on page refresh
const stored = JSON.parse(localStorage.getItem('auth') || 'null');

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: stored?.token || null,
    user: stored?.user || null,
  },
  reducers: {
    // Store token and user in both Redux state and localStorage for persistence
    login(state, action) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem('auth', JSON.stringify(action.payload));
    },
    // Clear token and user from both Redux state and localStorage
    logout(state) {
      state.token = null;
      state.user = null;
      localStorage.removeItem('auth');
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;