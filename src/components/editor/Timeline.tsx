import { useRef, useCallback, useEffect, useState } from "react";
import { useEditorStore } from "@/store/editorStore";
import {
  SkipBack,
  SkipForward,
  Play,
  Pause,
  Repeat,
  Gauge,
} from "lucide-react";

function formatTime(seconds: number): string {
  if (!isFinite(seconds)) return "00:00:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  if (h > 0) {
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${ms.toString().padStart(3, "0")}`;
  }
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${ms.toString().padStart(3, "0")}`;
}

// Generate fake waveform data
function generateWaveform(length: number, seed: number): number[] {
  const data: number[] = [];
  let val = seed;
  for (let i = 0; i < length; i++) {
    val = Math.sin(i * 0.1 + seed) * Math.cos(i * 0.03 + seed * 2) * 0.5 + 0.5;
    data.push(val * 0.7 + Math.random() * 0.3);
  }
  return data;
}

export function Timeline() {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [waveform] = useState(() => generateWaveform(200, 42));
  const [dragging, setDragging] = useState<"playhead" | "trimStart" | "trimEnd" | null>(null);

  const {
    videoDuration,
    currentTime,
    trimStart,
    trimEnd,
    isPlaying,
    isLooping,
    playbackRate,
    setCurrentTime,
    setTrimStart,
    setTrimEnd,
    setIsLooping,
    setPlaybackRate,
    togglePlay,
    goToStart,
    goToEnd,
  } = useEditorStore();

  const duration = videoDuration || 5;

  const pxToTime = useCallback(
    (px: number, width: number) => Math.max(0, Math.min(duration, (px / width) * duration)),
    [duration]
  );

  // Mouse drag handlers
  useEffect(() => {
    if (!dragging) return;

    const handleMove = (e: MouseEvent) => {
      const timeline = timelineRef.current;
      if (!timeline) return;
      const rect = timeline.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const clampedX = Math.max(0, Math.min(rect.width, x));
      const time = pxToTime(clampedX, rect.width);

      if (dragging === "playhead") {
        setCurrentTime(time);
      } else if (dragging === "trimStart") {
        setTrimStart(Math.min(time, trimEnd - 0.1));
      } else if (dragging === "trimEnd") {
        setTrimEnd(Math.max(time, trimStart + 0.1));
      }
    };

    const handleUp = () => setDragging(null);

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [dragging, pxToTime, setCurrentTime, setTrimStart, setTrimEnd, trimEnd, trimStart]);

  const handleTimelineClick = useCallback(
    (e: React.MouseEvent) => {
      if (dragging) return;
      const timeline = timelineRef.current;
      if (!timeline) return;
      const rect = timeline.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const time = pxToTime(x, rect.width);
      setCurrentTime(time);
    },
    [dragging, pxToTime, setCurrentTime]
  );

  // Auto-generate thumbnails for timeline
  const thumbnails = Array.from({ length: 10 }, (_, i) => i);

  return (
    <div className="h-full flex flex-col bg-[#1a1a1f] border-t border-[#2a2a31]">
      {/* Timeline Toolbar */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[#2a2a31]">
        <button
          onClick={goToStart}
          className="p-1 rounded hover:bg-[#222228] text-[#8f8f96] hover:text-[#e0e0e0] transition-colors"
          title="Go to start"
        >
          <SkipBack size={14} />
        </button>
        <button
          onClick={togglePlay}
          className="p-1.5 rounded hover:bg-[#222228] text-[#00e676] transition-colors"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <button
          onClick={goToEnd}
          className="p-1 rounded hover:bg-[#222228] text-[#8f8f96] hover:text-[#e0e0e0] transition-colors"
          title="Go to end"
        >
          <SkipForward size={14} />
        </button>
        <div className="w-px h-4 bg-[#2a2a31] mx-1" />
        <button
          onClick={() => setIsLooping(!isLooping)}
          className={`p-1 rounded transition-colors ${
            isLooping ? "text-[#00e676] bg-[rgba(0,230,118,0.1)]" : "text-[#8f8f96] hover:text-[#e0e0e0] hover:bg-[#222228]"
          }`}
          title="Loop selection"
        >
          <Repeat size={14} />
        </button>
        <div className="flex items-center gap-1 ml-2">
          <Gauge size={12} className="text-[#8f8f96]" />
          <select
            value={playbackRate}
            onChange={(e) => setPlaybackRate(Number(e.target.value))}
            className="bg-[#222228] text-[#e0e0e0] text-xs rounded px-1.5 py-0.5 border border-[#2a2a31] outline-none focus:border-[#00e676]"
          >
            <option value={0.25}>0.25x</option>
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={1.5}>1.5x</option>
            <option value={2}>2x</option>
          </select>
        </div>
        <div className="flex-1" />
        <span className="font-mono-data text-lg text-[#00e676] tracking-wider">
          {formatTime(currentTime)}
        </span>
        <span className="text-[#55555e] mx-1">/</span>
        <span className="font-mono-data text-sm text-[#8f8f96]">
          {formatTime(duration)}
        </span>
      </div>

      {/* Timeline Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Range Bar */}
        <div className="h-7 bg-[#151518] border-b border-[#2a2a31] relative select-none">
          {/* Trim range highlight */}
          <div
            className="absolute top-0 bottom-0 bg-[rgba(0,230,118,0.08)] border-x border-[#00e676]"
            style={{
              left: `${(trimStart / duration) * 100}%`,
              width: `${((trimEnd - trimStart) / duration) * 100}%`,
            }}
          />
          {/* Time markers */}
          {Array.from({ length: 11 }, (_, i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0 flex flex-col items-center"
              style={{ left: `${i * 10}%` }}
            >
              <div className="w-px h-2 bg-[#3d3d45]" />
              <span className="text-[9px] text-[#55555e] font-mono-data mt-0.5">
                {formatTime((duration / 10) * i).split(".")[0]}
              </span>
            </div>
          ))}

          {/* Trim start handle */}
          <div
            className="range-handle absolute top-0 -translate-x-1/2 z-10"
            style={{ left: `${(trimStart / duration) * 100}%` }}
            onMouseDown={(e) => {
              e.stopPropagation();
              setDragging("trimStart");
            }}
            title="Trim start"
          />
          {/* Trim end handle */}
          <div
            className="range-handle absolute top-0 -translate-x-1/2 z-10"
            style={{ left: `${(trimEnd / duration) * 100}%` }}
            onMouseDown={(e) => {
              e.stopPropagation();
              setDragging("trimEnd");
            }}
            title="Trim end"
          />
        </div>

        {/* Waveform Track */}
        <div
          ref={timelineRef}
          className="flex-1 relative cursor-pointer select-none overflow-hidden"
          onClick={handleTimelineClick}
        >
          {/* Waveform visualization */}
          <svg
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="none"
            viewBox="0 0 200 100"
          >
            <path
              d={`M0 50 ${waveform
                .map((v, i) => `L${i} ${50 - v * 40} L${i} ${50 + v * 40}`)
                .join(" ")} L200 50`}
              fill="rgba(0, 230, 118, 0.15)"
              stroke="#00e676"
              strokeWidth="0.5"
              opacity="0.6"
            />
          </svg>

          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 z-20 cursor-ew-resize"
            style={{ left: `${(currentTime / duration) * 100}%` }}
            onMouseDown={(e) => {
              e.stopPropagation();
              setDragging("playhead");
            }}
          >
            <div className="w-px h-full bg-[#00e676]" style={{ boxShadow: "0 0 8px rgba(0,230,118,0.5)" }} />
            <div
              className="absolute -top-0 -translate-x-1/2 w-3 h-4 bg-[#00e676] rounded-b"
              style={{ boxShadow: "0 0 6px rgba(0,230,118,0.4)" }}
            />
          </div>

          {/* Thumbnail strip */}
          <div className="absolute bottom-0 left-0 right-0 h-12 flex opacity-30 pointer-events-none">
            {thumbnails.map((i) => (
              <div
                key={i}
                className="flex-1 border-r border-[#2a2a31] bg-[#1a1a1f] flex items-center justify-center"
              >
                <span className="text-[8px] text-[#55555e] font-mono-data">
                  {formatTime((duration / 10) * i).split(".")[0]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
