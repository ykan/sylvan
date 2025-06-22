'use client'
import Heap from 'heap'

import type { SearchNode, GridState } from './type'

function manhattan(dx: number, dy: number) {
  return dx + dy
}

export function createNode(x: number, y: number): SearchNode {
  let _change = () => {}
  let _f = 0,
    _g = 0,
    _h = 0
  let _walkable = true,
    _selected = false,
    _type: SearchNode['type'] = 'default'
  return {
    x,
    y,
    onChange: (fn) => {
      _change = fn
    },
    reset() {
      _f = 0
      _g = 0
      _h = 0
      _selected = false
      _walkable = true
      _type = 'default'
      this.parent = undefined
      this.closed = undefined
      _change()
    },
    set f(v: number) {
      _f = v
      _change()
    },
    get f() {
      return _f
    },
    set g(v: number) {
      _g = v
      _change()
    },
    get g() {
      return _g
    },
    set h(v: number) {
      _h = v
      _change()
    },
    get h() {
      return _h
    },

    set type(v: SearchNode['type']) {
      _type = v
      _walkable = v !== 'wall'
      _change()
    },
    get type() {
      return _type
    },
    get walkable() {
      return _walkable
    },
    set selected(v: boolean) {
      _selected = v
      _change()
    },
    get selected() {
      return _selected
    },
  }
}

export function createGrid(colNum: number, rowNum: number) {
  const nodes: SearchNode[][] = []
  let _state: GridState | undefined

  for (let i = 0; i < colNum; i++) {
    if (!nodes[i]) {
      nodes[i] = []
    }
    for (let j = 0; j < rowNum; j++) {
      const node = createNode(i, j)
      nodes[i][j] = node
    }
  }

  const instance = {
    getNodeAt(x: number, y: number): SearchNode | undefined {
      return nodes[x]?.[y]
    },
    getWalkableNodeAt(x: number, y: number) {
      const node = instance.getNodeAt(x, y)
      if (node?.walkable) {
        return node
      }
    },
    /**
     * 获取目标节点周围的节点
     * 当前只获取上下左右
     */
    getNeighbors(node: SearchNode) {
      const neighbors = [
        instance.getWalkableNodeAt(node.x - 1, node.y),
        instance.getWalkableNodeAt(node.x + 1, node.y),

        instance.getWalkableNodeAt(node.x, node.y - 1),
        instance.getWalkableNodeAt(node.x, node.y + 1),
      ]
      return neighbors.filter((n) => !!n) as SearchNode[]
    },
    clearState() {
      _state = undefined
      for (let i = 0; i < colNum; i++) {
        for (let j = 0; j < rowNum; j++) {
          const node = nodes[i][j]
          node.reset()
        }
      }
    },
    /**
     * 设置网格状态
     */
    setState(state: GridState) {
      instance.clearState()
      _state = state
      _state.walls.forEach(([wallX, wallY]) => {
        const node = instance.getNodeAt(wallX, wallY)
        if (node) {
          node.type = 'wall'
        }
      })
      const startNode = instance.getStartNode()
      if (startNode) {
        startNode.type = 'start'
      }
      const endNode = instance.getEndNode()
      if (endNode) {
        endNode.type = 'end'
      }
    },
    getStartNode() {
      if (!_state?.start) {
        return
      }
      const [startX, startY] = _state.start
      return instance.getNodeAt(startX, startY)
    },
    getEndNode() {
      if (!_state?.end) {
        return
      }
      const [endX, endY] = _state.end
      return instance.getNodeAt(endX, endY)
    },
    isEndNode(node: SearchNode) {
      if (_state?.end && node) {
        const [endX, endY] = _state.end
        return endX === node.x && endY === node.y
      }
      return false
    },
  }

  return instance
}

export type Grid = ReturnType<typeof createGrid>

interface AStarFinderOptions {
  weight?: number
  heuristic?: (dx: number, dy: number) => number
}

export function createAStarFinder(opts: AStarFinderOptions = {}) {
  const innerWeight = opts.weight || 1
  const heuristic = opts.heuristic || manhattan
  return {
    findPath(grid: Grid) {
      const openList = new Heap<SearchNode>((nodeA, nodeB) => {
        return nodeA.f - nodeB.f
      })
      const startNode = grid.getStartNode()
      const endNode = grid.getEndNode()
      if (!startNode || !endNode) {
        return
      }

      // set the `g` and `f` value of the start node to be 0
      startNode.g = 0
      startNode.f = 0

      // push the start node into the open list
      openList.push(startNode)
      startNode.opened = true

      return () => {
        // pop the position of node which has the minimum `f` value.
        const node = openList.pop()
        if (!node) {
          return false
        }
        node.closed = true

        // get neighbors of the current node
        const neighbors = grid.getNeighbors(node)
        for (let i = 0, l = neighbors.length; i < l; i++) {
          const neighbor = neighbors[i]

          // if reached the end position, construct the path and return it
          if (grid.isEndNode(neighbor)) {
            let n = node
            while (n.parent) {
              n.selected = true
              n = n.parent
            }
            return true
          }

          if (neighbor.closed) {
            continue
          }

          // get the distance between current node and the neighbor
          // and calculate the next g score
          const ng = node.g + 1

          // check if the neighbor has not been inspected yet, or
          // can be reached with smaller cost from the current node
          if (!neighbor.opened || ng < neighbor.g) {
            neighbor.g = ng
            neighbor.h =
              neighbor.h ||
              innerWeight *
                heuristic(
                  Math.abs(neighbor.x - endNode.x),
                  Math.abs(neighbor.y - endNode.y)
                )
            neighbor.f = neighbor.g + neighbor.h
            neighbor.parent = node

            if (!neighbor.opened) {
              openList.push(neighbor)
              neighbor.opened = true
            } else {
              // console.log('update heap')
              // the neighbor can be reached with smaller cost.
              // Since its f value has been updated, we have to
              // update its position in the open list
              openList.updateItem(neighbor)
            }
          }
        } // end for each neighbor

        return false
      }
    },
  }
}
