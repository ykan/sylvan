'use client'
import * as React from 'react'
import { Button } from '@/components/ui/button'

import { createAStarFinder, createGrid, Grid, Node } from './createAStarFinder'
import { cn } from '@/lib/utils'

type BlockType = 'wall' | 'start' | 'end' | 'default'

type IGridContext = {
  startNode: Node
  endNode: Node
  finder: ReturnType<typeof createAStarFinder>
  grid: Grid
}

const GridContext = React.createContext<IGridContext>({} as IGridContext)

function Block(props: { node: Node }) {
  const { node } = props
  const { startNode, endNode } = React.useContext(GridContext)
  const [, setState] = React.useState(0)
  const forceUpdate = React.useCallback(() => setState((n) => n + 1), [])
  const lastF = React.useRef(node.f)
  let result
  if (node.walkable && node.f) {
    let bgClass = 'bg-gray-500'
    if (node.selected) {
      bgClass = 'bg-green-300/50 text-black'
    }
    result = (
      <div className={cn('w-full h-full relative', bgClass)}>
        <span className="absolute left-1 top-1">f={node.f}</span>
        <span className="absolute left-1 bottom-1">g={node.g}</span>
        <span className="absolute right-1 bottom-1">h={node.h}</span>
      </div>
    )
  }
  let $type: BlockType = 'default'
  if (!node.walkable) {
    $type = 'wall'
  } else if (node === startNode) {
    $type = 'start'
    result = 'start'
  } else if (node === endNode) {
    $type = 'end'
    result = 'end'
  }
  // result = `(${node.x}, ${node.y})`
  React.useEffect(() => {
    node?.onChange(() => {
      if (lastF.current !== node.f || node.selected) {
        lastF.current = node.f
        forceUpdate()
      }
    })
  }, [node])
  let bgClass = 'bg-gray-200'
  if ($type === 'wall') {
    bgClass = 'bg-gray-600'
  } else if ($type === 'start') {
    bgClass = 'bg-red-500'
  } else if ($type === 'end') {
    bgClass = 'bg-green-500'
  }
  return (
    <div
      className={cn(
        'flex border border-white w-[60px] h-[60px] text-xs relative items-center justify-center text-white',
        bgClass
      )}
    >
      {result}
    </div>
  )
}

function GridView() {
  const blocks = []
  const { grid } = React.useContext(GridContext)
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      const node = grid.getNodeAt(i, j)
      blocks.push(<Block key={`${i}${j}`} node={node!} />)
    }
  }

  return (
    <div className="w-[600px] h-[600px] mx-auto flex bg-white mb-10 flex-wrap">
      {blocks}
    </div>
  )
}

type ContextValueParams = {
  start: [number, number]
  end: [number, number]
  walls: Array<[number, number]>
}

function createContextValue(params: ContextValueParams): IGridContext {
  const { start, end, walls } = params
  const [startX, startY] = start
  const [endX, endY] = end
  const grid = createGrid(10, 10)
  const startNode = grid.getNodeAt(startX, startY)!
  const endNode = grid.getNodeAt(endX, endY)!
  walls.forEach(([wallX, wallY]) => {
    grid.getNodeAt(wallX, wallY)!.walkable = false
  })
  return {
    grid,
    startNode,
    endNode,
    finder: createAStarFinder(),
  }
}
const params: ContextValueParams[] = [
  {
    start: [4, 3],
    end: [4, 5],
    walls: [
      [3, 4],
      [4, 4],
      [5, 4],
    ],
  },
  {
    start: [6, 1],
    end: [1, 8],
    walls: [
      [4, 0],
      [4, 1],
      [4, 2],
      [3, 3],
      [4, 3],
      [5, 3],
      [6, 3],
      [7, 3],
      [8, 3],
    ],
  },
  {
    start: [6, 1],
    end: [4, 6],
    walls: [
      [2, 4],
      [2, 5],
      [2, 6],
      [3, 4],
      [4, 4],
      [5, 4],
      [5, 5],
      [5, 6],
      [5, 7],
      [3, 8],
      [4, 8],
      [5, 8],
    ],
  },
]

export function Demo() {
  const indexRef = React.useRef(2)
  const contextDefaultValue = React.useMemo(() => {
    return createContextValue(params[indexRef.current])
  }, [])
  const [contextValue, setContextValue] =
    React.useState<IGridContext>(contextDefaultValue)
  const stepFn = React.useRef<(() => boolean) | undefined>(undefined)
  const runStep = React.useCallback(() => {
    if (stepFn.current) {
      const isEnd = stepFn.current()
      if (isEnd) {
        stepFn.current = () => false
      }
    }
  }, [contextValue])
  const handleStartSearch = React.useCallback(() => {
    if (stepFn.current) {
      runStep()
    } else if (!stepFn.current) {
      stepFn.current = contextValue.finder.findPath(
        contextValue.startNode,
        contextValue.endNode,
        contextValue.grid
      )
      runStep()
    }
  }, [contextValue])
  const handleRandomReset = React.useCallback(() => {
    const grid = createGrid(10, 10)
    const startX = Math.floor(Math.random() * 10)
    const startY = Math.floor(Math.random() * 10)
    const endX = Math.floor(Math.random() * 10)
    const endY = Math.floor(Math.random() * 10)
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        if ((i === startX && j === startY) || (i === endX && j === endY)) {
          continue
        }
        const node = grid.getNodeAt(i, j)!
        // 20% 的概率设置为不可走
        node.walkable = Math.random() > 0.2
      }
    }
    const newContextValue: IGridContext = {
      grid,
      startNode: grid.getNodeAt(startX, startY)!,
      endNode: grid.getNodeAt(endX, endY)!,
      finder: createAStarFinder(),
    }
    stepFn.current = undefined
    setContextValue(newContextValue)
  }, [])
  const handleChangeCase = React.useCallback(() => {
    let nextIndex = indexRef.current + 1
    nextIndex = nextIndex < params.length ? nextIndex : 0
    indexRef.current = nextIndex
    setContextValue(createContextValue(params[nextIndex]))
  }, [])
  return (
    <div className="w-[600px] mx-auto py-4">
      <h1 className="text-4xl text-center pb-4">A* Demo</h1>
      <p className="pb-4">
        <span>A good article that explains this algorithm: </span>
        <a
          className="underline"
          href="https://www.gamedev.net/reference/articles/article2003.asp"
          target="_blank"
        >
          A* Pathfinding for Beginners
        </a>
      </p>
      <GridContext.Provider value={contextValue}>
        <GridView />
      </GridContext.Provider>
      <div className="flex justify-between">
        <div>
          <Button onClick={handleStartSearch}>Search Step</Button>
        </div>
        <div className="space-x-1">
          <Button onClick={handleChangeCase}>Change Case</Button>
          <Button onClick={handleRandomReset}>Random Reset</Button>
        </div>
      </div>
    </div>
  )
}
