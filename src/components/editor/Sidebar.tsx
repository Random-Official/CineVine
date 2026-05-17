import { useState, useCallback } from "react";
import { useEditorStore } from "@/store/editorStore";
import { trpc } from "@/providers/trpc";
import {
  Clock,
  FolderOpen,
  Film,
  Youtube,
  Upload,
  Trash2,
} from "lucide-react";

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatDate(date: Date | string | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  youtube: <Youtube size={12} className="text-red-500" />,
  tiktok: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-white">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.2a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.73a8.28 8.28 0 0 0 4.83 1.54V6.81a4.85 4.85 0 0 1-1.07-.12z" fill="currentColor"/>
    </svg>
  ),
  instagram: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-pink-500">
      <rect x="2" y="2" width="20" height="20" rx="6" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="2"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>
    </svg>
  ),
  x: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-white">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
};

export function Sidebar() {
  const { sidebarTab, setSidebarTab, setVideoSrc } = useEditorStore();
  const [isDragging, setIsDragging] = useState(false);

  const utils = trpc.useUtils();
  const { data: exports = [] } = trpc.export.list.useQuery({ limit: 20, offset: 0 });
  const deleteMutation = trpc.export.delete.useMutation({
    onSuccess: () => utils.export.list.invalidate(),
  });

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith("video/")) {
          const url = URL.createObjectURL(file);
          setVideoSrc(url);
        }
      }
    },
    [setVideoSrc]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith("video/")) {
        const url = URL.createObjectURL(file);
        setVideoSrc(url);
      }
    },
    [setVideoSrc]
  );

  return (
    <div
      className={`w-[300px] flex flex-col bg-[#1a1a1f] border-r border-[#2a2a31] transition-colors ${
        isDragging ? "bg-[rgba(0,230,118,0.05)] border-[#00e676]" : ""
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* Tabs */}
      <div className="flex border-b border-[#2a2a31]">
        <button
          onClick={() => setSidebarTab("recent")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
            sidebarTab === "recent"
              ? "text-[#00e676] border-b-2 border-[#00e676]"
              : "text-[#8f8f96] hover:text-[#e0e0e0]"
          }`}
        >
          <Clock size={12} />
          Recent
        </button>
        <button
          onClick={() => setSidebarTab("media")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
            sidebarTab === "media"
              ? "text-[#00e676] border-b-2 border-[#00e676]"
              : "text-[#8f8f96] hover:text-[#e0e0e0]"
          }`}
        >
          <FolderOpen size={12} />
          Media
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {sidebarTab === "recent" ? (
          <div className="p-2 space-y-1.5">
            {exports.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Film size={24} className="text-[#3d3d45] mb-2" />
                <p className="text-xs text-[#55555e]">No exports yet</p>
                <p className="text-[10px] text-[#3d3d45] mt-0.5">
                  Your recent exports will appear here
                </p>
              </div>
            ) : (
              exports.map((exp) => (
                <div
                  key={exp.id}
                  className="group flex items-start gap-2.5 p-2 rounded-lg bg-[#222228] hover:bg-[#2a2a31] border border-transparent hover:border-[#3d3d45] transition-all cursor-pointer"
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-9 rounded bg-[#151518] overflow-hidden flex-shrink-0 relative">
                    {exp.thumbnailUrl ? (
                      <img
                        src={exp.thumbnailUrl}
                        alt={exp.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film size={12} className="text-[#55555e]" />
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 text-[8px] bg-black/70 text-white px-0.5 rounded-tl">
                      {formatDuration(exp.duration)}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#e0e0e0] truncate font-medium">
                      {exp.title}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-[#8f8f96]">
                        {formatDate(exp.createdAt)}
                      </span>
                      <span className="text-[8px] text-[#55555e]">
                        {exp.resolution}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      {exp.platforms ? (
                        (() => {
                          try {
                            const plats = JSON.parse(exp.platforms as string) as string[];
                            return plats.map((p) => (
                              <span key={p} className="flex items-center">
                                {PLATFORM_ICONS[p] || null}
                              </span>
                            ));
                          } catch {
                            return null;
                          }
                        })()
                      ) : null}
                    </div>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMutation.mutate({ id: exp.id });
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[#3d3d45] text-[#8f8f96] hover:text-red-400 transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="p-4">
            {/* Drop zone */}
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDragging
                  ? "border-[#00e676] bg-[rgba(0,230,118,0.05)]"
                  : "border-[#2a2a31] hover:border-[#3d3d45]"
              }`}
            >
              <Upload size={20} className="text-[#55555e] mx-auto mb-2" />
              <p className="text-xs text-[#8f8f96] mb-1">Drop video files here</p>
              <p className="text-[10px] text-[#55555e]">or click to browse</p>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>

            {/* Use sample button */}
            <button
              onClick={() => setVideoSrc("/assets/sample-hike.mp4")}
              className="mt-3 w-full py-2 rounded-lg bg-[#222228] border border-[#2a2a31] text-xs text-[#8f8f96] hover:text-[#e0e0e0] hover:border-[#3d3d45] transition-colors flex items-center justify-center gap-1.5"
            >
              <Film size={12} />
              Use sample video
            </button>

            {/* Media grid */}
            <div className="mt-4">
              <p className="text-[10px] text-[#55555e] uppercase tracking-wider mb-2">
                Imported
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                <div className="aspect-video rounded bg-[#222228] border border-[#2a2a31] flex items-center justify-center">
                  <Film size={16} className="text-[#3d3d45]" />
                </div>
                <div className="aspect-video rounded bg-[#222228] border border-[#2a2a31] flex items-center justify-center">
                  <Film size={16} className="text-[#3d3d45]" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
