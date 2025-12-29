import Lenis from 'lenis'

let lenisInstance = null
let _rafRunning = false
let _fallbackToNative = false
let _wheelWatcher = null
let _watchdogTimer = null
let _suspended = false

export function initLenis() {
  if (!lenisInstance && typeof window !== 'undefined') {
    lenisInstance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
      orientation: 'vertical',
      gestureOrientation: 'vertical'
    })

    const loop = (time) => {
      try { lenisInstance.raf(time) } catch (e) { /* noop */ }
      requestAnimationFrame(loop)
    }

    requestAnimationFrame(loop)
  }
  return lenisInstance
}

export function getLenis() {
  return lenisInstance
}

export function subscribeToScroll(handler) {
  const lenis = getLenis()
  if (lenis && typeof lenis.on === 'function') {
    const cb = (e) => {
      try { handler(typeof e === 'object' && e !== null && 'scroll' in e ? e.scroll : window.scrollY) } catch (err) { }
    }
    lenis.on('scroll', cb)
    return () => { try { lenis.off('scroll', cb) } catch (e) { } }
  }

  const wrapped = () => handler(window.scrollY)
  window.addEventListener('scroll', wrapped, { passive: true })
  return () => window.removeEventListener('scroll', wrapped)
}

export function scrollToTop(options = {}) {
  const lenis = getLenis()
  if (lenis && typeof lenis.scrollTo === 'function') {
    lenis.scrollTo(0, options)
  } else {
    window.scrollTo(0, 0)
  }
}

export default { initLenis, getLenis, scrollToTop, subscribeToScroll }
      
