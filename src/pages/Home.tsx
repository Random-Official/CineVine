import { useState } from "react";
import { useEditorStore } from "@/store/editorStore";
import { Sidebar } from "@/components/editor/Sidebar";
import { VideoPreview } from "@/components/editor/VideoPreview";
import { Timeline } from "@/components/editor/Timeline";
import { FilterPanel } from "@/components/editor/FilterPanel";
import { CaptionPanel } from "@/components/editor/CaptionPanel";
import { Header } from "@/components/editor/Header";
import {
  Sliders,
  Type,
  Sparkles,
  Share2,
  Settings,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

const RIGHT_TABS = [
  { key: "filters" as const, label: "Filters", icon: Sparkles },
  { key: "properties" as const, label: "Properties", icon: Sliders },
  { key: "captions" as const, label: "Captions", icon: Type },
  { key: "share" as const, label: "Share", icon: Share2 },
];

export default function Home() {
  const { activeTab, setActiveTab } = useEditorStore();
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  const renderRightPanel = () => {
    switch (activeTab) {
      case "filters":
        return <FilterPanel />;
      case "captions":
        return <CaptionPanel />;
      case "properties":
        return <PropertiesPanel />;
      case "share":
        return <SharePanel />;
      default:
        return <FilterPanel />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#0d0d0f] overflow-hidden">
      {/* Header */}
      <Header />

      {/* Main workspace */}
      <div className="flex-1 flex min-h-0">
        {/* Left Sidebar */}
        <div
          className={`relative transition-all duration-200 ${
            leftCollapsed ? "w-0 overflow-hidden" : ""
          }`}
        >
          {!leftCollapsed && <Sidebar />}
          <button
            onClick={() => setLeftCollapsed(!leftCollapsed)}
            className="absolute top-1/2 -translate-y-1/2 -right-3 z-10 w-6 h-12 flex items-center justify-center bg-[#1a1a1f] border border-[#2a2a31] rounded-r-md hover:bg-[#222228] transition-colors"
          >
            {leftCollapsed ? (
              <ChevronRight size={12} className="text-[#8f8f96]" />
            ) : (
              <ChevronLeft size={12} className="text-[#8f8f96]" />
            )}
          </button>
        </div>

        {/* Center Editor */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Video preview area */}
          <div className="flex-1 flex flex-col p-2 gap-2 min-h-0">
            {/* Preview + right panel toggle */}
            <div className="flex-1 flex gap-2 min-h-0">
              <VideoPreview />
            </div>
          </div>

          {/* Timeline */}
          <div className="h-[200px] shrink-0">
            <Timeline />
          </div>
        </div>

        {/* Right Panel */}
        <div
          className={`relative transition-all duration-200 ${
            rightCollapsed ? "w-0 overflow-hidden" : ""
          }`}
        >
          {!rightCollapsed && (
            <div className="w-[280px] h-full flex flex-col bg-[#1a1a1f] border-l border-[#2a2a31]">
              {/* Tab buttons */}
              <div className="flex border-b border-[#2a2a31]">
                {RIGHT_TABS.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex-1 flex flex-col items-center py-2 text-[10px] font-medium transition-colors ${
                        activeTab === tab.key
                          ? "text-[#00e676] border-b-2 border-[#00e676]"
                          : "text-[#8f8f96] hover:text-[#e0e0e0]"
                      }`}
                    >
                      <Icon size={14} className="mb-0.5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Panel content */}
              <div className="flex-1 min-h-0 overflow-hidden">
                {renderRightPanel()}
              </div>
            </div>
          )}
          <button
            onClick={() => setRightCollapsed(!rightCollapsed)}
            className="absolute top-1/2 -translate-y-1/2 -left-3 z-10 w-6 h-12 flex items-center justify-center bg-[#1a1a1f] border border-[#2a2a31] rounded-l-md hover:bg-[#222228] transition-colors"
          >
            {rightCollapsed ? (
              <ChevronLeft size={12} className="text-[#8f8f96]" />
            ) : (
              <ChevronRight size={12} className="text-[#8f8f96]" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function PropertiesPanel() {
  const {
    videoDuration,
    videoResolution,
    playbackRate,
    trimStart,
    trimEnd,
    exportTitle,
    setExportTitle,
  } = useEditorStore();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#2a2a31]">
        <Settings size={14} className="text-[#00e676]" />
        <span className="text-sm font-medium text-[#e0e0e0]">Properties</span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-xs text-[#8f8f96]">Export Title</label>
          <input
            type="text"
            value={exportTitle}
            onChange={(e) => setExportTitle(e.target.value)}
            placeholder="Untitled Export"
            className="w-full bg-[#222228] border border-[#2a2a31] rounded-md px-3 py-1.5 text-sm text-[#e0e0e0] placeholder-[#55555e] outline-none focus:border-[#00e676] transition-colors"
          />
        </div>

        {/* Video info */}
        <div className="rounded-lg bg-[#222228] border border-[#2a2a31] p-3 space-y-2">
          <p className="text-[10px] text-[#55555e] uppercase tracking-wider">
            Video Info
          </p>
          <div className="flex justify-between text-xs">
            <span className="text-[#8f8f96]">Duration</span>
            <span className="text-[#e0e0e0] font-mono-data">
              {videoDuration.toFixed(2)}s
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[#8f8f96]">Resolution</span>
            <span className="text-[#e0e0e0] font-mono-data">
              {videoResolution}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[#8f8f96]">Playback</span>
            <span className="text-[#e0e0e0] font-mono-data">{playbackRate}x</span>
          </div>
        </div>

        {/* Trim info */}
        <div className="rounded-lg bg-[#222228] border border-[#2a2a31] p-3 space-y-2">
          <p className="text-[10px] text-[#55555e] uppercase tracking-wider">
            Trim Points
          </p>
          <div className="flex justify-between text-xs">
            <span className="text-[#8f8f96]">Start</span>
            <span className="text-[#00e676] font-mono-data">
              {trimStart.toFixed(2)}s
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[#8f8f96]">End</span>
            <span className="text-[#00e676] font-mono-data">
              {trimEnd.toFixed(2)}s
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[#8f8f96]">Selected</span>
            <span className="text-[#e0e0e0] font-mono-data">
              {(trimEnd - trimStart).toFixed(2)}s
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SharePanel() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#2a2a31]">
        <Share2 size={14} className="text-[#00e676]" />
        <span className="text-sm font-medium text-[#e0e0e0]">Share</span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
        <p className="text-xs text-[#8f8f96]">
          Click the Export button in the header to start the publishing workflow.
        </p>

        <div className="rounded-lg bg-[#222228] border border-[#2a2a31] p-3 space-y-2">
          <p className="text-[10px] text-[#55555e] uppercase tracking-wider">
            Supported Platforms
          </p>
          {[
            { name: "TikTok", color: "#00e676" },
            { name: "YouTube Shorts", color: "#FF0000" },
            { name: "Instagram Reels", color: "#E4405F" },
            { name: "X (Twitter)", color: "#e0e0e0" },
          ].map((p) => (
            <div key={p.name} className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: p.color }}
              />
              <span className="text-xs text-[#e0e0e0]">{p.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
