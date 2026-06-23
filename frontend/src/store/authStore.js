import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        if (token) localStorage.setItem('token', token);
        if (user) localStorage.setItem('user', JSON.stringify(user));
        set({ user, token });
      },
      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null });
      },
      hasRole: (role) => {
        const state = useAuthStore.getState();
        return state.user?.roles?.includes(role) ?? false;
      },
      isAdmin: () => useAuthStore.getState().hasRole('ADMIN'),
      isVendor: () => useAuthStore.getState().hasRole('VENDOR'),
      isCustomer: () => useAuthStore.getState().hasRole('CUSTOMER'),
    }),
    { name: 'buyora-auth' }
  )
);
