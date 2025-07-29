"use client"

import type React from "react"
import { useRef, useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Flame, RotateCcw } from "lucide-react"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  hue: number
}

interface FireDrawingCanvasProps {
  width?: number
  height?: number
}

export default function FireDrawingCanvas({ width = 800, height = 600 }: FireDrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const particlesRef = useRef<Particle[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 })

  // Create fire particles
  const createFireParticles = useCallback((x: number, y: number, intensity = 1) => {
    const particleCount = Math.floor(2 * intensity)

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 1
      const speed = 1 + Math.random() * 3
      const life = 20 + Math.random() * 30

      particlesRef.current.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 1,
        vy: Math.sin(angle) * speed - Math.random() * 2,
        life: life,
        maxLife: life,
        size: 1 + Math.random() * 3,
        hue: 45 + Math.random() * 15,
      })
    }
  }, [])

  // Animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Fade the canvas slightly for trail effect
    ctx.globalCompositeOperation = "destination-out"
    ctx.fillStyle = "rgba(0, 0, 0, 0.03)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.globalCompositeOperation = "lighter"

    // Update and draw particles
    particlesRef.current = particlesRef.current.filter((particle) => {
      // Update particle
      particle.x += particle.vx
      particle.y += particle.vy
      particle.vy += 0.05 // Slight upward drift
      particle.vx *= 0.98 // Air resistance
      particle.vy *= 0.98
      particle.life--

      if (particle.life <= 0) return false

      // Draw particle
      const alpha = particle.life / particle.maxLife
      const size = particle.size * alpha

      // Create gradient for glow effect
      const gradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, size * 4)

      const hue = particle.hue
      gradient.addColorStop(0, `hsla(${hue}, 100%, 80%, ${alpha})`)
      gradient.addColorStop(0.4, `hsla(${hue}, 100%, 60%, ${alpha * 0.7})`)
      gradient.addColorStop(0.8, `hsla(${hue - 10}, 100%, 50%, ${alpha * 0.3})`)
      gradient.addColorStop(1, `hsla(${hue - 20}, 100%, 40%, 0)`)

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, size * 4, 0, Math.PI * 2)
      ctx.fill()

      return true
    })

    animationRef.current = requestAnimationFrame(animate)
  }, [])

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
      setIsDrawing(true)

      const pos = getEventPos(e)
      setLastPos(pos)
      createFireParticles(pos.x, pos.y, 1.5)
    },
    [getEventPos, createFireParticles],
  )

  // Continue drawing
  const handleMove = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault()
      if (!isDrawing) return

      const pos = getEventPos(e)

      // Calculate distance for intensity
      const dx = pos.x - lastPos.x
      const dy = pos.y - lastPos.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance > 3) {
        // Create particles along the path
        const steps = Math.max(1, Math.floor(distance / 3))
        for (let i = 0; i <= steps; i++) {
          const t = i / steps
          const x = lastPos.x + dx * t
          const y = lastPos.y + dy * t
          const intensity = Math.min(distance / 15, 2)
          createFireParticles(x, y, intensity)
        }

        setLastPos(pos)
      }
    },
    [isDrawing, lastPos, getEventPos, createFireParticles],
  )

  // Stop drawing
  const handleEnd = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault()
    setIsDrawing(false)
  }, [])

  // Clear canvas
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = "#000"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    particlesRef.current = []
  }, [])

  // Initialize canvas and start animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas background
    ctx.fillStyle = "#000"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Start animation loop
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
    }
  }, [animate])

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          <CardTitle>Fire Drawing Effect</CardTitle>
        </div>
        <Button variant="outline" size="sm" onClick={clearCanvas} className="flex items-center gap-2 bg-transparent">
          <RotateCcw className="w-4 h-4" />
          Clear
        </Button>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="border border-gray-300 rounded-lg cursor-crosshair touch-none w-full"
            style={{
              maxWidth: "100%",
              height: "auto",
              backgroundColor: "#000",
            }}
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
            onTouchCancel={handleEnd}
          />
          <div className="mt-4 text-sm text-gray-600">
            <p>Draw on the black canvas to create fire effects!</p>
            <p className="mt-1">
              <strong>Desktop:</strong> Click and drag to draw
              <br />
              <strong>Mobile:</strong> Touch and drag to draw
            </p>
            {isDrawing && <p className="mt-2 text-orange-500 font-medium">🔥 Drawing fire...</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
