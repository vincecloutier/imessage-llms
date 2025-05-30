"use client"

import { useEffect, useRef } from "react"

export function VideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.error("Autoplay failed:", error)
      })
    }
  }, [])

  return (
    <div className="relative w-full max-w-xl rounded-lg overflow-hidden shadow-xl border bg-card">
      <div className="absolute top-0 left-0 right-0 h-8 bg-muted flex items-center px-3 gap-1.5">
        <div className="w-3 h-3 rounded-full bg-primary" />
        <div className="w-3 h-3 rounded-full bg-yellow-500" />
        <div className="w-3 h-3 rounded-full bg-green-500" />
        <div className="ml-2 text-xs text-muted-foreground">Nexus AI Demo</div>
      </div>
      <div className="pt-8">
        <video
          ref={videoRef}
          className="w-full aspect-video object-cover"
          loop
          muted
          playsInline
          poster="/placeholder.svg?height=720&width=1280"
        >
          <source
            src="https://storage.googleapis.com/web-dev-assets/video-and-source-tags/chrome.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
      </div>
      <div className="p-4 bg-card border-t">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <span className="text-sm font-medium">N</span>
          </div>
          <div className="flex-1">
            <p className="text-sm">
              I can help you optimize your code for better performance. Here's an example of how to improve your current
              implementation.
            </p>
            <pre className="mt-2 rounded-md bg-muted p-2 text-xs overflow-x-auto">
              <code>{`function optimizeData(data) {
  return data.filter(item => item.value > 0)
    .map(item => ({
      ...item,
      score: item.value * 2
    }));
}`}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
