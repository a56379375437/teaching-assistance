import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: number
  username: string
  name: string
  role: 'STUDENT' | 'TEACHER' | 'ADMIN'
  score: number
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  logout: () => void
  refreshScore: () => Promise<void>
  // 检查当前用户是否有权访问某角色
  hasRole: (roles: string[]) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      setUser: user => set({ user, isAuthenticated: !!user }),
      logout: () => {
        set({ user: null, isAuthenticated: false })
        localStorage.removeItem('auth-storage')
      },
      refreshScore: async () => {
        const currentUser = get().user;
        if (!currentUser) return;

        try {
          const res = await fetch(`/api/users/${currentUser.id}`);
          const result = await res.json();
          if (result.success) {
            set({ user: result.data }); // 更新整个 user 对象，包含最新积分
          }
        } catch (e) {
          console.error("刷新积分失败", e);
        }
      },
      hasRole: roles => {
        const user = get().user
        if (!user) return false
        return roles.includes(user.role)
      },
    }),
    {
      name: 'auth-storage',
      // 只持久化 user 数据
      partialize: state => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
