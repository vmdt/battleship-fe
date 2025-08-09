'use client'

import { NextIntlClientProvider } from 'next-intl'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Toaster } from '@/components/ui/sonner'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { getGoogleClientId } from '@/services/googleAuthService'

export function Providers({
  children,
  locale,
  messages,
}: {
  children: React.ReactNode
  locale: string
  messages: any
}) {

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <GoogleOAuthProvider clientId={getGoogleClientId()}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Toaster />
      </GoogleOAuthProvider>
    </NextIntlClientProvider>
  )
} 