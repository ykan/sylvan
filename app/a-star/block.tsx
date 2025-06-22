'use client'
import * as React from 'react'

import { cn } from '@/lib/utils'
import { SearchNode } from './type'

export function Block({ node }: { node: SearchNode }) {
  const [, setState] = React.useState(0)
  const forceUpdate = React.useCallback(() => setState((n) => n + 1), [])
  let result
  if (node.walkable && node.f) {
    let bgClass = 'bg-gray-500'
    if (node.selected) {
      bgClass = 'bg-green-300/50 text-black'
    }
    result = (
      <div className={cn('w-full h-full relative', bgClass)}>
        <span className="absolute scale-80 left-1 top-1">f={node.f}</span>
        <span className="absolute scale-80 left-1 bottom-1">g={node.g}</span>
        <span className="absolute scale-80 right-1 bottom-1">h={node.h}</span>
      </div>
    )
  } else if (node.type === 'start') {
    result = 'start'
  } else if (node.type === 'end') {
    result = 'end'
  }
  // result = `(${node.x}, ${node.y})`
  React.useEffect(() => {
    node?.onChange(() => {
      forceUpdate()
    })
  }, [node])
  let bgClass = 'bg-gray-200'
  if (node.type === 'wall') {
    bgClass = 'bg-gray-600'
  } else if (node.type === 'start') {
    bgClass = 'bg-red-500'
  } else if (node.type === 'end') {
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
