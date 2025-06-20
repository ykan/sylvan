import type { Metadata } from 'next'
import { Demo } from './demo'
import './global.css'

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
