import { useState } from "react";
import { useEditorStore } from "@/store/editorStore";
import { trpc } from "@/providers/trpc";
import { PublishDialog } from "./PublishDialog";
import {
  Undo2,
  Redo2,
  Download,
  LogIn,
  LogOut,
  User,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export function Header() {
  const [publishOpen, setPublishOpen] = useState(false);
  const [lastExportId, setLastExportId] = useState<number | null>(null);

  const {
    videoSrc,
    exportTitle,
    caption,
    activeFilter,
    videoDuration,
    trimStart,
    trimEnd,
  } = useEditorStore();

  const { user, logout } = useAuth();
  const utils = trpc.useUtils();

  const createExport = trpc.export.create.useMutation({
    onSuccess: (data) => {
      setLastExportId(data.id);
      utils.export.list.invalidate();
    },
  });

  const handleExport = () => {
    if (!videoSrc) return;
    createExport.mutate({
      title: exportTitle || "Untitled Export",
      caption: caption || undefined,
      filterName: activeFilter !== "none" ? activeFilter : undefined,
      duration: Math.round(videoDuration),
      trimStart: trimStart || undefined,
      trimEnd: trimEnd || undefined,
      thumbnailUrl: "/assets/thumb-hike.jpg",
    });
    setPublishOpen(true);
  };

  return (
    <>
      <header className="h-10 flex items-center px-4 bg-[#1a1a1f] border-b border-[#2a2a31] shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img src="/assets/app-logo.png" alt="CINECUT" className="h-5 w-auto" />
          <span className="font-mono-data text-sm font-bold text-[#00e676] tracking-wider">
            CINECUT
          </span>
        </div>

        {/* Center actions */}
        <div className="flex-1 flex items-center justify-center gap-1">
          <button
            className="p-1.5 rounded hover:bg-[#222228] text-[#8f8f96] hover:text-[#e0e0e0] transition-colors"
            title="Undo"
          >
            <Undo2 size={14} />
          </button>
          <button
            className="p-1.5 rounded hover:bg-[#222228] text-[#8f8f96] hover:text-[#e0e0e0] transition-colors"
            title="Redo"
          >
            <Redo2 size={14} />
          </button>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#222228] border border-[#2a2a31]">
                <User size={12} className="text-[#00e676]" />
                <span className="text-xs text-[#e0e0e0]">{user.name || "User"}</span>
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded hover:bg-[#222228] text-[#8f8f96] hover:text-[#e0e0e0] transition-colors"
                title="Logout"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <a
              href="/login"
              className="flex items-center gap-1 px-2 py-1 rounded bg-[#222228] border border-[#2a2a31] text-xs text-[#8f8f96] hover:text-[#e0e0e0] hover:border-[#3d3d45] transition-colors"
            >
              <LogIn size={12} />
              Login
            </a>
          )}
          <div className="w-px h-5 bg-[#2a2a31]" />
          <Button
            onClick={handleExport}
            disabled={!videoSrc || createExport.isPending}
            className="bg-[#00e676] text-black hover:bg-[#00ff85] text-xs h-7 px-3 font-medium disabled:opacity-50"
          >
            {createExport.isPending ? (
              <span className="animate-pulse">Exporting...</span>
            ) : (
              <>
                <Download size={12} className="mr-1" />
                Export
              </>
            )}
          </Button>
        </div>
      </header>

      <PublishDialog
        open={publishOpen}
        onOpenChange={setPublishOpen}
        exportId={lastExportId}
      />
    </>
  );
}
