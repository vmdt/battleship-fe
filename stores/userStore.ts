import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, Tokens } from "@/models/user";

interface UserStore {
  user: User | null;
  isLogin: boolean;
  tokens: Tokens | null;
  
  // Actions
  login: (user: User, tokens: Tokens) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setTokens: (tokens: Tokens) => void;
  updateTokens: (tokens: Partial<Tokens>) => void;
  
  // Getters
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLogin: false,
      tokens: null,

      login: (user: User, tokens: Tokens) => {
        set({
          user,
          isLogin: true,
          tokens,
        });
      },

      logout: () => {
        set({
          user: null,
          isLogin: false,
          tokens: null,
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

      setTokens: (tokens: Tokens) => {
        set({ tokens });
      },

      updateTokens: (tokensData: Partial<Tokens>) => {
        const currentTokens = get().tokens;
        if (currentTokens) {
          set({
            tokens: { ...currentTokens, ...tokensData },
          });
        }
      },

      getAccessToken: () => {
        return get().tokens?.access_token || null;
      },

      getRefreshToken: () => {
        return get().tokens?.refresh_token || null;
      },
    }),
    {
      name: "user-store",
    }
  )
);