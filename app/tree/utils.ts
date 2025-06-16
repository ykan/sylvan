import { Easing } from 'pixi-ease'

export function waitTime(time: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}

export function waitEaseComplete(easeItem: Easing) {
  return new Promise<void>((resolve) => {
    easeItem.on('complete', resolve)
  })
}
