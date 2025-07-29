"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      richColors
      closeButton
      duration={4000}
      toastOptions={{
        style: {
          background: 'var(--toast-bg, var(--popover))',
          color: 'var(--toast-text, var(--popover-foreground))',
          border: '1px solid var(--toast-border, var(--border))',
          zIndex: 99999,
          maxWidth: '400px',
          minWidth: '300px',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
