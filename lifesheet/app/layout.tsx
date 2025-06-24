import type { Metadata } from 'next'
import './globals.css'
import { Auth0Provider } from '@auth0/auth0-react'

export const metadata: Metadata = {
  title: 'LifeSheet',
  description: 'Your CV management and tailoring solution',
  generator: 'v0.dev',
}

 export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
 