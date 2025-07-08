import { create } from 'zustand'

type UserState = {
    isAuthenticated: boolean
    userId: string | null
    username: string | null
}

export const useUserStore = create<UserState>()(
    (set) => ({
        isAuthenticated: false,
        userId: null,
        username: null,
    
        setAuthentication: (isAuthenticated: boolean, userId: string | null, username: string | null) =>
        set({ isAuthenticated, userId, username }),

    })
)