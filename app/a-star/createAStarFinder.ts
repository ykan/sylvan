'use client'
import Heap from 'heap'

export type Node = {
  x: number
  y: number
  walkable: boolean
  closed?: boolean
  opened?: boolean
  selected?: boolean
  /**
   * G = 从起点A，沿着产生的路径，移动到网格上指定方格的移动耗费。
   */
  g: number
  /**
   * H = 从网格上那个方格移动到终点B的预估移动耗费。
   */
  h: number
  /**
   * F = G + H
   */
  f: number
  onChange: (fn: () => void) => void
  parent?: Node
}

function manhattan(dx: number, dy: number) {
  return dx + dy
}

export function createNode(x: number, y: number): Node {
  let _change = () => {}
  let _f = 0,
    _g = 0,
    _h = 0
  let _walkable = true,
    _selected = false
  return {
    x,
    y,
    onChange: (fn) => {
      _change = fn
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

    set walkable(v: boolean) {
      _walkable = v
      _change()
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
  const nodes: Node[][] = []
  const buildNodes = () => {
    for (let i = 0; i < colNum; i++) {
      if (!nodes[i]) {
        nodes[i] = []
      }
      for (let j = 0; j < rowNum; j++) {
        const node = createNode(i, j)
        nodes[i][j] = node
      }
    }
  }

  const instance = {
    reset() {
      buildNodes()
    },
    setWalkable(x: number, y: number, val = true) {
      const node = instance.getNodeAt(x, y)
      if (node) {
        node.walkable = val
      }
    },
    getNodeAt(x: number, y: number): Node | undefined {
      return nodes[x]?.[y]
    },
    getWalkableNodeAt(x: number, y: number) {
      const node = instance.getNodeAt(x, y)
      if (node?.walkable) {
        return node
      }
    },
    // 这里先只实现 4 方向
    getNeighbors(node: Node) {
      const neighbors = [
        instance.getWalkableNodeAt(node.x - 1, node.y),
        instance.getWalkableNodeAt(node.x + 1, node.y),

        instance.getWalkableNodeAt(node.x, node.y - 1),
        instance.getWalkableNodeAt(node.x, node.y + 1),
      ]
      return neighbors.filter((n) => !!n) as Node[]
    },
    toString() {
      const rows = nodes.map((row) => {
        const nums = row.map((item) => {
          if (item.walkable) {
            return 0
          }
          return 1
        })
        return nums.join(' ')
      })
      return rows.join('\n')
    },
  }
  instance.reset()

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
    findPath(startNode: Node, endNode: Node, grid: Grid) {
      const openList = new Heap<Node>((nodeA, nodeB) => {
        return nodeA.f - nodeB.f
      })

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

        // if reached the end position, construct the path and return it
        if (node === endNode) {
          let n = node
          while (n.parent) {
            n.selected = true
            n = n.parent
          }
          return true
        }

        // get neigbours of the current node
        const neighbors = grid.getNeighbors(node)
        for (let i = 0, l = neighbors.length; i < l; i++) {
          const neighbor = neighbors[i]

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
