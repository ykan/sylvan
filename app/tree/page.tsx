import type { Metadata } from 'next'
import { Game } from './game'
import './game.css'

export const metadata: Metadata = {
  title: 'Run Little Tree',
  description: 'Run Little Tree',
}

export default function Page() {
  return (
    <html>
      <body>
        <Game />
      </body>
    </html>
  )
}
