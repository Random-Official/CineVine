import { useState, useCallback } from "react";
import { trpc } from "@/providers/trpc";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Youtube,
  Check,
  Loader2,
  Link2,
  Upload,
  Share2,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

interface PlatformConfig {
  key: string;
  name: string;
  color: string;
  icon: React.ReactNode;
}

const PLATFORMS: PlatformConfig[] = [
  {
    key: "youtube",
    name: "YouTube Shorts",
    color: "#FF0000",
    icon: <Youtube size={20} />,
  },
  {
    key: "tiktok",
    name: "TikTok",
    color: "#000000",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.2a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.73a8.28 8.28 0 0 0 4.83 1.54V6.81a4.85 4.85 0 0 1-1.07-.12z" />
      </svg>
    ),
  },
  {
    key: "instagram",
    name: "Instagram Reels",
    color: "#E4405F",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    key: "x",
    name: "X",
    color: "#000000",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

interface PublishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exportId: number | null;
}

export function PublishDialog({ open, onOpenChange, exportId }: PublishDialogProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [connectHandle, setConnectHandle] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [publishProgress, setPublishProgress] = useState<Record<string, number>>({});
  const [publishStatus, setPublishStatus] = useState<Record<string, "idle" | "uploading" | "done" | "error">>({});

  const utils = trpc.useUtils();
  const { data: connections = [] } = trpc.platform.list.useQuery();
  const connectMutation = trpc.platform.connect.useMutation({
    onSuccess: () => {
      utils.platform.list.invalidate();
      setConnectingPlatform(null);
      setConnectHandle("");
    },
  });
  const disconnectMutation = trpc.platform.disconnect.useMutation({
    onSuccess: () => utils.platform.list.invalidate(),
  });
  const startPublishMutation = trpc.publish.start.useMutation();

  const isConnected = (platform: string) =>
    connections.some((c) => c.platform === platform && c.isConnected);

  const getConnection = (platform: string) =>
    connections.find((c) => c.platform === platform);

  const togglePlatform = (key: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  };

  const handleConnect = () => {
    if (!connectingPlatform || !connectHandle.trim()) return;
    connectMutation.mutate({
      platform: connectingPlatform,
      accountHandle: connectHandle.trim(),
      accountName: connectHandle.trim(),
    });
  };

  const simulatePublish = useCallback(
    async (platforms: string[], expId: number) => {
      setPublishing(true);
      await startPublishMutation.mutateAsync({
        exportId: expId,
        platforms,
      });

      const initialProgress: Record<string, number> = {};
      const initialStatus: Record<string, "idle" | "uploading" | "done" | "error"> = {};
      platforms.forEach((p) => {
        initialProgress[p] = 0;
        initialStatus[p] = "uploading";
      });
      setPublishProgress(initialProgress);
      setPublishStatus(initialStatus);

      // Simulate progress
      for (let progress = 0; progress <= 100; progress += 5) {
        await new Promise((r) => setTimeout(r, 150));
        setPublishProgress((prev) => {
          const next = { ...prev };
          platforms.forEach((p) => {
            next[p] = Math.min(100, progress + Math.floor(Math.random() * 10));
          });
          return next;
        });
      }

      // Mark all done
      const doneStatus: Record<string, "idle" | "uploading" | "done" | "error"> = {};
      platforms.forEach((p) => {
        doneStatus[p] = "done";
      });
      setPublishStatus(doneStatus);
      setPublishProgress(
        platforms.reduce(
          (acc, p) => ({ ...acc, [p]: 100 }),
          {}
        )
      );

      setPublishing(false);
      utils.export.list.invalidate();
    },
    [startPublishMutation, utils.export.list]
  );

  const handlePublish = async () => {
    if (!exportId || selectedPlatforms.length === 0) return;
    await simulatePublish(selectedPlatforms, exportId);
  };

  const allDone = selectedPlatforms.length > 0 && selectedPlatforms.every(
    (p) => publishStatus[p] === "done"
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a1a1f] border-[#2a2a31] max-w-lg p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-5 py-4 border-b border-[#2a2a31]">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-semibold text-[#e0e0e0] flex items-center gap-2">
              <Share2 size={16} className="text-[#00e676]" />
              Publish Video
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Platform List */}
          <div className="space-y-2">
            <p className="text-xs text-[#8f8f96] mb-2">Select platforms</p>
            {PLATFORMS.map((platform) => {
              const connected = isConnected(platform.key);
              const connection = getConnection(platform.key);
              const selected = selectedPlatforms.includes(platform.key);
              const status = publishStatus[platform.key] || "idle";
              const progress = publishProgress[platform.key] || 0;

              return (
                <div
                  key={platform.key}
                  className={`rounded-lg border transition-all ${
                    selected
                      ? "border-[#00e676] bg-[rgba(0,230,118,0.05)]"
                      : "border-[#2a2a31] bg-[#222228]"
                  }`}
                >
                  <div className="flex items-center gap-3 px-3 py-2.5">
                    {/* Checkbox */}
                    <button
                      onClick={() => connected && togglePlatform(platform.key)}
                      disabled={!connected || publishing}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        selected
                          ? "bg-[#00e676] border-[#00e676]"
                          : connected
                          ? "border-[#3d3d45] hover:border-[#8f8f96]"
                          : "border-[#2a2a31] opacity-50"
                      }`}
                    >
                      {selected && <Check size={12} className="text-black" />}
                    </button>

                    {/* Icon */}
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: platform.color + "20", color: platform.color }}
                    >
                      {platform.icon}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#e0e0e0]">
                        {platform.name}
                      </p>
                      {connected && connection?.accountHandle ? (
                        <p className="text-[10px] text-[#00e676]">
                          @{connection.accountHandle}
                        </p>
                      ) : (
                        <p className="text-[10px] text-[#55555e]">Not connected</p>
                      )}
                    </div>

                    {/* Action */}
                    {!connected ? (
                      <button
                        onClick={() => {
                          setConnectingPlatform(platform.key);
                          setConnectHandle("");
                        }}
                        className="px-3 py-1 rounded-md bg-[#222228] border border-[#2a2a31] text-xs text-[#8f8f96] hover:text-[#e0e0e0] hover:border-[#3d3d45] transition-colors flex items-center gap-1"
                      >
                        <Link2 size={10} />
                        Connect
                      </button>
                    ) : status === "done" ? (
                      <div className="w-6 h-6 rounded-full bg-[#00e676] flex items-center justify-center">
                        <Check size={14} className="text-black" />
                      </div>
                    ) : status === "uploading" ? (
                      <div className="w-16">
                        <div className="h-1.5 bg-[#2a2a31] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#00e676] rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-[9px] text-[#8f8f96] text-right mt-0.5">
                          {progress}%
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={() =>
                          disconnectMutation.mutate({ platform: platform.key })
                        }
                        className="text-[10px] text-[#55555e] hover:text-red-400 transition-colors"
                      >
                        Disconnect
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Connect dialog */}
          {connectingPlatform && (
            <div className="rounded-lg bg-[#222228] border border-[#2a2a31] p-3 space-y-2">
              <p className="text-xs text-[#e0e0e0]">
                Connect{" "}
                {PLATFORMS.find((p) => p.key === connectingPlatform)?.name}
              </p>
              <div className="flex gap-2">
                <Input
                  value={connectHandle}
                  onChange={(e) => setConnectHandle(e.target.value)}
                  placeholder="@username"
                  className="flex-1 bg-[#1a1a1f] border-[#2a2a31] text-[#e0e0e0] text-xs h-8 placeholder:text-[#55555e] focus:border-[#00e676]"
                />
                <Button
                  onClick={handleConnect}
                  disabled={!connectHandle.trim() || connectMutation.isPending}
                  size="sm"
                  className="bg-[#00e676] text-black hover:bg-[#00ff85] text-xs h-8"
                >
                  {connectMutation.isPending ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <ArrowRight size={12} />
                  )}
                </Button>
              </div>
              <p className="text-[10px] text-[#55555e]">
                <AlertCircle size={8} className="inline mr-1" />
                Demo: Enter any username to simulate connection
              </p>
            </div>
          )}

          {/* Note */}
          <div className="rounded-lg bg-[#151518] border border-[#2a2a31] p-3">
            <p className="text-[10px] text-[#8f8f96] leading-relaxed">
              <strong className="text-[#e0e0e0]">Note:</strong> Real OAuth + uploads to
              TikTok/YouTube/IG/X require platform API keys, app review, and a server. The
              upload flow here is fully wired UI-side.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#2a2a31] flex justify-end gap-2">
          {allDone ? (
            <Button
              onClick={() => onOpenChange(false)}
              className="bg-[#00e676] text-black hover:bg-[#00ff85] text-xs"
            >
              <Check size={12} className="mr-1" />
              Done
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="text-[#8f8f96] hover:text-[#e0e0e0] text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePublish}
                disabled={
                  publishing ||
                  selectedPlatforms.length === 0 ||
                  !exportId
                }
                className="bg-[#00e676] text-black hover:bg-[#00ff85] text-xs disabled:opacity-50"
              >
                {publishing ? (
                  <>
                    <Loader2 size={12} className="animate-spin mr-1" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Upload size={12} className="mr-1" />
                    Publish{" "}
                    {selectedPlatforms.length > 0 && `(${selectedPlatforms.length})`}
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
