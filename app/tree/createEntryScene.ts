import { ease } from 'pixi-ease'
import { Application, Text, Assets, TextStyle } from 'pixi.js'

export function createEntryScene(app: Application) {
  const ratio = window.devicePixelRatio || 1
  // v8: 用 Assets.load 批量加载资源
  const loadAssets = async () => {
    const assetList = [
      { alias: 'logo', src: '/logo.png' },
      { alias: 'map', src: '/map.png' },
      { alias: '1-green', src: '/1-green.png' },
      { alias: '1-blue', src: '/1-blue.png' },
      { alias: '1-yellow', src: '/1-yellow.png' },
      { alias: '1-purple', src: '/1-purple.png' },
      { alias: '2-red', src: '/2-red.png' },
      { alias: '2-black', src: '/2-black.png' },
    ]
    // 注册资源
    for (const asset of assetList) {
      Assets.add({ alias: asset.alias, src: asset.src })
    }
    // 加载所有资源
    await Assets.load(assetList.map((a) => a.alias))
  }
  const style = new TextStyle({
    fontFamily: 'Arial',
    fontSize: 40 * ratio,
    fontWeight: 'bold',
    fill: '#ffffff',
    stroke: { color: '#4a1850', width: 5, join: 'round' },
    dropShadow: {
      color: '#000000',
      blur: 4,
      angle: Math.PI / 6,
      distance: 6,
    },
  })

  const startButton = new Text({
    text: 'Start Game',
    style,
  })

  return {
    async enterLoadingView(onStart?: () => void) {
      // v8: 资源加载
      await loadAssets()
      startButton.x = (app.canvas.width - startButton.width) / 2
      startButton.y = (app.canvas.height - startButton.height) / 2
      startButton.interactive = true
      startButton.cursor = 'pointer'
      ease.add(
        startButton,
        { alpha: 0.5, y: startButton.y + 5, x: startButton.x + 2 },
        { repeat: true, duration: 1500, ease: 'easeInOutQuad', reverse: true }
      )
      const next = () => {
        ease.removeEase(startButton)
        app.stage.removeChild(startButton)
        onStart?.()
      }
      startButton.once('pointerdown', next)
      app.stage.addChild(startButton)
    },
  }
}
