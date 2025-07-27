import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface UserStore {
  user: User | null;
  isLogin: boolean;
  token: string | null;
  
  // Actions
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setToken: (token: string) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLogin: false,
      token: null,

      login: (user: User, token: string) => {
        set({
          user,
          isLogin: true,
          token,
        });
      },

      logout: () => {
        set({
          user: null,
          isLogin: false,
          token: null,
        });
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          });
        }
      },

      setToken: (token: string) => {
        set({ token });
      },
    }),
    {
      name: "user-store",
    }
  )
);