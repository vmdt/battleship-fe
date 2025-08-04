import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";

type SignupModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
  onSignup: (username: string, email: string, password: string) => void;
  onGoogleSignup?: () => void;
  isLoading?: boolean;
};

export function SignupModal({ 
  isOpen, 
  onClose, 
  onLoginClick, 
  onSignup,
  onGoogleSignup,
  isLoading = false
}: SignupModalProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoadingInternal, setIsLoadingInternal] = useState(false);
  const t = useTranslations("Auth");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password.trim()) {
      alert(t("please_fill_all"));
      return;
    }
    
    if (password.length < 6) {
      alert(t("password_min_length"));
      return;
    }
    
    setIsLoadingInternal(true);
    try {
      await onSignup(username, email, password);
    } catch (error) {
      console.error("Signup failed:", error);
    } finally {
      setIsLoadingInternal(false);
    }
  };

  // Sử dụng isLoading từ prop hoặc internal state
  const isFormLoading = isLoading || isLoadingInternal;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("signup")}
      closeOnBackdropClick={false}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Username Input */}
        <div className="space-y-2">
          <Label htmlFor="username">{t("username_required")}</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="username"
              type="text"
              placeholder={t("username_placeholder")}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="pl-10"
              required
              disabled={isFormLoading}
            />
          </div>
        </div>

        {/* Email Input */}
        <div className="space-y-2">
          <Label htmlFor="email">{t("email_required")}</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="email"
              type="email"
              placeholder={t("email_placeholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
              disabled={isFormLoading}
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="space-y-2">
          <Label htmlFor="password">{t("password_required")}</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder={t("password_min_placeholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10"
              required
              disabled={isFormLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              disabled={isFormLoading}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Signup Button */}
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isFormLoading}
        >
          {isFormLoading ? t("signing_up") : t("signup_button")}
        </Button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-gray-800 px-2 text-gray-500">{t("or")}</span>
          </div>
        </div>

        {/* Google Signup Button */}
        {onGoogleSignup && (
          <Button
            type="button"
            variant="outline"
            onClick={onGoogleSignup}
            className="w-full"
            disabled={isFormLoading}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {t("continue_with_google")}
          </Button>
        )}

        {/* Continue with Google Button */}
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            // TODO: Implement Google OAuth
            alert(t("google_signup_coming_soon"));
          }}
          className="w-full"
          disabled={isFormLoading}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {t("continue_with_google")}
        </Button>

        {/* Login Link */}
        <div className="text-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {t("have_account")}{" "}
          </span>
          <button
            type="button"
            onClick={onLoginClick}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            disabled={isFormLoading}
          >
            {t("login_now")}
          </button>
        </div>
      </form>
    </Modal>
  );
}