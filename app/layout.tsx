import '@/app/globals.css'
import { getLocale, getMessages } from 'next-intl/server'
import { Providers } from '@/components/Providers'
import { Inter, Luckiest_Guy } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const luckiest = Luckiest_Guy({
  weight: "400",
  subsets: ["latin"],
  variable: '--font-luckiest',
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning className={`${inter.variable} ${luckiest.variable}`}>
      <body className="h-full bg-background">
        <Providers locale={locale} messages={messages}>{children}</Providers>
      </body>
    </html>
  )
}
