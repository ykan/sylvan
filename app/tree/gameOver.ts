import { ease } from 'pixi-ease'
import { Application, Graphics, Color, Sprite, TextStyle, Text } from 'pixi.js'

import { waitEaseComplete } from './utils'

export async function gameOver(app: Application, restart: () => void) {
  const ratio = window.devicePixelRatio || 1
  const modal = new Sprite()
  app.stage.addChild(modal)

  const modalBg = new Graphics()
  modalBg.rect(0, 0, app.canvas.width, app.canvas.height)
  modalBg.fill(new Color([0, 0, 0, 0.75]))
  modalBg.alpha = 0

  modal.addChild(modalBg)

  const bgEase = ease.add(
    modalBg,
    { alpha: 1 },
    { repeat: false, duration: 500 }
  )
  await waitEaseComplete(bgEase)

  const style = new TextStyle({
    fontFamily: 'Arial',
    fontSize: 40 * ratio,
    fontWeight: 'bold',
    fill: '#ff0000',
    stroke: { color: '#ffffff', width: 2, join: 'round' },
  })

  const text = new Text({
    text: 'Game Over',
    style,
  })

  text.x = (app.canvas.width - text.width) / 2
  text.y = (app.canvas.height - text.height) / 2
  modal.addChild(text)
  const textEase = ease.add(
    text,
    { shake: 10 },
    { repeat: false, duration: 500 }
  )
  await waitEaseComplete(textEase)

  modal.interactive = true
  modal.cursor = 'pointer'
  modal.on('pointerdown', () => {
    ease.removeAll()
    app.stage.removeChild(modal)
    restart()
  })
}
