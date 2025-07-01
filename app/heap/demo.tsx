'use client'
import * as React from 'react'

import { ease } from 'pixi-ease'
import { Application, Sprite, Graphics, Text } from 'pixi.js'

type NodeOption = {
  level: number
  levelIndex: number
  value?: number
}
type HNode = {
  readonly value: number
  readonly view: Sprite
  moveTo: (x: number, y: number) => Promise<void>
}

function createNode(
  { value, level, levelIndex }: NodeOption,
  app: Application
) {
  const view = new Sprite()
  const g = new Graphics()
  const text = new Text({
    style: {
      fill: 0x666666,
      fontSize: 10,
    },
  })
  const innerValue = value ? value : Math.floor(Math.random() * 100)

  function active() {
    g.clear()
    g.circle(0, 0, 10)
    g.fill(0xff0000)
    text.style = {
      fill: 0xffffff,
      fontSize: 10,
    }
  }
  function reset() {
    g.clear()
    g.circle(0, 0, 10)
    g.fill(0xcccccc)
    text.style = {
      fill: 0x666666,
      fontSize: 10,
    }
  }
  reset()

  view.addChild(g)
  text.text = innerValue.toString()
  text.x = -text.width / 2
  text.y = -text.height / 2
  view.addChild(text)

  const levelNum = 1 << level
  const padding = (app.canvas.width - 40) / (levelNum + 1) / 2

  view.x = 16 + (levelIndex + 1) * padding
  view.y = 40 + level * 60

  const instance: HNode = {
    get value() {
      return innerValue
    },
    get view() {
      return view
    },
    moveTo(x: number, y: number) {
      return new Promise<void>((resolve) => {
        active()
        const animation = ease.add(view, { x, y }, { duration: 1000 })
        animation.once('complete', () => {
          ease.removeEase(view)
          reset()
          resolve()
        })
      })
    },
  }

  return instance
}

function createNodes(num: number, app: Application) {
  let i = 0
  let level = 0
  let levelCount = 0
  let maxNum = 1 << level
  const nodes: HNode[] = []
  while (i < num) {
    if (levelCount >= maxNum) {
      level++
      levelCount = 0
      maxNum = 1 << level
    }
    const node = createNode({ level, levelIndex: levelCount }, app)
    app.stage.addChild(node.view)
    nodes.push(node)
    levelCount++
    i++
  }
  return nodes
}

async function initDemo(container: HTMLDivElement, app: Application) {
  const rect = container.getBoundingClientRect()
  const ratio = window.devicePixelRatio || 1
  await app.init({
    width: rect.width,
    height: rect.height,
    resolution: ratio,
    backgroundColor: 0xf9f9f9,
  })
  container.appendChild(app.canvas)
  const nodeLength = 27
  const nodes = createNodes(nodeLength, app)

  const getParentIndex = (i: number) => Math.floor((i - 1) / 2)
  const getLeftIndex = (i: number) => 2 * i + 1
  function compareFn(a: HNode, b: HNode) {
    return a.value - b.value
  }

  async function swap(aIndex: number, bIndex: number) {
    const aNode = nodes[aIndex]
    const bNode = nodes[bIndex]
    const aX = aNode.view.x
    const aY = aNode.view.y
    const bX = bNode.view.x
    const bY = bNode.view.y
    await Promise.all([aNode.moveTo(bX, bY), bNode.moveTo(aX, aY)])
    nodes[aIndex] = bNode
    nodes[bIndex] = aNode
  }
  async function shiftDown(currentIndex: number) {
    // console.log('shiftDown', currentIndex)
    const lastIndex = nodes.length - 1
    // 已经是最后一个节点了
    if (currentIndex === lastIndex) {
      return -1
    }
    let swapType: 'parent -> left' | 'parent -> right' = 'parent -> left'
    const leftIndex = getLeftIndex(currentIndex)
    const rightIndex = leftIndex + 1
    const left = nodes[leftIndex]
    const parent = nodes[currentIndex]
    if (leftIndex > lastIndex) {
      return -1
    } else if (leftIndex === lastIndex) {
      if (compareFn(parent, left) > 0) {
        return -1
      }
      swapType = 'parent -> left'
    } else {
      const right = nodes[rightIndex]
      const resultCompareParentLeft = compareFn(parent, left)
      const resultCompareParentRight = compareFn(parent, right)
      const resultCompareLeftRight = compareFn(left, right)
      if (resultCompareParentLeft >= 0 && resultCompareParentRight >= 0) {
        return -1
      }
      swapType =
        resultCompareLeftRight >= 0 ? 'parent -> left' : 'parent -> right'
    }
    if (swapType === 'parent -> left') {
      await swap(currentIndex, leftIndex)
      await shiftDown(leftIndex)
      return
    }
    await swap(currentIndex, rightIndex)
    await shiftDown(rightIndex)
  }
  async function shiftUp(currentIndex: number) {
    // console.log('shiftUp', currentIndex)
    const parentIndex = getParentIndex(currentIndex)
    if (parentIndex < 0) {
      return -1
    }
    const item = nodes[currentIndex]
    const parent = nodes[parentIndex]
    // 结束了
    if (compareFn(parent, item) >= 0) {
      return -1
    }

    await swap(currentIndex, parentIndex)
    await shiftDown(currentIndex)
    await shiftUp(parentIndex)
  }

  async function heapify() {
    let i = nodes.length - 1
    while (i > -1) {
      // console.log('shift up', i)
      await shiftUp(i)
      i--
    }
  }

  const text = new Text({
    text: 'Click anywhere to heapify!',
    style: {
      fill: 0x666666,
      fontSize: 10,
    },
  })
  app.stage.addChild(text)
  text.x = (app.screen.width - text.width) / 2
  text.y = app.screen.height - 50

  let isRunning = false
  app.stage.eventMode = 'static'
  app.stage.hitArea = app.screen
  app.stage.on('pointerdown', async () => {
    if (isRunning) {
      return
    }
    isRunning = true
    await heapify()
    isRunning = false
  })
}

export function Demo() {
  const pixiContainer = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!pixiContainer.current) return
    const app = new Application()
    initDemo(pixiContainer.current, app)
    // 清理
    return () => {
      app.destroy(true, true)
    }
  }, [])

  return <div ref={pixiContainer} className="container" />
}
