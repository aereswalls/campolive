'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize, Download, SkipBack, SkipForward } from 'lucide-react'

interface VideoPlayerProps {
  videoUrl: string
  thumbnailUrl?: string
  title?: string
  autoPlay?: boolean
  onEnded?: () => void
}

export default function VideoPlayer({ 
  videoUrl, 
  thumbnailUrl, 
  title,
  autoPlay = false,
  onEnded 
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    
    const updateProgress = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100)
        setCurrentTime(video.currentTime)
      }
    }
    
    const handleLoadedMetadata = () => {
      setDuration(video.duration)
      setIsLoading(false)
    }
    
    video.addEventListener('timeupdate', updateProgress)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('ended', () => {
      setIsPlaying(false)
      onEnded?.()
    })
    
    return () => {
      video.removeEventListener('timeupdate', updateProgress)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
    }
  }, [onEnded])
  
  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return
    
    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
    setIsPlaying(!isPlaying)
  }
  
  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return
    
    video.muted = !isMuted
    setIsMuted(!isMuted)
  }
  
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return
    
    const newTime = (parseFloat(e.target.value) / 100) * duration
    video.currentTime = newTime
    setProgress(parseFloat(e.target.value))
  }
  
  const skip = (seconds: number) => {
    const video = videoRef.current
    if (!video) return
    
    video.currentTime = Math.max(0, Math.min(video.currentTime + seconds, duration))
  }
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  const downloadVideo = () => {
    const a = document.createElement('a')
    a.href = videoUrl
    a.download = title || 'video.mp4'
    a.click()
  }
  
  return (
    <div 
      ref={containerRef}
      className="relative bg-black rounded-lg overflow-hidden group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        poster={thumbnailUrl}
        className="w-full h-full"
        autoPlay={autoPlay}
        playsInline
        onClick={togglePlay}
      />
      
      {/* Loading spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {/* Play button overlay */}
      {!isPlaying && !isLoading && (
        <div 
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          onClick={togglePlay}
        >
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
            <Play className="w-12 h-12 text-white fill-white" />
          </div>
        </div>
      )}
      
      {/* Controls */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {/* Progress bar */}
        <div className="mb-3">
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleSeek}
            className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
          />
        </div>
        
        {/* Control buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={togglePlay}
              className="text-white hover:scale-110 transition"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 fill-white" />
              )}
            </button>
            
            <button
              onClick={() => skip(-10)}
              className="text-white hover:scale-110 transition"
            >
              <SkipBack className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => skip(10)}
              className="text-white hover:scale-110 transition"
            >
              <SkipForward className="w-5 h-5" />
            </button>
            
            <button
              onClick={toggleMute}
              className="text-white hover:scale-110 transition"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            
            <span className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={downloadVideo}
              className="text-white hover:scale-110 transition"
            >
              <Download className="w-5 h-5" />
            </button>
            
            <button
              onClick={toggleFullscreen}
              className="text-white hover:scale-110 transition"
            >
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
