'use client'

import {
  Home,
  MessageCircle,
  Users,
  History,
  ShoppingCart,
  Gift,
  Trophy,
  DollarSign,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'

import LocaleSwitcher from '@/components/LocaleSwitcher'
import { ModeToggle } from '@/components/ThemeToggle'
import { useSettingStore } from '@/stores/settingStore'
import { useUserStore } from '@/stores/userStore'
import { LoginModal } from '@/partials/auth/login-modal'
import { SignupModal } from '@/partials/auth/signup-modal'

const menuItems = [
  { icon: MessageCircle, label: 'Nhắn tin' },
  { icon: Users, label: 'Bạn bè' },
  { icon: History, label: 'Lịch sử' },
  { icon: Home, label: 'Trang chủ' },
  { icon: ShoppingCart, label: 'Cửa hàng' },
  { icon: Gift, label: 'Vật phẩm' },
]

const gruppoItems = [
  { icon: PlusCircle, label: 'Tạo giải đấu' },
  { icon: Trophy, label: 'Giải đấu của tôi' },
  { icon: DollarSign, label: 'Giá cả' },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { isMenuCollapsed, setMenuCollapsed } = useSettingStore()
  const { user, isLogin, login, logout } = useUserStore()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const isMobile = useMediaQuery('(max-width: 767px)')

  const isEffectivelyCollapsed = !isMobile && isMenuCollapsed;

  const handleLogin = async (email: string, password: string) => {
    // TODO: Implement actual login API call
    console.log('Login attempt:', email, password);
    
    // Mock login for now
    const mockUser = {
      id: '1',
      name: 'Dat',
      email: email,
      avatar: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Dat'
    };
    const mockToken = 'mock-token-123';
    
    login(mockUser, mockToken);
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    logout();
  };

  const handleSignup = async (username: string, email: string, password: string) => {
    // TODO: Implement actual signup API call
    console.log('Signup attempt:', username, email, password);
    
    // Mock signup for now
    const mockUser = {
      id: '2',
      name: username,
      email: email,
      avatar: 'https://api.dicebear.com/9.x/adventurer/svg?seed=' + username
    };
    const mockToken = 'mock-token-456';
    
    login(mockUser, mockToken);
    setIsSignupModalOpen(false);
  };

  const handleSignupClick = () => {
    setIsLoginModalOpen(false);
    setIsSignupModalOpen(true);
  };

  const handleLoginClick = () => {
    setIsSignupModalOpen(false);
    setIsLoginModalOpen(true);
  };

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      <div
        className={cn(
          'h-screen flex-col justify-between border-r-2 bg-gray-200 dark:bg-gray-800 text-foreground',
          'fixed md:sticky left-0 md:left-auto top-0 z-50 flex w-[240px] transition-transform duration-300 ease-in-out md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          isEffectivelyCollapsed ? 'md:w-[64px]' : 'md:w-[240px]'
        )}
      >
        <div className="flex-1 overflow-y-auto p-2">
          {/* Header for mobile with close button */}
          <div className="mb-4 flex items-center justify-between md:hidden">
              <span className="text-lg font-semibold">Menu</span>
              <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-6 w-6" />
              </Button>
          </div>

          {/* Avatar + User Info */}
          <div className="flex items-center gap-3 px-2 py-3">
            {isLogin ? (
              <>
                <img
                  src={user?.avatar || "https://api.dicebear.com/9.x/adventurer/svg?seed=User"}
                  alt={user?.name || "User"}
                  className="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-gray-600"
                />
                {!isEffectivelyCollapsed && (
                  <div className="leading-tight">
                    <p className="text-sm font-medium">{user?.name || "User"}</p>
                    <p className="text-xs text-muted-foreground">2000 🪙</p>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">?</span>
                </div>
                {!isEffectivelyCollapsed && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsLoginModalOpen(true)}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Đăng nhập
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Menu Items */}
          <div className="mt-2 space-y-1">
            {menuItems.map(({ icon: Icon, label }) => (
              <Button
                key={label}
                variant="ghost"
                className={cn(
                  'w-full flex items-center gap-3 justify-start',
                  'px-3 py-2 rounded transition-colors hover:bg-muted'
                )}
              >
                <Icon size={20} />
                {!isEffectivelyCollapsed && <span>{label}</span>}
              </Button>
            ))}
          </div>

          {/* Gruppo Section */}
          <div className="mt-6">
            {!isEffectivelyCollapsed && (
              <div className="px-3 mb-2 text-xs font-semibold text-muted-foreground">Gruppo</div>
            )}
            <div className="space-y-1">
              {gruppoItems.map(({ icon: Icon, label }) => (
                <Button
                  key={label}
                  variant="ghost"
                  className={cn(
                    'w-full flex items-center gap-3 justify-start',
                    'px-3 py-2 rounded transition-colors hover:bg-muted'
                  )}
                >
                  <Icon size={20} />
                  {!isEffectivelyCollapsed && <span>{label}</span>}
                </Button>
              ))}
            </div>
          </div>

          {/* Logout Button (when logged in) */}
          {isLogin && !isEffectivelyCollapsed && (
            <div className="mt-6">
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 justify-start px-3 py-2 rounded transition-colors hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
              >
                <X size={20} />
                <span>Đăng xuất</span>
              </Button>
            </div>
          )}
        </div>

        {/* Bottom section: Locale & Theme toggle + Collapse */}
        <div className="p-2 space-y-2 border-t">
          <div className={cn("flex items-center gap-3", isEffectivelyCollapsed ? 'flex-col' : 'flex-row')}>
              <LocaleSwitcher collapsed={isEffectivelyCollapsed} />
              <ModeToggle collapsed={isEffectivelyCollapsed} />
          </div>
          <div className={cn('hidden md:flex', isEffectivelyCollapsed ? 'justify-center' : 'justify-end')}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMenuCollapsed(!isMenuCollapsed)}
              className="rounded-full transition bg-muted hover:bg-muted-foreground/20"
            >
              {isEffectivelyCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
        onSignupClick={handleSignupClick}
      />

      {/* Signup Modal */}
      <SignupModal
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
        onLoginClick={handleLoginClick}
        onSignup={handleSignup}
      />
    </>
  )
}
