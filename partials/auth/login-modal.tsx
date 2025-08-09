import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { extractErrorMessage } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useGoogleLogin } from "@react-oauth/google";
import { GoogleLogin } from "@/services/googleAuthService";

type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSignupClick: () => void;
  onLogin: (email: string, password: string) => void;
  onGoogleLogin?: (authResponse?: any) => void;
  isLoading?: boolean;
};

export function LoginModal({ 
  isOpen, 
  onClose, 
  onSignupClick, 
  onLogin,
  onGoogleLogin,
  isLoading = false
}: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoadingInternal, setIsLoadingInternal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const t = useTranslations("Auth");

  const googleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        setIsLoadingInternal(true);
        setErrorMessage("");
        const authResponse = await GoogleLogin(response.access_token);
        // Call the parent's onGoogleLogin callback with the auth response
        if (onGoogleLogin) {
          onGoogleLogin(authResponse);
        }
      } catch (error: any) {
        console.error("Google login failed:", error);
        setErrorMessage(extractErrorMessage(error));
      } finally {
        setIsLoadingInternal(false);
      }
    },
    onError: (error) => {
      console.error("Google OAuth error:", error);
      setErrorMessage(t("google_login_failed"));
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(""); // Clear previous error
    
    if (!email.trim() || !password.trim()) {
      setErrorMessage(t("please_fill_all"));
      return;
    }
    
    setIsLoadingInternal(true);
    try {
      await onLogin(email, password);
    } catch (error: any) {
      console.error("Login failed:", error);
      setErrorMessage(extractErrorMessage(error));
    } finally {
      setIsLoadingInternal(false);
    }
  };

  const handleForgotPassword = () => {
    // TODO: Implement forgot password functionality
    alert(t("forgot_password_coming_soon"));
  };

  // Sử dụng isLoading từ prop hoặc internal state
  const isFormLoading = isLoading || isLoadingInternal;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("login")}
      closeOnBackdropClick={false}
      backdropType="blur"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
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
              onChange={(e) => {
                setEmail(e.target.value);
                if (errorMessage) setErrorMessage(""); // Clear error when user types
              }}
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
              placeholder={t("password_placeholder")}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMessage) setErrorMessage(""); // Clear error when user types
              }}
              className={`pl-10 pr-10`}
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
          {/* Error Message */}
          {errorMessage && (
            <div className="error-message">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errorMessage}
            </div>
          )}
        </div>

        {/* Forgot Password Link */}
        <div className="text-right">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            disabled={isFormLoading}
          >
            {t("forgot_password")}
          </button>
        </div>

        {/* Login Button */}
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isFormLoading}
        >
          {isFormLoading ? t("logging_in") : t("login_button")}
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

        {/* Continue with Google Button */}
        <Button
          type="button"
          variant="outline"
          onClick={() => googleLogin()}
          className="w-full"
          disabled={isFormLoading}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {isFormLoading ? t("logging_in") : t("continue_with_google")}
        </Button>

        {/* Signup Link */}
        <div className="text-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {t("no_account")}{" "}
          </span>
          <button
            type="button"
            onClick={onSignupClick}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            disabled={isFormLoading}
          >
            {t("signup_now")}
          </button>
        </div>
      </form>
    </Modal>
  );
}