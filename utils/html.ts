export function isMouseEvent(e: MouseEvent | TouchEvent): e is MouseEvent {
  return e.type === 'mouseup'
}

export function isTouchEvent(e: MouseEvent | TouchEvent): e is TouchEvent {
  return e.type === 'touchstart'
}

export function isMobile(): boolean {
  if (typeof window !== 'undefined') {
    return window.innerWidth < 640
  }
  return false
}
