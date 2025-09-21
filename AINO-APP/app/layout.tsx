import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { AuthProvider } from '@/hooks/use-auth'
import { IframeConfigBridgeProvider } from '@/components/providers/iframe-config-bridge-provider'

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans" suppressHydrationWarning={true}>
        <AuthProvider>
          <IframeConfigBridgeProvider>
            {children}
          </IframeConfigBridgeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
