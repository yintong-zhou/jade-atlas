import { ChevronDown } from 'lucide-react'
import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from 'motion/react'
import { useEffect, useEffectEvent, useRef, useState, type FocusEvent } from 'react'
import { texts } from '../../../../shared/texts'
import type { Dust } from './dust'
import { createFrameCanvas } from './frameCanvas'
import { heroFrames } from './heroFrames'
import { supportsWebGL } from './heroMode'
import { HeroCopy } from './HeroCopy'
import { copyState, HERO, layers } from './heroTimeline'

const span = (r: readonly [number, number]) => [r[0], r[1]]

// Scroll-driven hero: a tall section with a sticky stage. The scroll scrubs the frame sequence,
// then the real text fades in. Drawing happens only through `schedule`, at most once per frame.
export function HeroSequence({ onFail }: { onFail: () => void }) {
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const frameBoxRef = useRef<HTMLDivElement>(null)
  const framesRef = useRef<HTMLCanvasElement>(null)
  const dustRef = useRef<HTMLCanvasElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLSpanElement>(null)
  const revealedRef = useRef(false)
  const scheduleRef = useRef(() => {})
  const firstScroll = useRef(true)
  const [revealed, setRevealed] = useState(false)
  const [urls] = useState(() => (window.matchMedia('(max-width: 767px)').matches ? heroFrames.small : heroFrames.large))

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })
  const progress = useSpring(scrollYProgress, HERO.spring)
  // A page opened already scrolled (reload, back) snaps to its position instead of replaying from 0.
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (!firstScroll.current) return
    firstScroll.current = false
    progress.jump(v)
  })
  useMotionValueEvent(progress, 'change', () => scheduleRef.current())

  const restOpacity = useTransform(progress, span(HERO.copy.rest), [0, 1])
  const restY = useTransform(progress, span(HERO.copy.rest), [12, 0])
  const subtitleOpacity = useTransform(progress, span(HERO.copy.subtitle), [0, 1])
  const subtitleY = useTransform(progress, span(HERO.copy.subtitle), [12, 0])
  const actionsOpacity = useTransform(progress, span(HERO.copy.actions), [0, 1])
  const actionsY = useTransform(progress, span(HERO.copy.actions), [12, 0])
  const styles = {
    name: { opacity: useTransform(progress, span(HERO.settle), [0, 1]) },
    rest: { opacity: restOpacity, y: restY },
    subtitle: { opacity: subtitleOpacity, y: subtitleY },
    actions: { opacity: actionsOpacity, y: actionsY },
  }
  const hint = useTransform(progress, [0, HERO.hintEnd], [1, 0])

  const fail = useEffectEvent(onFail)

  useEffect(() => {
    const section = sectionRef.current!
    const stage = stageRef.current!
    const framesCanvas = framesRef.current!
    const dustCanvas = dustRef.current!
    const copy = copyRef.current!
    const frameBox = frameBoxRef.current!
    const name = nameRef.current!
    let disposed = false
    let raf = 0
    let visible = true
    let dirty = false
    let resized = false
    let dust: Dust | null = null

    const draw = () => {
      raf = 0
      if (!visible) {
        dirty = true // a frame requested before the hero left the screen
        return
      }
      const p = progress.get()
      if (resized) {
        resized = false
        frames.resize()
        dust?.layout()
      }
      frames.draw(p)
      const l = layers(p, dust != null)
      framesCanvas.style.opacity = String(l.frames)
      dustCanvas.style.opacity = String(l.dust)
      dust?.render(l.travel, 1) // the canvas opacity fades the layer; fading in the shader too would square it
      copy.style.pointerEvents = copyState(p, revealedRef.current).interactive ? 'auto' : 'none'
    }

    const schedule = () => {
      if (disposed) return
      if (!visible) {
        dirty = true
        return
      }
      if (!raf) raf = requestAnimationFrame(draw)
    }

    const frames = createFrameCanvas(framesCanvas, urls, HERO.track, {
      onFirstDraw: () => {
        if (imgRef.current) imgRef.current.style.opacity = '0'
      },
      onReady: schedule,
      onNoFrames: () => {
        if (!disposed) fail()
      },
    })
    scheduleRef.current = schedule

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible && dirty) {
        dirty = false
        schedule()
      }
    })
    io.observe(section)
    const ro =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(() => {
            resized = true
            schedule()
          })
    ro?.observe(stage)
    schedule()

    // Particle layer: three.js is loaded only here, after the first paint, and only with WebGL.
    if (supportsWebGL()) {
      const small = window.matchMedia('(max-width: 767px)').matches
      import('./dust')
        .then(({ createDust }) =>
          disposed
            ? null
            : createDust({
                canvas: dustCanvas,
                stage,
                frameBox,
                target: name,
                imageUrl: urls[urls.length - 1],
                count: small ? HERO.particles.small : HERO.particles.large,
                onLost: () => {
                  if (disposed || !dust) return
                  dust.dispose()
                  dust = null
                  schedule()
                },
              }),
        )
        .catch(() => null)
        .then((layer) => {
          if (!layer) return
          if (disposed) {
            layer.dispose()
            return
          }
          dust = layer
          schedule()
          // The name is measured again once the web font is in.
          document.fonts?.ready.then(() => {
            if (disposed || dust !== layer) return
            layer.layout()
            schedule()
          })
        })
    }

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      io.disconnect()
      ro?.disconnect()
      frames.dispose()
      dust?.dispose()
      scheduleRef.current = () => {}
    }
  }, [urls, progress])

  const onFocus = () => {
    revealedRef.current = true
    setRevealed(true)
    scheduleRef.current()
  }
  const onBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (e.currentTarget.contains(e.relatedTarget)) return
    revealedRef.current = false
    setRevealed(false)
    scheduleRef.current()
  }

  return (
    <section
      ref={sectionRef}
      data-hero="sequence"
      data-revealed={revealed}
      className="relative -mt-(--header-height) h-[400svh] bg-card"
    >
      <div ref={stageRef} className="sticky top-0 h-svh overflow-hidden">
        <div
          ref={frameBoxRef}
          data-hero-fx
          className="absolute top-1/2 left-1/2 aspect-square w-[min(80vw,60svh,640px)] -translate-x-1/2 -translate-y-1/2 hero-feather"
        >
          <img
            ref={imgRef}
            src={urls[0]}
            alt=""
            width={720}
            height={720}
            fetchPriority="high"
            className="absolute inset-0 size-full"
          />
          <canvas ref={framesRef} data-layer="frames" aria-hidden="true" className="absolute inset-0 size-full" />
        </div>
        <canvas
          ref={dustRef}
          data-hero-fx
          data-layer="dust"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 size-full"
        />
        <div
          ref={copyRef}
          data-hero-copy
          onFocus={onFocus}
          onBlur={onBlur}
          style={{ pointerEvents: 'none' }}
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-4 md:px-6 lg:px-8"
        >
          <HeroCopy nameRef={nameRef} styles={styles} />
        </div>
        <motion.div
          aria-hidden="true"
          style={{ opacity: hint }}
          className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 text-muted-foreground"
        >
          <span className="type-label">{texts.home.scrollHint}</span>
          <ChevronDown size={20} />
        </motion.div>
      </div>
    </section>
  )
}
