import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { type Easing } from 'pixi-ease'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sleep(time: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}

export function waitEaseComplete(easeItem: Easing) {
  return new Promise<void>((resolve) => {
    easeItem.on('complete', resolve)
  })
}
