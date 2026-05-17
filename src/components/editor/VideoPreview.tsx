import { useRef, useEffect, useCallback } from "react";
import { useEditorStore, type FilterName } from "@/store/editorStore";

const FILTER_CSS: Record<FilterName, string> = {
  none: "none",
  cinematic: "contrast(1.15) saturate(1.2) brightness(0.95)",
  vintage: "sepia(0.4) contrast(0.9) saturate(0.8) brightness(1.05)",
  neon: "saturate(2) contrast(1.3) hue-rotate(15deg)",
  noir: "grayscale(1) contrast(1.4) brightness(0.8)",
  cyber: "hue-rotate(180deg) saturate(2.5) contrast(1.2)",
  warm: "sepia(0.3) saturate(1.4) contrast(1.05) brightness(1.02)",
};

const FILTER_INTENSITY_MAP: Record<FilterName, number> = {
  none: 0,
  cinematic: 0.7,
  vintage: 0.8,
  neon: 1,
  noir: 0.9,
  cyber: 1,
  warm: 0.6,
};

export function VideoPreview() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  const {
    videoSrc,
    isPlaying,
    currentTime,
    trimStart,
    trimEnd,
    isLooping,
    activeFilter,
    filterIntensity,
    caption,
    showCaption,
    captionPosition,
    captionColor,
    captionSize,
    setIsPlaying,
    setVideoDuration,
  } = useEditorStore();

  // Sync video time
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (Math.abs(video.currentTime - currentTime) > 0.05) {
      video.currentTime = currentTime;
    }
  }, [currentTime]);

  // Play/pause
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isPlaying]);

  // Handle video loaded
  const handleLoaded = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    setVideoDuration(video.duration);
    useEditorStore.getState().setTrimEnd(video.duration);
  }, [setVideoDuration]);

  // Handle time update
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const t = video.currentTime;
    useEditorStore.setState({ currentTime: t });

    // Loop within trim
    if (isLooping && trimEnd > 0 && t >= trimEnd - 0.05) {
      video.currentTime = trimStart;
    }
    if (t < trimStart) {
      video.currentTime = trimStart;
    }
  }, [isLooping, trimEnd, trimStart]);

  // Handle video end
  const handleEnded = useCallback(() => {
    if (isLooping) {
      const video = videoRef.current;
      if (video) video.currentTime = trimStart;
    } else {
      setIsPlaying(false);
    }
  }, [isLooping, trimStart, setIsPlaying]);

  // Canvas frame rendering for filters
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !videoSrc) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      if (video.readyState >= 2) {
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const filter = FILTER_CSS[activeFilter];
        if (filter && activeFilter !== "none") {
          ctx.filter = filter;
        } else {
          ctx.filter = "none";
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.filter = "none";
      }
      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [videoSrc, activeFilter]);

  const getCaptionPositionClass = () => {
    switch (captionPosition) {
      case "top":
        return "top-8";
      case "middle":
        return "top-1/2 -translate-y-1/2";
      case "bottom":
        return "bottom-8";
    }
  };

  if (!videoSrc) {
    return (
      <div className="flex-1 flex items-center justify-center checkerboard rounded-lg border border-[#2a2a31]">
        <div className="text-center">
          <p className="text-[#55555e] text-sm font-mono-data mb-2">
            Drop a video or click "Use Sample"
          </p>
          <p className="text-[#3d3d45] text-xs">MP4, MOV, WebM supported</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 relative rounded-lg border border-[#2a2a31] overflow-hidden bg-black"
    >
      <video
        ref={videoRef}
        src={videoSrc}
        className="absolute inset-0 w-full h-full object-contain"
        crossOrigin="anonymous"
        playsInline
        onLoadedMetadata={handleLoaded}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />

      {/* Filter overlay via CSS filter on video element */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          backdropFilter:
            activeFilter !== "none"
              ? `blur(0px) ${FILTER_CSS[activeFilter].replace(/none/g, "")}`
              : undefined,
          mixBlendMode: activeFilter === "neon" ? "screen" : activeFilter === "noir" ? "multiply" : undefined,
          opacity: activeFilter === "none" ? 0 : filterIntensity * (FILTER_INTENSITY_MAP[activeFilter] || 1),
        }}
      />

      {/* Scanlines overlay */}
      <div className="scanlines absolute inset-0 z-[2]" />

      {/* Caption overlay */}
      {showCaption && caption && (
        <div
          className={`absolute left-0 right-0 z-[3] px-8 text-center ${getCaptionPositionClass()}`}
        >
          <p
            className="font-semibold drop-shadow-lg"
            style={{
              color: captionColor,
              fontSize: `${captionSize}px`,
              textShadow: `2px 2px 4px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.7)`,
              lineHeight: 1.3,
            }}
          >
            {caption}
          </p>
        </div>
      )}
    </div>
  );
}
