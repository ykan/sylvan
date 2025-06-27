import { ease } from 'pixi-ease'
import { Application, Point, Sprite, Text, TilingSprite, Assets } from 'pixi.js'

import { sleep } from '@/lib/utils'

import { createGrid } from './createGrid'
import { createTreeMap } from './createTreeMap'
import { gameOver } from './gameOver'

import type { TreeType, Tree } from './types'
type GameStatus = 'play' | 'moving'

export function createMainScene(app: Application) {
  // 一些常量
  const ratio = window.devicePixelRatio || 1
  const mapX = 20 * ratio
  const mapY = 100 * ratio
  const mapSize = app.canvas.width - mapX * 2 // v8: app.view -> app.canvas
  const rowNum = 8
  const blockSize = (mapSize / rowNum) >> 0

  // 全局地图
  const map = new Sprite()
  map.x = mapX
  map.y = mapY

  let scoreView: Text

  function createScoreView() {
    const scoreLogo = Sprite.from('1-green')
    scoreLogo.x = mapX
    scoreLogo.y = mapY - 50 * ratio
    app.stage.addChild(scoreLogo)
    scoreView = new Text({
      text: '0',
      style: {
        fontSize: 40 * ratio,
        fill: 0x333333,
        fontWeight: 'bold',
      },
    })
    scoreView.x = mapX + scoreLogo.width + 10 * ratio
    scoreView.y = mapY - 50 * ratio
    app.stage.addChild(scoreView)
  }
  let totalScore = 0
  function updateScore() {
    if (scoreView) {
      scoreView.text = `${totalScore * 10}`
    }
  }

  // 全局网格
  let grid = createGrid(rowNum, rowNum)
  const treeMap = createTreeMap<Tree>()
  let gameStatus: GameStatus = 'play'
  let lastTree: Tree | undefined

  function createTree(type: TreeType) {
    // v8: 用 Assets.get 获取资源，Sprite.from 创建精灵
    const texture = Assets.get(type)
    const view = Sprite.from(texture)
    view.scale.set(blockSize / 90)
    view.interactive = true
    view.anchor.set(0.5)
    const xDelta = blockSize / 2
    const yDelta = blockSize / 2

    let gridX = -1
    let gridY = -1

    const instance: Tree = {
      startMove() {
        view.rotation = Math.PI / 12
      },
      endMove() {
        view.rotation = 0
      },
      moveTo(x: number, y: number) {
        if (gridX > -1) {
          grid.setWalkable(gridX, gridY)
        }
        gridX = x
        gridY = y
        view.x = x * blockSize + xDelta
        view.y = y * blockSize + yDelta
        grid.setWalkable(x, y, false)
      },
      destroy() {
        map.removeChild(view)
        view.removeAllListeners()
      },
      async remove() {
        grid.setWalkable(gridX, gridY)
        map.removeChild(view)
      },
      async shake() {
        ease.add(
          view,
          { rotation: -Math.PI / 12 },
          { repeat: true, duration: 50, ease: 'easeInOutQuad', reverse: true }
        )
        await sleep(500)
        ease.removeEase(view)
      },
      get type() {
        return type
      },
      get view() {
        return view
      },
      get gridX() {
        return gridX
      },
      get gridY() {
        return gridY
      },
    }
    treeMap.push(instance)
    view.on('pointerdown', () => {
      if (gameStatus !== 'play') {
        return
      }
      if (lastTree) {
        lastTree.endMove()
      }
      if (lastTree === instance) {
        lastTree = undefined
        return
      }
      instance.startMove()
      lastTree = instance
    })
    return instance
  }

  // 分阶段产生不同类型的 tree
  const level1RandomTreeTypes: TreeType[] = [
    '1-green',
    '1-blue',
    '1-purple',
    '1-yellow',
  ]
  const level2RandomTreeTypes: TreeType[] = [
    '1-green',
    '1-blue',
    '1-purple',
    '1-yellow',
    '2-red',
    '2-black',
  ]
  function randomAddTrees(level: 1 | 2, num?: number) {
    const treeTypes =
      level === 1 ? level1RandomTreeTypes : level2RandomTreeTypes
    const defaultGenerateNum = level === 1 ? 2 : 3
    const generateNum = num || defaultGenerateNum
    let walkableNodes = grid.getWalkableNodes()
    if (walkableNodes.length === 0) {
      return
    }
    const randomPop = () => {
      const i = (Math.random() * walkableNodes.length) >> 0
      const result = walkableNodes[i]
      walkableNodes = walkableNodes.filter((n) => n !== result)
      return result
    }
    let i =
      walkableNodes.length > generateNum ? generateNum : walkableNodes.length
    const trees: Tree[] = []
    while (i > 0) {
      const [x, y] = randomPop()
      const treeType = treeTypes[(Math.random() * treeTypes.length) >> 0]
      const tree = createTree(treeType)
      tree.moveTo(x, y)
      map.addChild(tree.view)
      trees.push(tree)
      i--
    }
    return trees
  }

  async function checkTrees(trees: Tree[]) {
    const checkMap = treeMap.getCheckMap(trees)
    const removeMap = treeMap.check(checkMap)
    const removeTypes = Object.keys(removeMap)
    for (const removeType of removeTypes) {
      const removeTrees = removeMap[removeType]
      for (const tree of removeTrees) {
        await tree.remove()
        if (tree.type === '2-black' || tree.type === '2-red') {
          totalScore += 2
        } else {
          totalScore += 1
        }
      }
    }
    updateScore()
  }
  async function restart() {
    const trees = treeMap.trees
    trees.forEach((tree) => tree.destroy())

    treeMap.reset()
    grid = createGrid(rowNum, rowNum)
    gameStatus = 'play'
    totalScore = 0
    updateScore()
    randomAddTrees(1, 4)
  }

  async function moveLastTreeTo(endX: number, endY: number) {
    if (gameStatus !== 'play' || !lastTree) {
      return
    }
    const startX = lastTree.gridX
    const startY = lastTree.gridY
    const steps = grid.findPath({
      startX,
      startY,
      endX,
      endY,
    })

    gameStatus = 'moving'
    if (steps.length === 0) {
      await lastTree.shake()
      lastTree.endMove()
      lastTree = undefined
      gameStatus = 'play'
      return
    }
    const moveSpeed = Math.min(2400 / steps.length, 300)
    for (const step of steps) {
      const [x, y] = step
      lastTree.moveTo(x, y)
      await sleep(moveSpeed)
    }
    lastTree.endMove()
    const trees = [lastTree]
    lastTree = undefined
    await checkTrees(trees)
    await sleep(300)

    let nextLevel: 1 | 2 = 1
    let nextGenerateNum = 2
    if (totalScore > 40) {
      nextGenerateNum = 3
    }
    if (totalScore > 70) {
      nextLevel = 2
    }
    const newTrees = randomAddTrees(nextLevel, nextGenerateNum)
    await sleep(600)
    if (newTrees?.length) {
      await checkTrees(newTrees)
    }
    const walkableNodes = grid.getWalkableNodes()
    if (walkableNodes.length === 0) {
      gameOver(app, restart)
      return
    }
    gameStatus = 'play'
  }

  function startGame() {
    const mapBg = new TilingSprite({
      texture: Assets.get('map'),
      width: rowNum * 52,
      height: rowNum * 52,
    })

    mapBg.scale.set(blockSize / 52, blockSize / 52)
    mapBg.interactive = true
    map.addChild(mapBg)

    app.stage.addChild(map)
    createScoreView()

    mapBg.on('pointerdown', (e) => {
      const mousePointer = e.data.global as Point
      const endX = ((mousePointer.x - mapX) / blockSize) >> 0
      const endY = ((mousePointer.y - mapY) / blockSize) >> 0
      moveLastTreeTo(endX, endY)
    })

    randomAddTrees(1, 4)
  }
  return {
    startGame,
  }
}
