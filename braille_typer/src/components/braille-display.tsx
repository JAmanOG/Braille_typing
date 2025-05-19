"use client"

import { useRef, useEffect, useState } from "react"

interface BrailleDisplayProps {
  text: string
}

export function BrailleDisplay({ text }: BrailleDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 120 })

  // Track container size changes
  useEffect(() => {
    if (!containerRef.current) return
    
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        setDimensions(prev => ({ ...prev, width: entry.contentRect.width }))
      }
    })
    
    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  // Handle window resize events
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions(prev => ({ ...prev, width: containerRef.current?.offsetWidth || 0 }))
      }
    }
    
    window.addEventListener('resize', handleResize)
    handleResize()
    
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Draw Braille patterns on canvas
  useEffect(() => {
    if (!canvasRef.current || dimensions.width === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = dimensions.width
    canvas.height = dimensions.height

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set colors
    const emptyDotColor = "#e5e7eb"
    const textColor = "#1f2937"

    // Responsive sizing based on container width
    const baseSize = Math.min(Math.max(dimensions.width / 60, 4), 7)
    const dotSize = baseSize * 0.75
    const cellWidth = baseSize * 4
    const cellHeight = baseSize * 6.5
    const cellSpacing = baseSize * 5
    const wordSpacing = baseSize * 8
    const lineHeight = cellHeight + baseSize * 5

    let x = baseSize * 3
    let y = baseSize * 5
    let maxY = y

    ctx.font = `${baseSize * 2}px monospace`
    ctx.fillStyle = textColor

    // Draw Braille patterns
    const words = text.split(" ")

    words.forEach((word) => {
      if (!word) return

      // Check if we need to wrap to next line
      if (x + word.length * cellSpacing > canvas.width - baseSize * 3) {
        x = baseSize * 3
        y += lineHeight
      }

      // Keep track of maximum y position
      maxY = Math.max(maxY, y + cellHeight)

      // Draw word label
      ctx.fillText(word, x, y - baseSize * 2.5)

      // Draw each character
      Array.from(word).forEach((char, charIndex) => {
        const pattern = getBraillePattern(char.toLowerCase())

        // Draw cell background with subtle shadow
        ctx.fillStyle = "#f9fafb"
        ctx.shadowColor = "rgba(0,0,0,0.05)"
        ctx.shadowBlur = 2
        ctx.shadowOffsetY = 1
        ctx.fillRect(
          x + charIndex * cellSpacing - baseSize * 0.7, 
          y - baseSize * 1.7, 
          cellWidth, 
          cellHeight
        )
        ctx.shadowColor = "transparent"
        
        ctx.strokeStyle = "#d1d5db"
        ctx.lineWidth = 1
        ctx.strokeRect(
          x + charIndex * cellSpacing - baseSize * 0.7, 
          y - baseSize * 1.7, 
          cellWidth, 
          cellHeight
        )

        // Draw dots
        for (let row = 0; row < 3; row++) {
          for (let col = 0; col < 2; col++) {
            const dotIndex = row * 2 + col
            const isDotActive = pattern[dotIndex] === 1

            ctx.beginPath()
            ctx.arc(
              x + charIndex * cellSpacing + col * baseSize * 2, 
              y + row * baseSize * 2, 
              dotSize, 
              0, 
              Math.PI * 2
            )
            
            // Add gradient for active dots
            if (isDotActive) {
              const gradient = ctx.createRadialGradient(
                x + charIndex * cellSpacing + col * baseSize * 2 - 1, 
                y + row * baseSize * 2 - 1,
                0,
                x + charIndex * cellSpacing + col * baseSize * 2,
                y + row * baseSize * 2,
                dotSize
              )
              gradient.addColorStop(0, "#60a5fa")
              gradient.addColorStop(1, "#2563eb")
              ctx.fillStyle = gradient
            } else {
              ctx.fillStyle = emptyDotColor
            }
            
            ctx.fill()
            ctx.strokeStyle = isDotActive ? "#2563eb" : "#d1d5db"
            ctx.stroke()
          }
        }
      })

      x += word.length * cellSpacing + wordSpacing
    })

    // Update canvas height based on content
    if (maxY + baseSize * 4 > dimensions.height) {
      setDimensions(prev => ({ ...prev, height: maxY + baseSize * 4 }))
    }
  }, [text, dimensions.width,dimensions.height])

  return (
    <div className="border rounded-md p-3 bg-gray-50">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">Braille Visualization</h3>
        <span className="text-xs text-gray-500">{text.split(" ").filter(Boolean).length} words</span>
      </div>
      <div 
        ref={containerRef} 
        className="overflow-auto max-h-[40vh]"
        aria-label="Braille visualization container"
      >
        <canvas 
          ref={canvasRef} 
          className="w-full rounded-md" 
          height={dimensions.height}
          aria-label="Braille visualization of text"
        />
      </div>
    </div>
  )
}

// Helper function to get Braille pattern for a character
function getBraillePattern(char: string): number[] {
  const patterns: Record<string, number[]> = {
    a: [1, 0, 0, 0, 0, 0],
    b: [1, 0, 1, 0, 0, 0],
    c: [1, 1, 0, 0, 0, 0],
    d: [1, 1, 0, 1, 0, 0],
    e: [1, 0, 0, 1, 0, 0],
    f: [1, 1, 1, 0, 0, 0],
    g: [1, 1, 1, 1, 0, 0],
    h: [1, 0, 1, 1, 0, 0],
    i: [0, 1, 1, 0, 0, 0],
    j: [0, 1, 1, 1, 0, 0],
    k: [1, 0, 0, 0, 1, 0],
    l: [1, 0, 1, 0, 1, 0],
    m: [1, 1, 0, 0, 1, 0],
    n: [1, 1, 0, 1, 1, 0],
    o: [1, 0, 0, 1, 1, 0],
    p: [1, 1, 1, 0, 1, 0],
    q: [1, 1, 1, 1, 1, 0],
    r: [1, 0, 1, 1, 1, 0],
    s: [0, 1, 1, 0, 1, 0],
    t: [0, 1, 1, 1, 1, 0],
    u: [1, 0, 0, 0, 1, 1],
    v: [1, 0, 1, 0, 1, 1],
    w: [0, 1, 1, 1, 0, 1],
    x: [1, 1, 0, 0, 1, 1],
    y: [1, 1, 0, 1, 1, 1],
    z: [1, 0, 0, 1, 1, 1],
    " ": [0, 0, 0, 0, 0, 0],
    "1": [1, 0, 0, 0, 0, 0],
    "2": [1, 0, 1, 0, 0, 0],
    "3": [1, 1, 0, 0, 0, 0],
    "4": [1, 1, 0, 1, 0, 0],
    "5": [1, 0, 0, 1, 0, 0],
    "6": [1, 1, 1, 0, 0, 0],
    "7": [1, 1, 1, 1, 0, 0],
    "8": [1, 0, 1, 1, 0, 0],
    "9": [0, 1, 1, 0, 0, 0],
    "0": [0, 1, 1, 1, 0, 0],
  }

  return patterns[char] || [0, 0, 0, 0, 0, 0]
}
