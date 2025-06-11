import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sylvan Blog',
  description: 'Sylvan Blog',
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
