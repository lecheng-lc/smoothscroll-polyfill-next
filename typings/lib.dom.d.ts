  declare interface HTMLElement {
    targetDisY?: number
    targetDisX?: number
}

declare interface Window {
  targetDisY: number
  targetDisX: number
}
interface ScrollOptions {
  callback?: Function
  cubicObj?: Object | null
  duration?: number
}