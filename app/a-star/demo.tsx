'use client'
import * as React from 'react'
import { Button } from '@/components/ui/button'

import { createAStarFinder, createGrid, Grid } from './createAStarFinder'

import { Block } from './block'
import { GridState } from './type'

function GridView({ grid }: { grid: Grid }) {
  const blocks = []
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      const node = grid.getNodeAt(i, j)
      blocks.push(<Block key={`${i}${j}`} node={node!} />)
    }
  }

  return (
    <div className="w-[600px] h-[600px] mx-auto flex bg-white mb-5 flex-wrap">
      {blocks}
    </div>
  )
}

const params: GridState[] = [
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
  const stepFn = React.useRef<(() => boolean) | undefined>(undefined)
  const isEndRef = React.useRef(false)
  const finder = React.useMemo(() => {
    return createAStarFinder()
  }, [])
  const grid = React.useMemo(() => {
    return createGrid(10, 10)
  }, [])
  const handleManualStep = React.useCallback(() => {
    window.clearTimeout(autoTimer.current)
    if (!stepFn.current) {
      return
    }
    const isEnd = stepFn.current?.()
    isEndRef.current = !!isEnd
  }, [grid])
  const autoTimer = React.useRef(-1)
  const handleAutoStep = React.useCallback(() => {
    handleManualStep()
    autoTimer.current = window.setTimeout(() => {
      if (!isEndRef.current) {
        handleAutoStep()
      }
    }, 500)
  }, [grid])
  const handleRandomReset = React.useCallback(() => {
    const startX = Math.floor(Math.random() * 10)
    const startY = Math.floor(Math.random() * 10)
    const endX = Math.floor(Math.random() * 10)
    const endY = Math.floor(Math.random() * 10)
    const walls: [number, number][] = []
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        if ((i === startX && j === startY) || (i === endX && j === endY)) {
          continue
        }
        if (Math.random() > 0.8) {
          walls.push([i, j])
        }
      }
    }
    grid.setState({
      start: [startX, startY],
      end: [endX, endY],
      walls: walls,
    })
    stepFn.current = finder.findPath(grid)
    isEndRef.current = false
  }, [])
  const handleChangeCase = React.useCallback(() => {
    let nextIndex = indexRef.current + 1
    nextIndex = nextIndex < params.length ? nextIndex : 0
    indexRef.current = nextIndex
    grid.setState(params[nextIndex])
    stepFn.current = finder.findPath(grid)
    isEndRef.current = false
  }, [])

  React.useEffect(() => {
    handleChangeCase()
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
      <GridView grid={grid} />
      <div className="flex justify-between">
        <div className="space-x-2">
          <Button onClick={handleAutoStep}>Auto Step</Button>
          <Button onClick={handleManualStep} variant="secondary">
            Manual Step
          </Button>
        </div>
        <div className="space-x-2">
          <Button onClick={handleChangeCase} variant="secondary">
            Change Case
          </Button>
          <Button onClick={handleRandomReset} variant="secondary">
            Random Reset
          </Button>
        </div>
      </div>
    </div>
  )
}
