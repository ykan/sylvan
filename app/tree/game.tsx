'use client'
import * as React from 'react'
import * as PIXI from 'pixi.js'

import { createEntryScene } from './createEntryScene'
import { createMainScene } from './createMainScene'

async function initGame(container: HTMLDivElement, app: PIXI.Application) {
  const rect = container.getBoundingClientRect()
  const ratio = window.devicePixelRatio || 1
  await app.init({
    width: rect.width * ratio,
    height: rect.height * ratio,
    backgroundColor: 0xf1f1f1,
  })
  container.appendChild(app.canvas)
  const entryScene = createEntryScene(app)
  const mainScene = createMainScene(app)
  entryScene.enterLoadingView(() => {
    mainScene.startGame()
  })
}

export function Game() {
  const pixiContainer = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!pixiContainer.current) return
    const app = new PIXI.Application()
    initGame(pixiContainer.current, app)
    // 清理
    return () => {
      app.destroy(true, true)
    }
  }, [])

  return <div ref={pixiContainer} className="container" />
}
