import type { Metadata } from 'next'
import { Demo } from './demo'

export const metadata: Metadata = {
  title: 'A Star Demo',
  description: 'A Star Demo',
}

export default function Page() {
  return (
    <html>
      <body>
        <Demo />
      </body>
    </html>
  )
}
