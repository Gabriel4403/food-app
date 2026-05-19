import { createSlice } from '@reduxjs/toolkit';

const stored = JSON.parse(localStorage.getItem('auth') || 'null');

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: stored?.token || null,
    user: stored?.user || null,
  },
  reducers: {
    login(state, action) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem('auth', JSON.stringify(action.payload));
    },
    logout(state) {
      state.token = null;
      state.user = null;
      localStorage.removeItem('auth');
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;