'use client'

import { NextIntlClientProvider } from 'next-intl'
import { ThemeProvider } from '@/components/ThemeProvider'
import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { Toaster } from '@/components/ui/sonner'

export function Providers({
  children,
  locale,
  messages,
}: {
  children: React.ReactNode
  locale: string
  messages: any
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
              <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Toaster />
    </NextIntlClientProvider>
  )
} 