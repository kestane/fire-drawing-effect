"use client"

import type React from "react"
import { useRef, useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Flame, Snowflake, RotateCcw, Zap, Crown, Circle, Volume2, VolumeX, Music, SkipBack, SkipForward } from "lucide-react"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  hue: number
  type: "fire" | "ice" | "fireflies" | "lightning" | "god" | "bubbles"
  pulse?: number
  zigzagTimer?: number
  spiralAngle?: number
  bubbleFloat?: number
}

interface DrawingCanvasProps {
  width?: number
  height?: number
}

type EffectType = "fire" | "ice" | "fireflies" | "lightning" | "god" | "bubbles"

export default function DrawingCanvas({ width = 800, height = 600 }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | undefined>(undefined)
  const backgroundAnimationRef = useRef<number | undefined>(undefined)
  const particlesRef = useRef<Particle[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 })
  const [smoothedPos, setSmoothedPos] = useState({ x: 0, y: 0 })
  const [velocity, setVelocity] = useState({ x: 0, y: 0 })
  const [currentEffect, setCurrentEffect] = useState<EffectType>("fire")
  const [canvasReady, setCanvasReady] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const [cursorDirection, setCursorDirection] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [cursorSpeed, setCursorSpeed] = useState<number>(0)

  // Audio context and nodes
  const audioContextRef = useRef<AudioContext | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)


  
  // Ambient music file playback
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null)
  const [availableMusic, setAvailableMusic] = useState<string[]>([])
  const [currentTrack, setCurrentTrack] = useState<string>("")
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)

  // Background stars
  const starsRef = useRef<
    Array<{ x: number; y: number; size: number; speed: number; opacity: number; baseOpacity: number; color: string }>
  >([])
  const farStarsRef = useRef<
    Array<{
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      opacity: number
      baseOpacity: number
      color: string
      directionChangeTimer: number
    }>
  >([])

  // Initialize audio context
  const initAudio = useCallback(async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()

        // Resume if suspended
        if (audioContextRef.current.state === "suspended") {
          await audioContextRef.current.resume()
        }

        masterGainRef.current = audioContextRef.current.createGain()
        masterGainRef.current.connect(audioContextRef.current.destination)
        masterGainRef.current.gain.value = isMuted ? 0 : 0.3

        console.log("Audio context initialized successfully")
      }
    } catch (error) {
      console.error("Failed to initialize audio:", error)
    }
  }, [isMuted])

  // Create sound effects for each particle type
  const playSound = useCallback(
    (effectType: EffectType, intensity = 1) => {
      if (isMuted || !audioContextRef.current || !masterGainRef.current) return

      const ctx = audioContextRef.current
      const now = ctx.currentTime
      const duration = 0.1 + intensity * 0.1

      try {
        switch (effectType) {
          case "fire": {
            const oscillator = ctx.createOscillator()
            const gain = ctx.createGain()
            const filter = ctx.createBiquadFilter()

            oscillator.type = "sawtooth"
            oscillator.frequency.setValueAtTime(80 + Math.random() * 40, now)
            oscillator.frequency.exponentialRampToValueAtTime(40 + Math.random() * 20, now + duration)

            filter.type = "lowpass"
            filter.frequency.value = 800 + Math.random() * 400
            filter.Q.value = 2

            gain.gain.setValueAtTime(0, now)
            gain.gain.linearRampToValueAtTime(0.1 * intensity, now + 0.01)
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

            oscillator.connect(filter)
            filter.connect(gain)
            gain.connect(masterGainRef.current!)

            oscillator.start(now)
            oscillator.stop(now + duration)
            break
          }

          case "ice": {
            const oscillator1 = ctx.createOscillator()
            const oscillator2 = ctx.createOscillator()
            const gain = ctx.createGain()

            oscillator1.type = "sine"
            oscillator1.frequency.value = 800 + Math.random() * 600
            oscillator2.type = "sine"
            oscillator2.frequency.value = 1200 + Math.random() * 800

            gain.gain.setValueAtTime(0, now)
            gain.gain.linearRampToValueAtTime(0.08 * intensity, now + 0.01)
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration * 2)

            oscillator1.connect(gain)
            oscillator2.connect(gain)
            gain.connect(masterGainRef.current!)

            oscillator1.start(now)
            oscillator2.start(now)
            oscillator1.stop(now + duration * 2)
            oscillator2.stop(now + duration * 2)
            break
          }

          case "lightning": {
            const oscillator = ctx.createOscillator()
            const gain = ctx.createGain()
            const filter = ctx.createBiquadFilter()

            oscillator.type = "square"
            oscillator.frequency.setValueAtTime(200 + Math.random() * 300, now)
            oscillator.frequency.linearRampToValueAtTime(100 + Math.random() * 200, now + duration * 0.5)

            filter.type = "highpass"
            filter.frequency.value = 300

            gain.gain.setValueAtTime(0, now)
            gain.gain.linearRampToValueAtTime(0.15 * intensity, now + 0.005)
            gain.gain.linearRampToValueAtTime(0, now + duration * 0.3)

            oscillator.connect(filter)
            filter.connect(gain)
            gain.connect(masterGainRef.current!)

            oscillator.start(now)
            oscillator.stop(now + duration * 0.3)
            break
          }

          case "god": {
            const oscillator1 = ctx.createOscillator()
            const oscillator2 = ctx.createOscillator()
            const oscillator3 = ctx.createOscillator()
            const gain = ctx.createGain()

            const baseFreq = 220 + Math.random() * 110
            oscillator1.type = "sine"
            oscillator1.frequency.value = baseFreq
            oscillator2.type = "sine"
            oscillator2.frequency.value = baseFreq * 1.5
            oscillator3.type = "sine"
            oscillator3.frequency.value = baseFreq * 2

            gain.gain.setValueAtTime(0, now)
            gain.gain.linearRampToValueAtTime(0.06 * intensity, now + 0.02)
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration * 3)

            oscillator1.connect(gain)
            oscillator2.connect(gain)
            oscillator3.connect(gain)
            gain.connect(masterGainRef.current!)

            oscillator1.start(now)
            oscillator2.start(now)
            oscillator3.start(now)
            oscillator1.stop(now + duration * 3)
            oscillator2.stop(now + duration * 3)
            oscillator3.stop(now + duration * 3)
            break
          }

          case "bubbles": {
            const oscillator = ctx.createOscillator()
            const gain = ctx.createGain()
            const filter = ctx.createBiquadFilter()

            oscillator.type = "sine"
            oscillator.frequency.setValueAtTime(400 + Math.random() * 200, now)
            oscillator.frequency.exponentialRampToValueAtTime(200 + Math.random() * 100, now + duration)

            filter.type = "bandpass"
            filter.frequency.value = 500
            filter.Q.value = 5

            gain.gain.setValueAtTime(0, now)
            gain.gain.linearRampToValueAtTime(0.1 * intensity, now + 0.01)
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

            oscillator.connect(filter)
            filter.connect(gain)
            gain.connect(masterGainRef.current!)

            oscillator.start(now)
            oscillator.stop(now + duration)
            break
          }

          case "fireflies": {
            const oscillator = ctx.createOscillator()
            const gain = ctx.createGain()

            oscillator.type = "triangle"
            oscillator.frequency.value = 600 + Math.random() * 400

            gain.gain.setValueAtTime(0, now)
            gain.gain.linearRampToValueAtTime(0.04 * intensity, now + 0.02)
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration * 2)

            oscillator.connect(gain)
            gain.connect(masterGainRef.current!)

            oscillator.start(now)
            oscillator.stop(now + duration * 2)
            break
          }
        }
      } catch (error) {
        console.warn("Audio playback failed:", error)
      }
    },
    [isMuted],
  )

  // Load available ambient music files
  const loadAvailableMusic = useCallback(async () => {
    const availableFiles: string[] = []
    
    // Try to get directory listing from Next.js API
    try {
      const response = await fetch('/api/audio-files')
      if (response.ok) {
        const files = await response.json()
        availableFiles.push(...files)
      }
    } catch (e) {
      console.log("API not available, using fallback detection")
      
      // Fallback: try common audio file names with different extensions
      const commonNames = [
        "ambient-1", "ambient-2", "ambient-3", "ambient", "background",
        "forest-ambient", "space-atmosphere", "underwater-calm", "mystical-drone",
        "track1", "track2", "track3", "music1", "music2", "music3",
        "calm", "peaceful", "meditative", "atmospheric", "drone"
      ]
      
      const extensions = ['.mp3', '.wav', '.ogg', '.m4a']
      
      // Check common names with different extensions
      for (const baseName of commonNames) {
        for (const ext of extensions) {
          const fileName = baseName + ext
          try {
            const response = await fetch(`/audio/ambient/${fileName}`, { method: 'HEAD' })
            if (response.ok) {
              availableFiles.push(fileName)
              break // Found this file, move to next base name
            }
          } catch (e) {
            // File doesn't exist, try next extension
          }
        }
      }
    }

    // Remove duplicates and sort
    const uniqueFiles = [...new Set(availableFiles)].sort()
    
    setAvailableMusic(uniqueFiles)
    if (uniqueFiles.length > 0) {
      setCurrentTrack(uniqueFiles[0])
      setCurrentTrackIndex(0)
    }
    
    console.log("Found audio files:", uniqueFiles)
  }, [])

  // Play ambient music file
  const playAmbientMusic = useCallback((trackName: string) => {
    if (!trackName) return

    try {
      // Stop current track if playing
      if (ambientAudioRef.current) {
        ambientAudioRef.current.pause()
        ambientAudioRef.current.removeEventListener('ended', () => {})
      }

      // Create new audio element
      const audio = new Audio(`/audio/ambient/${trackName}`)
      audio.volume = isMuted ? 0 : 0.15
      audio.loop = true
      
      audio.addEventListener('ended', () => {
        // Auto-advance to next track if not looping
        if (availableMusic.length > 1) {
          const nextIndex = (currentTrackIndex + 1) % availableMusic.length
          setCurrentTrackIndex(nextIndex)
          setCurrentTrack(availableMusic[nextIndex])
        }
      })

      ambientAudioRef.current = audio
      audio.play().catch(e => console.warn("Audio playback failed:", e))
      
      console.log(`Playing ambient track: ${trackName}`)
    } catch (error) {
      console.error("Failed to play ambient music:", error)
    }
  }, [isMuted, availableMusic, currentTrackIndex])

  // Stop ambient music
  const stopAmbientMusic = useCallback(() => {
    if (ambientAudioRef.current) {
      ambientAudioRef.current.pause()
      ambientAudioRef.current.currentTime = 0
      ambientAudioRef.current = null
    }
  }, [])

  // Next/Previous track functions
  const nextTrack = useCallback(() => {
    if (availableMusic.length === 0) return
    const nextIndex = (currentTrackIndex + 1) % availableMusic.length
    setCurrentTrackIndex(nextIndex)
    const nextTrackName = availableMusic[nextIndex]
    setCurrentTrack(nextTrackName)
    if (isMusicPlaying) {
      playAmbientMusic(nextTrackName)
    }
  }, [availableMusic, currentTrackIndex, isMusicPlaying, playAmbientMusic])

  const previousTrack = useCallback(() => {
    if (availableMusic.length === 0) return
    const prevIndex = currentTrackIndex === 0 ? availableMusic.length - 1 : currentTrackIndex - 1
    setCurrentTrackIndex(prevIndex)
    const prevTrackName = availableMusic[prevIndex]
    setCurrentTrack(prevTrackName)
    if (isMusicPlaying) {
      playAmbientMusic(prevTrackName)
    }
  }, [availableMusic, currentTrackIndex, isMusicPlaying, playAmbientMusic])

  const startBackgroundMusic = useCallback(async () => {
    try {
      await initAudio()
      setIsMusicPlaying(true)

      // Load available music and start playing
      await loadAvailableMusic()
      if (currentTrack || availableMusic.length > 0) {
        const trackToPlay = currentTrack || availableMusic[0]
        if (trackToPlay) {
          playAmbientMusic(trackToPlay)
        }
      }

      console.log("Background music started")
    } catch (error) {
      console.error("Failed to start music:", error)
    }
  }, [initAudio, loadAvailableMusic, currentTrack, availableMusic, playAmbientMusic])

  const stopBackgroundMusic = useCallback(() => {
    setIsMusicPlaying(false)
    stopAmbientMusic()
    console.log("Background music stopped")
  }, [stopAmbientMusic])

  const toggleBackgroundMusic = useCallback(async () => {
    if (isMusicPlaying) {
      stopBackgroundMusic()
    } else {
      await startBackgroundMusic()
    }
  }, [isMusicPlaying, startBackgroundMusic, stopBackgroundMusic])

  // Create particles based on effect type
  const createParticles = useCallback(
    (x: number, y: number, intensity = 1, effectType: EffectType) => {
      let particleCount

      if (effectType === "bubbles") {
        particleCount = Math.max(1, Math.floor(0.3 * intensity))
      } else if (effectType === "god") {
        particleCount = Math.max(1, Math.floor(0.5 * intensity))
      } else if (effectType === "lightning") {
        particleCount = Math.max(1, Math.floor(0.6 * intensity))
      } else if (effectType === "fireflies") {
        particleCount = Math.max(1, Math.floor(0.2 * intensity))
      } else {
        particleCount = Math.max(1, Math.floor(0.4 * intensity))
      }

      // Play sound effect
      playSound(effectType, Math.min(intensity, 1))

      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 1
        let speed, life, hue

        if (effectType === "bubbles") {
          speed = 0.3 + Math.random() * 0.8
          life = 80 + Math.random() * 100
          hue = 200 + Math.random() * 60
        } else if (effectType === "god") {
          speed = 0.5 + Math.random() * 1.5
          life = 50 + Math.random() * 70
          hue = 45 + Math.random() * 15
        } else if (effectType === "lightning") {
          speed = 2 + Math.random() * 4
          life = 8 + Math.random() * 12
          hue = 200 + Math.random() * 20
        } else if (effectType === "fireflies") {
          speed = 0.1 + Math.random() * 0.3
          life = 60 + Math.random() * 80
          hue = 110 + Math.random() * 15
        } else if (effectType === "ice") {
          speed = 0.5 + Math.random() * 2
          life = 25 + Math.random() * 35
          hue = 180 + Math.random() * 40
        } else {
          // Fire - enhanced for surfing effect
          speed = 1 + Math.random() * 3
          life = 25 + Math.random() * 35 // Slightly longer life for flowing effect
          hue = 45 + Math.random() * 15
        }

        particlesRef.current.push({
          x:
            x +
            (Math.random() - 0.5) *
              (effectType === "bubbles" ? 25 : effectType === "god" ? 20 : effectType === "lightning" ? 8 : 15),
          y:
            y +
            (Math.random() - 0.5) *
              (effectType === "bubbles" ? 25 : effectType === "god" ? 20 : effectType === "lightning" ? 8 : 15),
          vx:
            effectType === "bubbles"
              ? (Math.random() - 0.5) * 0.4
              : effectType === "god"
                ? Math.cos(angle) * speed * 0.3
                : effectType === "lightning"
                  ? (Math.random() - 0.5) * 6
                  : effectType === "fire"
                    ? (Math.random() - 0.5) * 0.4 + cursorDirection.x * cursorSpeed * 0.5
                    : (Math.random() - 0.5) * 0.4,
          vy:
            effectType === "bubbles"
              ? -0.5 - Math.random() * 0.8
              : effectType === "god"
                ? Math.sin(angle) * speed * 0.3 - 0.2
                : effectType === "lightning"
                  ? (Math.random() - 0.5) * 6
                  : effectType === "fire"
                    ? (Math.random() - 0.5) * 0.4 + cursorDirection.y * cursorSpeed * 0.5
                    : (Math.random() - 0.5) * 0.4,
          life: life,
          maxLife: life,
          size:
            effectType === "bubbles"
              ? 2 + Math.random() * 4
              : effectType === "god"
                ? 1.5 + Math.random() * 3
                : effectType === "lightning"
                  ? 0.5 + Math.random() * 1.5
                  : effectType === "fireflies"
                    ? 0.3 + Math.random() * 1.5
                    : effectType === "ice"
                      ? 1.5 + Math.random() * 2.5
                      : 1 + Math.random() * 3,
          hue: hue,
          type: effectType,
          pulse: effectType === "fireflies" ? Math.random() * Math.PI * 2 : undefined,
          zigzagTimer: effectType === "lightning" ? 0 : undefined,
          spiralAngle: effectType === "god" ? Math.random() * Math.PI * 2 : undefined,
          bubbleFloat: effectType === "bubbles" ? Math.random() * Math.PI * 2 : undefined,
        })
      }
    },
    [playSound, cursorDirection, cursorSpeed],
  )

  // Get drag properties for each effect
  const getDragProperties = useCallback((effectType: EffectType) => {
    switch (effectType) {
      case "fire":
        return {
          smoothing: 0.8,
          resistance: 0.3,
          jitter: 0,
          momentum: 0.9,
          friction: 0.94,
          description: "Surfing fire flow",
        }
      case "ice":
        return {
          smoothing: 0.85,
          resistance: 0.2,
          jitter: 0,
          momentum: 0.9,
          friction: 0.88,
          description: "Extremely heavy rolling ice",
        }
      case "lightning":
        return {
          smoothing: 0.7,
          resistance: 0.4,
          jitter: 15,
          momentum: 0.8,
          friction: 0.85,
          description: "Chaotic rolling electricity",
        }
      case "god":
        return {
          smoothing: 0.7,
          resistance: 0.4,
          jitter: 0,
          momentum: 0.88,
          friction: 0.9,
          description: "Divine rolling energy",
        }
      case "bubbles":
        return {
          smoothing: 0.7,
          resistance: 0.4,
          jitter: 1,
          momentum: 0.82,
          friction: 0.94,
          description: "Buoyant rolling bubbles",
        }
      case "fireflies":
        return {
          smoothing: 0.7,
          resistance: 0.4,
          jitter: 0.5,
          momentum: 0.86,
          friction: 0.93,
          description: "Gentle rolling dust",
        }
      default:
        return {
          smoothing: 0.1,
          resistance: 1.0,
          jitter: 0,
          momentum: 0.8,
          friction: 0.9,
          description: "Default",
        }
    }
  }, [])

  // Load available music files on component mount
  useEffect(() => {
    loadAvailableMusic()
  }, [loadAvailableMusic])

  // Initialize background stars
  useEffect(() => {
    const handleResize = () => {
      const backgroundCanvas = backgroundCanvasRef.current
      if (!backgroundCanvas) return

      backgroundCanvas.width = width
      backgroundCanvas.height = height

      if (width > 0 && height > 0) {
        const stars = []
        const farStars = []
        const starColors = ["#60A5FA", "#34D399", "#FBBF24", "#F87171", "#A78BFA", "#FFFFFF", "#FF6B6B", "#4ECDC4"]

        for (let i = 0; i < 150; i++) {
          const baseOpacity = Math.random() * 0.3 + 0.1
          stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2 + 0.3,
            speed: Math.random() * 0.5 + 0.1,
            opacity: baseOpacity,
            baseOpacity: baseOpacity,
            color: starColors[Math.floor(Math.random() * starColors.length)],
          })
        }

        for (let i = 0; i < 100; i++) {
          const baseOpacity = Math.random() * 0.15 + 0.05
          farStars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 1.5 + 0.2,
            speedX: (Math.random() - 0.5) * 0.02,
            speedY: (Math.random() - 0.5) * 0.02,
            opacity: baseOpacity,
            baseOpacity: baseOpacity,
            color: starColors[Math.floor(Math.random() * starColors.length)],
            directionChangeTimer: Math.random() * 10000 + 10000,
          })
        }

        starsRef.current = stars
        farStarsRef.current = farStars
        setCanvasReady(true)
      }
    }

    handleResize()
  }, [width, height])

  // Animate background stars
  useEffect(() => {
    if (!canvasReady) return
    const canvas = backgroundCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const animateBackground = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      farStarsRef.current.forEach((star) => {
        ctx.save()
        ctx.globalAlpha = star.baseOpacity + 0.1
        ctx.fillStyle = star.color
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = star.size * 1.5
        ctx.shadowColor = star.color
        ctx.fill()
        ctx.restore()

        star.x += star.speedX
        star.y += star.speedY

        if (star.x < -10) star.x = canvas.width + 10
        if (star.x > canvas.width + 10) star.x = -10
        if (star.y < -10) star.y = canvas.height + 10
        if (star.y > canvas.height + 10) star.y = -10

        star.directionChangeTimer--
        if (star.directionChangeTimer <= 0) {
          star.speedX += (Math.random() - 0.5) * 0.005
          star.speedY += (Math.random() - 0.5) * 0.005
          star.speedX = Math.max(-0.03, Math.min(0.03, star.speedX))
          star.speedY = Math.max(-0.03, Math.min(0.03, star.speedY))
          star.directionChangeTimer = Math.random() * 20000 + 10000
        }
      })

      starsRef.current.forEach((star) => {
        ctx.save()
        ctx.globalAlpha = star.baseOpacity + 0.2
        ctx.fillStyle = star.color
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = star.size * 2
        ctx.shadowColor = star.color
        ctx.fill()
        ctx.restore()

        star.x -= star.speed
        if (star.x < -10) {
          star.x = canvas.width + 10
          star.y = Math.random() * canvas.height
        }
      })

      backgroundAnimationRef.current = requestAnimationFrame(animateBackground)
    }

    animateBackground()

    return () => {
      if (backgroundAnimationRef.current) {
        cancelAnimationFrame(backgroundAnimationRef.current)
      }
    }
  }, [canvasReady])

  // Animation loop for particles - FIXED to prevent trails
  const animate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // COMPLETELY CLEAR the canvas each frame - no more trails!
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set blend mode for particles
    ctx.globalCompositeOperation = "lighter"

    // Update and draw particles
    particlesRef.current = particlesRef.current.filter((particle) => {
      // Update particle based on type
      particle.x += particle.vx
      particle.y += particle.vy

      if (particle.type === "bubbles") {
        if (particle.bubbleFloat !== undefined) {
          particle.bubbleFloat += 0.03
          particle.vx += Math.sin(particle.bubbleFloat) * 0.01
        }
        particle.vy -= 0.005
        particle.vx *= 0.998
        particle.vy *= 0.998
      } else if (particle.type === "god") {
        if (particle.spiralAngle !== undefined) {
          particle.spiralAngle += 0.05
          particle.vx += Math.cos(particle.spiralAngle) * 0.02
          particle.vy += Math.sin(particle.spiralAngle) * 0.02
        }
        particle.vy -= 0.015
        particle.vx *= 0.99
        particle.vy *= 0.99
      } else if (particle.type === "lightning") {
        if (particle.zigzagTimer !== undefined) {
          particle.zigzagTimer++
          if (particle.zigzagTimer % 3 === 0) {
            particle.vx += (Math.random() - 0.5) * 8
            particle.vy += (Math.random() - 0.5) * 8
          }
        }
        particle.vx *= 0.92
        particle.vy *= 0.92
      } else if (particle.type === "fireflies") {
        particle.vx += (Math.random() - 0.5) * 0.008
        particle.vy += (Math.random() - 0.5) * 0.008
        particle.vx *= 0.995
        particle.vy *= 0.995
      } else if (particle.type === "ice") {
        particle.vy += (Math.random() - 0.5) * 0.02
        particle.vx *= 0.995
        particle.vy *= 0.995
      } else {
        // Fire particles - add surfing effect with constant forward momentum
        particle.vy += 0.05
        
        // Apply surfing momentum in cursor direction
        if (cursorSpeed > 0.1) {
          const surfingForce = cursorSpeed * 0.3
          particle.vx += cursorDirection.x * surfingForce
          particle.vy += cursorDirection.y * surfingForce
        }
        
        particle.vx *= 0.96 // Slightly less friction for smoother flow
        particle.vy *= 0.96
      }

      particle.life--

      if (particle.life <= 0) return false

      // Draw particle
      const alpha = particle.life / particle.maxLife
      const size = particle.size * alpha

      const gradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, size * 4)
      const hue = particle.hue

      if (particle.type === "bubbles") {
        gradient.addColorStop(0, `hsla(${hue}, 30%, 95%, ${alpha * 0.3})`)
        gradient.addColorStop(0.7, `hsla(${hue}, 50%, 85%, ${alpha * 0.5})`)
        gradient.addColorStop(0.9, `hsla(${hue + 30}, 70%, 75%, ${alpha * 0.7})`)
        gradient.addColorStop(1, `hsla(${hue + 60}, 80%, 65%, 0)`)
      } else if (particle.type === "god") {
        gradient.addColorStop(0, `hsla(${hue}, 80%, 95%, ${alpha})`)
        gradient.addColorStop(0.2, `hsla(${hue}, 70%, 85%, ${alpha * 0.9})`)
        gradient.addColorStop(0.5, `hsla(${hue + 10}, 60%, 75%, ${alpha * 0.7})`)
        gradient.addColorStop(0.8, `hsla(${hue + 20}, 50%, 65%, ${alpha * 0.4})`)
        gradient.addColorStop(1, `hsla(${hue + 30}, 40%, 55%, 0)`)
      } else if (particle.type === "lightning") {
        gradient.addColorStop(0, `hsla(${hue}, 60%, 95%, ${alpha})`)
        gradient.addColorStop(0.2, `hsla(${hue}, 70%, 85%, ${alpha * 0.9})`)
        gradient.addColorStop(0.6, `hsla(${hue + 10}, 80%, 75%, ${alpha * 0.5})`)
        gradient.addColorStop(1, `hsla(${hue + 20}, 90%, 65%, 0)`)
      } else if (particle.type === "fireflies") {
        gradient.addColorStop(0, `hsla(${hue}, 100%, 80%, ${alpha * 0.9})`)
        gradient.addColorStop(0.4, `hsla(${hue}, 90%, 70%, ${alpha * 0.8})`)
        gradient.addColorStop(0.8, `hsla(${hue + 5}, 80%, 60%, ${alpha * 0.4})`)
        gradient.addColorStop(1, `hsla(${hue + 10}, 70%, 50%, 0)`)
      } else if (particle.type === "ice") {
        gradient.addColorStop(0, `hsla(${hue}, 100%, 90%, ${alpha})`)
        gradient.addColorStop(0.3, `hsla(${hue}, 80%, 70%, ${alpha * 0.8})`)
        gradient.addColorStop(0.7, `hsla(${hue + 20}, 60%, 60%, ${alpha * 0.4})`)
        gradient.addColorStop(1, `hsla(${hue + 30}, 40%, 50%, 0)`)
      } else {
        gradient.addColorStop(0, `hsla(${hue}, 100%, 80%, ${alpha})`)
        gradient.addColorStop(0.4, `hsla(${hue}, 100%, 60%, ${alpha * 0.7})`)
        gradient.addColorStop(0.8, `hsla(${hue - 10}, 100%, 50%, ${alpha * 0.3})`)
        gradient.addColorStop(1, `hsla(${hue - 20}, 100%, 40%, 0)`)
      }

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(
        particle.x,
        particle.y,
        size *
          (particle.type === "bubbles"
            ? 4
            : particle.type === "god"
              ? 6
              : particle.type === "lightning"
                ? 5
                : particle.type === "fireflies"
                  ? 3
                  : 4),
        0,
        Math.PI * 2,
      )
      ctx.fill()

      return true
    })

    animationRef.current = requestAnimationFrame(animate)
  }, [cursorDirection, cursorSpeed])

  // Get coordinates from touch or mouse event
  const getEventPos = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()

    if ("touches" in e && e.touches.length > 0) {
      const touch = e.touches[0]
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      }
    } else if ("clientX" in e) {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }
    return { x: 0, y: 0 }
  }, [])

  // Start drawing
  const handleStart = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault()
      initAudio()
      setIsDrawing(true)

      const pos = getEventPos(e)
      setLastPos(pos)
      setSmoothedPos(pos)
      setVelocity({ x: 0, y: 0 })
      createParticles(pos.x, pos.y, 1.5, currentEffect)
    },
    [getEventPos, createParticles, currentEffect, initAudio],
  )

  // Continue drawing with rolling ball physics
  const handleMove = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault()
      if (!isDrawing) return

      const rawPos = getEventPos(e)
      const dragProps = getDragProperties(currentEffect)

      const targetX = rawPos.x * dragProps.resistance + smoothedPos.x * (1 - dragProps.resistance)
      const targetY = rawPos.y * dragProps.resistance + smoothedPos.y * (1 - dragProps.resistance)

      const accelX = (targetX - smoothedPos.x) * 0.1
      const accelY = (targetY - smoothedPos.y) * 0.1

      const newVelX = (velocity.x + accelX) * dragProps.momentum * dragProps.friction
      const newVelY = (velocity.y + accelY) * dragProps.momentum * dragProps.friction

      setVelocity({ x: newVelX, y: newVelY })

      const newX = smoothedPos.x + newVelX
      const newY = smoothedPos.y + newVelY

      const jitteredX = newX + (Math.random() - 0.5) * dragProps.jitter
      const jitteredY = newY + (Math.random() - 0.5) * dragProps.jitter

      const pos = { x: jitteredX, y: jitteredY }
      setSmoothedPos({ x: newX, y: newY })

      const dx = pos.x - lastPos.x
      const dy = pos.y - lastPos.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      // Track cursor direction and speed for fire surfing effect
      if (distance > 0) {
        const dirX = dx / distance
        const dirY = dy / distance
        const speed = Math.min(distance * 0.1, 3) // Cap speed for smooth effect
        
        setCursorDirection({ x: dirX, y: dirY })
        setCursorSpeed(speed)
      }

      if (distance > 2) {
        const steps = Math.max(1, Math.floor(distance / 2))
        for (let i = 0; i <= steps; i++) {
          const t = i / steps
          const x = lastPos.x + dx * t
          const y = lastPos.y + dy * t
          const intensity = Math.min(distance / 10, 2)
          createParticles(x, y, intensity, currentEffect)
        }

        setLastPos(pos)
      }
    },
    [isDrawing, lastPos, smoothedPos, velocity, getEventPos, createParticles, currentEffect, getDragProperties],
  )

  const handleEnd = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault()
    setIsDrawing(false)
    // Gradually reduce cursor influence for smooth ending
    setTimeout(() => {
      setCursorDirection({ x: 0, y: 0 })
      setCursorSpeed(0)
    }, 500)
  }, [])

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    particlesRef.current = []
  }, [])

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted)
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = isMuted ? 0.3 : 0
    }
    // Also update ambient music volume
    if (ambientAudioRef.current) {
      ambientAudioRef.current.volume = isMuted ? 0.15 : 0
    }
  }, [isMuted])

  // Initialize canvas and start animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const startAnimation = () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      animationRef.current = requestAnimationFrame(animate)
    }

    startAnimation()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      // Clean up ambient music
      if (ambientAudioRef.current) {
        ambientAudioRef.current.pause()
        ambientAudioRef.current = null
      }
    }
  }, [animate])

  const currentDragProps = getDragProperties(currentEffect)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden relative">
      {/* Animated background lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent animate-pulse"
          style={{ animationDuration: "40s" }}
        />
        <div
          className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-purple-500/20 to-transparent animate-pulse"
          style={{ animationDuration: "50s", animationDelay: "10s" }}
        />
        <div
          className="absolute left-0 top-1/3 w-full h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent animate-pulse"
          style={{ animationDuration: "45s", animationDelay: "5s" }}
        />
        <div
          className="absolute left-0 bottom-1/4 w-full h-px bg-gradient-to-r from-transparent via-pink-400/60 to-transparent animate-pulse"
          style={{ animationDuration: "55s", animationDelay: "15s" }}
        />
      </div>

      {/* Floating geometric elements */}
      <div
        className="absolute top-1/4 left-8 w-2 h-2 bg-cyan-400/60 rotate-45 animate-spin"
        style={{ animationDuration: "80s" }}
      />
      <div
        className="absolute top-1/2 right-12 w-3 h-3 border border-purple-400/60 rotate-45 animate-pulse"
        style={{ animationDuration: "40s" }}
      />
      <div
        className="absolute bottom-1/3 left-16 w-1 h-8 bg-gradient-to-t from-pink-400/40 to-transparent animate-pulse"
        style={{ animationDuration: "35s", animationDelay: "7s" }}
      />
      <div
        className="absolute bottom-1/4 right-20 w-8 h-1 bg-gradient-to-r from-blue-400/40 to-transparent animate-pulse"
        style={{ animationDuration: "38s", animationDelay: "12s" }}
      />

      <Card className="w-full max-w-4xl mx-auto relative z-10 bg-slate-900/30 backdrop-blur-sm border-slate-700/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            {currentEffect === "fire" ? (
              <Flame className="w-5 h-5 text-orange-500" />
            ) : currentEffect === "ice" ? (
              <Snowflake className="w-5 h-5 text-cyan-500" />
            ) : currentEffect === "lightning" ? (
              <Zap className="w-5 h-5 text-blue-400" />
            ) : currentEffect === "god" ? (
              <Crown className="w-5 h-5 text-yellow-500" />
            ) : currentEffect === "bubbles" ? (
              <Circle className="w-5 h-5 text-blue-300" />
            ) : (
              <div className="w-5 h-5 rounded-full bg-yellow-400 animate-pulse" />
            )}
            <CardTitle className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              {currentEffect === "fire"
                ? "Fire"
                : currentEffect === "ice"
                  ? "Ice"
                  : currentEffect === "lightning"
                    ? "Lightning"
                    : currentEffect === "god"
                      ? "God Particles"
                      : currentEffect === "bubbles"
                        ? "Bubbles"
                        : "Fireflies"}{" "}
              Drawing Effect
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleMute}
              className="flex items-center gap-2 bg-slate-800/50 border-cyan-500/30 text-cyan-400 hover:bg-slate-700/50"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              {isMuted ? "Unmute" : "Mute"}
            </Button>
            <div className="flex items-center gap-1">
              {availableMusic.length > 0 && isMusicPlaying && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={previousTrack}
                    className="bg-slate-800/50 border-cyan-500/30 text-cyan-400 hover:bg-slate-700/50 px-2"
                  >
                    <SkipBack className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextTrack}
                    className="bg-slate-800/50 border-cyan-500/30 text-cyan-400 hover:bg-slate-700/50 px-2"
                  >
                    <SkipForward className="w-3 h-3" />
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleBackgroundMusic}
                className="flex items-center gap-2 bg-slate-800/50 border-cyan-500/30 text-cyan-400 hover:bg-slate-700/50"
              >
                <Music className={`w-4 h-4 ${isMusicPlaying ? "animate-pulse" : ""}`} />
                {isMusicPlaying ? "Stop Music" : "Play Music"}
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearCanvas}
              className="flex items-center gap-2 bg-slate-800/50 border-cyan-500/30 text-cyan-400 hover:bg-slate-700/50"
            >
              <RotateCcw className="w-4 h-4" />
              Clear
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-2 flex-wrap">
            <Button
              variant={currentEffect === "fire" ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentEffect("fire")}
              className="flex items-center gap-2 bg-slate-800/50 border-slate-600/50 hover:bg-slate-700/50"
            >
              <Flame className="w-4 h-4" />
              Fire
            </Button>
            <Button
              variant={currentEffect === "ice" ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentEffect("ice")}
              className="flex items-center gap-2 bg-slate-800/50 border-slate-600/50 hover:bg-slate-700/50"
            >
              <Snowflake className="w-4 h-4" />
              Ice
            </Button>
            <Button
              variant={currentEffect === "fireflies" ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentEffect("fireflies")}
              className="flex items-center gap-2 bg-slate-800/50 border-slate-600/50 hover:bg-slate-700/50"
            >
              <div className="w-4 h-4 rounded-full bg-yellow-400" />
              Fireflies
            </Button>
            <Button
              variant={currentEffect === "lightning" ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentEffect("lightning")}
              className="flex items-center gap-2 bg-slate-800/50 border-slate-600/50 hover:bg-slate-700/50"
            >
              <Zap className="w-4 h-4" />
              Lightning
            </Button>
            <Button
              variant={currentEffect === "god" ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentEffect("god")}
              className="flex items-center gap-2 bg-slate-800/50 border-slate-600/50 hover:bg-slate-700/50"
            >
              <Crown className="w-4 h-4" />
              God Particles
            </Button>
            <Button
              variant={currentEffect === "bubbles" ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentEffect("bubbles")}
              className="flex items-center gap-2 bg-slate-800/50 border-slate-600/50 hover:bg-slate-700/50"
            >
              <Circle className="w-4 h-4" />
              Bubbles
            </Button>
          </div>

          <div className="relative w-full h-[600px] bg-slate-900/30 backdrop-blur-sm rounded-3xl border border-slate-700/50 overflow-hidden shadow-2xl">
            {/* Animated border glow */}
            <div className="absolute inset-0 rounded-3xl">
              <div
                className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-xl animate-pulse"
                style={{ animationDuration: "32s" }}
              />
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
              <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-400/60 to-transparent" />
              <div className="absolute left-0 top-0 w-px h-full bg-gradient-to-b from-transparent via-blue-400/60 to-transparent" />
              <div className="absolute right-0 top-0 w-px h-full bg-gradient-to-b from-transparent via-pink-400/60 to-transparent" />
            </div>

            {/* Corner accent lights */}
            <div
              className="absolute top-4 left-4 w-3 h-3 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50 animate-pulse"
              style={{ animationDuration: "38s" }}
            />
            <div
              className="absolute top-4 right-4 w-3 h-3 bg-purple-400 rounded-full shadow-lg shadow-purple-400/50 animate-pulse"
              style={{ animationDuration: "42s", animationDelay: "5s" }}
            />
            <div
              className="absolute bottom-4 left-4 w-3 h-3 bg-pink-400 rounded-full shadow-lg shadow-pink-400/50 animate-pulse"
              style={{ animationDuration: "36s", animationDelay: "10s" }}
            />
            <div
              className="absolute bottom-4 right-4 w-3 h-3 bg-blue-400 rounded-full shadow-lg shadow-blue-400/50 animate-pulse"
              style={{ animationDuration: "44s", animationDelay: "15s" }}
            />

            {/* Background Canvas with stars */}
            <canvas ref={backgroundCanvasRef} className="absolute inset-4 pointer-events-none" style={{ zIndex: 1 }} />

            {/* Drawing Canvas */}
            <canvas
              ref={canvasRef}
              width={width}
              height={height}
              className="absolute inset-4 cursor-crosshair touch-none"
              style={{ zIndex: 2 }}
              onMouseDown={handleStart}
              onMouseMove={handleMove}
              onMouseUp={handleEnd}
              onMouseLeave={handleEnd}
              onTouchStart={handleStart}
              onTouchMove={handleMove}
              onTouchEnd={handleEnd}
              onTouchCancel={handleEnd}
            />
          </div>

          <div className="mt-4 text-sm text-slate-300">
            <p>
              Draw on the canvas to create {currentEffect} effects with sound!
              {currentEffect === "fire"
                ? " 🔥"
                : currentEffect === "ice"
                  ? " ❄️"
                  : currentEffect === "lightning"
                    ? " ⚡"
                    : currentEffect === "god"
                      ? " 👑"
                      : currentEffect === "bubbles"
                        ? " 🫧"
                        : " ✨"}
            </p>
            <p className="mt-1">
              <strong>Desktop:</strong> Click and drag to draw
              <br />
              <strong>Mobile:</strong> Touch and drag to draw
            </p>
            <p className="mt-2 text-xs text-slate-400">
              <strong>Feel:</strong> {currentDragProps.description} | <strong>Sound:</strong>{" "}
              {isMuted ? "Muted" : "Enabled"} | <strong>Music:</strong> {isMusicPlaying ? "Playing" : "Stopped"}
              {isMusicPlaying && currentTrack && (
                <>
                  {" "} | <strong>Track:</strong> {currentTrack.replace(/\.(mp3|wav|ogg)$/i, '').replace(/[-_]/g, ' ')}
                </>
              )}
            </p>
            {isDrawing && (
              <p
                className={`mt-2 font-medium ${
                  currentEffect === "fire"
                    ? "text-orange-400"
                    : currentEffect === "ice"
                      ? "text-cyan-400"
                      : currentEffect === "lightning"
                        ? "text-blue-400"
                        : currentEffect === "god"
                          ? "text-yellow-400"
                          : currentEffect === "bubbles"
                            ? "text-blue-300"
                            : "text-yellow-400"
                }`}
              >
                {currentEffect === "fire"
                  ? "🔥 Drawing fire..."
                  : currentEffect === "ice"
                    ? "❄️ Drawing ice..."
                    : currentEffect === "lightning"
                      ? "⚡ Drawing lightning..."
                      : currentEffect === "god"
                        ? "👑 Drawing god particles..."
                        : currentEffect === "bubbles"
                          ? "🫧 Drawing bubbles..."
                          : "✨ Drawing fireflies..."}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
