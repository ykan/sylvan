'use client'
import * as React from 'react'
import { Button } from '@/components/ui/button'

import { createAStarFinder, createGrid, Grid } from './createAStarFinder'

import { Block } from './block'
import { states } from './state'

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

export function Demo() {
  const indexRef = React.useRef(states.length - 1)
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
    if (!stepFn.current || isEndRef.current) {
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
    nextIndex = nextIndex < states.length ? nextIndex : 0
    indexRef.current = nextIndex
    grid.setState(states[nextIndex])
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
