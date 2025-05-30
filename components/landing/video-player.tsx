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
    <div className="fixed inset-0 w-screen h-screen z-[-1]">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          loop
          muted
          playsInline
          poster="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
        >
          <source
            src="https://storage.googleapis.com/web-dev-assets/video-and-source-tags/chrome.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
    </div>
  )
}
