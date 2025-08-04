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
  LogOut,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTranslations } from 'next-intl'

import LocaleSwitcher from '@/components/LocaleSwitcher'
import { ModeToggle } from '@/components/ThemeToggle'
import { useSettingStore } from '@/stores/settingStore'
import { useUserStore } from '@/stores/userStore'
import { LoginModal } from '@/partials/auth/login-modal'
import { SignupModal } from '@/partials/auth/signup-modal'
import { Login, Register } from '@/services/userService'
import { extractErrorMessage } from '@/lib/utils'

const menuItems = [
  { icon: Home, labelKey: 'home' },
  { icon: MessageCircle, labelKey: 'messages' },
  { icon: Users, labelKey: 'friends' },
  { icon: History, labelKey: 'history' },
  { icon: ShoppingCart, labelKey: 'store' },
  { icon: Gift, labelKey: 'items' },
]

const gruppoItems = [
  { icon: PlusCircle, labelKey: 'create_tournament' },
  { icon: Trophy, labelKey: 'my_tournaments' },
  { icon: DollarSign, labelKey: 'pricing' },
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
  const router = useRouter()
  const t = useTranslations('Sidebar')

  const isEffectivelyCollapsed = !isMobile && isMenuCollapsed;

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await Login({ email, password });
      login(response.user, response.tokens);
      setIsLoginModalOpen(false);
    } catch (error: any) {
      console.error('Login error:', error);
      // Error will be handled by LoginModal component
      throw error; // Re-throw to let LoginModal handle it
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleSignup = async (username: string, email: string, password: string) => {
    try {
      const response = await Register({ 
        username, 
        email, 
        password,
        nation: 'VN' // Default nation
      });
      login(response.user, response.tokens);
      setIsSignupModalOpen(false);
    } catch (error: any) {
      console.error('Signup error:', error);
      // Error will be handled by SignupModal component
      throw error; // Re-throw to let SignupModal handle it
    }
  };

  const handleSignupClick = () => {
    setIsLoginModalOpen(false);
    setIsSignupModalOpen(true);
  };

  const handleLoginClick = () => {
    setIsSignupModalOpen(false);
    setIsLoginModalOpen(true);
  };

  const handleMenuClick = (labelKey: string) => {
    if (labelKey === 'home') {
      router.push('/');
    } else {
      toast.info(t('feature_coming_soon', { feature: t(labelKey) }));
    }
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
              <span className="text-lg font-semibold">{t('menu')}</span>
              <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-6 w-6" />
              </Button>
          </div>

          {/* Avatar + User Info */}
          <div className="flex items-center gap-3 px-2 py-3">
            {isLogin ? (
              <>
                {isEffectivelyCollapsed ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-10 h-10 rounded-full p-0 hover:bg-muted"
                      >
                        <img
                          src={user?.avatar || "https://api.dicebear.com/9.x/adventurer/svg?seed=User"}
                          alt={user?.username || "User"}
                          className="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-gray-600"
                        />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      <DropdownMenuItem className="flex items-center gap-2" onClick={handleLogout}>
                        <LogOut size={16} />
                        <span>{t('logout')}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <>
                    <img
                      src={user?.avatar || "https://api.dicebear.com/9.x/adventurer/svg?seed=User"}
                      alt={user?.username || "User"}
                      className="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-gray-600"
                    />
                    <div className="leading-tight">
                      <p className="text-sm font-medium">{user?.username || "User"}</p>
                      <p className="text-xs text-muted-foreground">{t('coins')}</p>
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                {isEffectivelyCollapsed ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsLoginModalOpen(true)}
                    className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80"
                  >
                    <span className="text-xs text-muted-foreground">?</span>
                  </Button>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">?</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsLoginModalOpen(true)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {t('login')}
                    </Button>
                  </>
                )}
              </>
            )}
          </div>

          {/* Menu Items */}
          <div className="mt-2 space-y-1">
            {menuItems.map(({ icon: Icon, labelKey }) => (
              <Button
                key={labelKey}
                variant="ghost"
                onClick={() => handleMenuClick(labelKey)}
                className={cn(
                  'w-full flex items-center gap-3 justify-start',
                  'px-3 py-2 rounded transition-colors hover:bg-muted'
                )}
              >
                <Icon size={20} />
                {!isEffectivelyCollapsed && <span>{t(labelKey)}</span>}
              </Button>
            ))}
          </div>

          {/* Gruppo Section */}
          <div className="mt-6">
            {!isEffectivelyCollapsed && (
              <div className="px-3 mb-2 text-xs font-semibold text-muted-foreground">{t('gruppo')}</div>
            )}
            <div className="space-y-1">
              {gruppoItems.map(({ icon: Icon, labelKey }) => (
                <Button
                  key={labelKey}
                  variant="ghost"
                  onClick={() => toast.info(t('feature_coming_soon', { feature: t(labelKey) }))}
                  className={cn(
                    'w-full flex items-center gap-3 justify-start',
                    'px-3 py-2 rounded transition-colors hover:bg-muted'
                  )}
                >
                  <Icon size={20} />
                  {!isEffectivelyCollapsed && <span>{t(labelKey)}</span>}
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
                <span>{t('logout')}</span>
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
