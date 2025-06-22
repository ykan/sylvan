export type SearchNode = {
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
  type: 'wall' | 'start' | 'end' | 'default'
  onChange: (fn: () => void) => void
  reset: () => void
  parent?: SearchNode
}

export type GridState = {
  start: [number, number]
  end: [number, number]
  walls: Array<[number, number]>
}
