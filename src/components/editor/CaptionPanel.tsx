import { useEditorStore } from "@/store/editorStore";
import { Type, AlignVerticalSpaceAround } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

const CAPTION_COLORS = [
  "#ffeb3b", "#ffffff", "#ff5252", "#00e676",
  "#00bcd4", "#e040fb", "#ff9800", "#795548",
];

export function CaptionPanel() {
  const {
    caption,
    showCaption,
    captionPosition,
    captionColor,
    captionSize,
    setCaption,
    setShowCaption,
    setCaptionPosition,
    setCaptionColor,
    setCaptionSize,
  } = useEditorStore();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#2a2a31]">
        <Type size={14} className="text-[#00e676]" />
        <span className="text-sm font-medium text-[#e0e0e0]">Captions</span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {/* Show caption toggle */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#8f8f96]">Show caption</span>
          <Switch checked={showCaption} onCheckedChange={setShowCaption} />
        </div>

        {/* Caption text */}
        <div className="space-y-1.5">
          <label className="text-xs text-[#8f8f96]">Caption text</label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
            className="w-full bg-[#222228] border border-[#2a2a31] rounded-md px-3 py-2 text-sm text-[#e0e0e0] placeholder-[#55555e] outline-none focus:border-[#00e676] resize-none transition-colors"
            placeholder="Enter caption text..."
          />
        </div>

        {/* Position */}
        <div className="space-y-1.5">
          <label className="text-xs text-[#8f8f96] flex items-center gap-1">
            <AlignVerticalSpaceAround size={10} />
            Position
          </label>
          <div className="flex gap-1">
            {(["top", "middle", "bottom"] as const).map((pos) => (
              <button
                key={pos}
                onClick={() => setCaptionPosition(pos)}
                className={`flex-1 py-1.5 rounded text-xs font-medium transition-all ${
                  captionPosition === pos
                    ? "bg-[rgba(0,230,118,0.15)] text-[#00e676] border border-[#00e676]"
                    : "bg-[#222228] text-[#8f8f96] border border-[#2a2a31] hover:border-[#3d3d45]"
                }`}
              >
                {pos.charAt(0).toUpperCase() + pos.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Font size */}
        <div className="space-y-1.5">
          <label className="text-xs text-[#8f8f96]">Size</label>
          <Slider
            value={[captionSize]}
            onValueChange={(v) => setCaptionSize(v[0])}
            min={12}
            max={64}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between">
            <span className="text-[10px] text-[#55555e]">12px</span>
            <span className="text-[10px] text-[#8f8f96] font-mono-data">
              {captionSize}px
            </span>
            <span className="text-[10px] text-[#55555e]">64px</span>
          </div>
        </div>

        {/* Color */}
        <div className="space-y-1.5">
          <label className="text-xs text-[#8f8f96]">Color</label>
          <div className="flex flex-wrap gap-1.5">
            {CAPTION_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setCaptionColor(color)}
                className={`w-6 h-6 rounded-full border-2 transition-all ${
                  captionColor === color
                    ? "border-[#e0e0e0] scale-110"
                    : "border-transparent hover:border-[#3d3d45]"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="mt-4 p-3 rounded-lg bg-[#151518] border border-[#2a2a31]">
          <p className="text-[10px] text-[#55555e] mb-2">Preview</p>
          <p
            className="font-semibold text-center"
            style={{
              color: captionColor,
              fontSize: `${Math.min(captionSize, 20)}px`,
              textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
            }}
          >
            {caption || "Caption preview"}
          </p>
        </div>
      </div>
    </div>
  );
}
