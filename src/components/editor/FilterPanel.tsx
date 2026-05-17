import { useEditorStore, type FilterName } from "@/store/editorStore";
import { Sparkles, Sliders } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface FilterPreset {
  name: string;
  key: FilterName;
  css: string;
  description: string;
}

const FILTERS: FilterPreset[] = [
  { name: "Cinematic", key: "cinematic", css: "contrast(1.15) saturate(1.2) brightness(0.95)", description: "Teal & orange grade" },
  { name: "Vintage", key: "vintage", css: "sepia(0.4) contrast(0.9) saturate(0.8)", description: "Warm retro film" },
  { name: "Neon Glow", key: "neon", css: "saturate(2) contrast(1.3) hue-rotate(15deg)", description: "Vivid cyberpunk" },
  { name: "Film Noir", key: "noir", css: "grayscale(1) contrast(1.4) brightness(0.8)", description: "Classic B&W" },
  { name: "Cyber Wave", key: "cyber", css: "hue-rotate(180deg) saturate(2.5)", description: "Cyan & magenta" },
  { name: "Golden Hour", key: "warm", css: "sepia(0.3) saturate(1.4)", description: "Warm sunset" },
];

export function FilterPanel() {
  const { activeFilter, filterIntensity, setActiveFilter, setFilterIntensity } =
    useEditorStore();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#2a2a31]">
        <Sparkles size={14} className="text-[#00e676]" />
        <span className="text-sm font-medium text-[#e0e0e0]">Filters</span>
      </div>

      {/* Intensity Slider */}
      <div className="px-4 py-3 border-b border-[#2a2a31]">
        <div className="flex items-center gap-2 mb-2">
          <Sliders size={12} className="text-[#8f8f96]" />
          <span className="text-xs text-[#8f8f96]">Intensity</span>
        </div>
        <Slider
          value={[filterIntensity * 100]}
          onValueChange={(v) => setFilterIntensity(v[0] / 100)}
          min={0}
          max={100}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-[#55555e]">0%</span>
          <span className="text-[10px] text-[#8f8f96] font-mono-data">
            {Math.round(filterIntensity * 100)}%
          </span>
          <span className="text-[10px] text-[#55555e]">100%</span>
        </div>
      </div>

      {/* Filter Grid */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
        <div className="grid grid-cols-2 gap-2">
          {FILTERS.map((filter) => (
            <button
              key={filter.key}
              onClick={() =>
                setActiveFilter(activeFilter === filter.key ? "none" : filter.key)
              }
              className={`relative rounded-lg overflow-hidden border transition-all duration-150 group ${
                activeFilter === filter.key
                  ? "border-[#00e676] ring-1 ring-[#00e676]"
                  : "border-[#2a2a31] hover:border-[#3d3d45]"
              }`}
            >
              {/* Filter Preview */}
              <div
                className="aspect-video bg-gradient-to-br from-[#2a2a31] to-[#1a1a1f] flex items-center justify-center relative"
                style={{ filter: filter.css }}
              >
                {/* Mini landscape preview */}
                <div className="absolute inset-0 opacity-50">
                  <svg viewBox="0 0 120 80" className="w-full h-full">
                    <defs>
                      <linearGradient id={`sky-${filter.key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4a5568" />
                        <stop offset="100%" stopColor="#2d3748" />
                      </linearGradient>
                      <linearGradient id={`mtn-${filter.key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2d3748" />
                        <stop offset="100%" stopColor="#1a202c" />
                      </linearGradient>
                    </defs>
                    <rect width="120" height="50" fill={`url(#sky-${filter.key})`} />
                    <polygon points="0,80 30,35 60,55 90,25 120,60 120,80" fill={`url(#mtn-${filter.key})`} />
                    <circle cx="90" cy="20" r="8" fill="#e2e8f0" opacity="0.3" />
                  </svg>
                </div>
                <span className="relative z-10 text-xs font-medium text-[#e0e0e0] drop-shadow-lg">
                  {filter.name}
                </span>
              </div>

              {/* Info */}
              <div className="px-2 py-1.5 bg-[#1a1a1f]">
                <p className="text-[10px] text-[#8f8f96]">{filter.description}</p>
              </div>

              {/* Active indicator */}
              {activeFilter === filter.key && (
                <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#00e676]" style={{ boxShadow: "0 0 4px rgba(0,230,118,0.6)" }} />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
