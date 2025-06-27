import type { Metadata } from 'next'
import { Demo } from './demo'
import './demo.css'

export const metadata: Metadata = {
  title: 'Heapify',
  description: 'Heapify',
}

export default function Page() {
  return (
    <html>
      <body>
        <h1 className="text-center py-5">Heapify Demo</h1>
        <Demo />
      </body>
    </html>
  )
}
