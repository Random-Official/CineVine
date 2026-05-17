import { create } from "zustand";

export type FilterName =
  | "none"
  | "cinematic"
  | "vintage"
  | "neon"
  | "noir"
  | "cyber"
  | "warm";

export interface EditorState {
  // Video
  videoSrc: string | null;
  videoDuration: number;
  videoResolution: string;
  isPlaying: boolean;
  currentTime: number;
  playbackRate: number;

  // Trim
  trimStart: number;
  trimEnd: number;
  isLooping: boolean;

  // Caption
  caption: string;
  captionPosition: "bottom" | "middle" | "top";
  captionColor: string;
  captionSize: number;
  showCaption: boolean;

  // Filter
  activeFilter: FilterName;
  filterIntensity: number;

  // Export
  exportTitle: string;

  // UI
  activeTab: "filters" | "properties" | "captions" | "share";
  sidebarTab: "recent" | "media";

  // Actions
  setVideoSrc: (src: string | null) => void;
  setVideoDuration: (d: number) => void;
  setVideoResolution: (r: string) => void;
  setIsPlaying: (p: boolean) => void;
  setCurrentTime: (t: number) => void;
  togglePlay: () => void;
  setPlaybackRate: (r: number) => void;

  setTrimStart: (t: number) => void;
  setTrimEnd: (t: number) => void;
  setIsLooping: (l: boolean) => void;

  setCaption: (c: string) => void;
  setCaptionPosition: (p: "bottom" | "middle" | "top") => void;
  setCaptionColor: (c: string) => void;
  setCaptionSize: (s: number) => void;
  setShowCaption: (s: boolean) => void;

  setActiveFilter: (f: FilterName) => void;
  setFilterIntensity: (i: number) => void;

  setExportTitle: (t: string) => void;

  setActiveTab: (t: "filters" | "properties" | "captions" | "share") => void;
  setSidebarTab: (t: "recent" | "media") => void;

  // Helpers
  goToStart: () => void;
  goToEnd: () => void;
  stepFrame: (direction: 1 | -1) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  videoSrc: null,
  videoDuration: 0,
  videoResolution: "1080p",
  isPlaying: false,
  currentTime: 0,
  playbackRate: 1,

  trimStart: 0,
  trimEnd: 0,
  isLooping: true,

  caption: "Ready to turn your ideas into something epic? Let's create together!",
  captionPosition: "bottom",
  captionColor: "#ffeb3b",
  captionSize: 24,
  showCaption: true,

  activeFilter: "none",
  filterIntensity: 1,

  exportTitle: "",

  activeTab: "filters",
  sidebarTab: "recent",

  setVideoSrc: (src) => set({ videoSrc: src, isPlaying: false, currentTime: 0 }),
  setVideoDuration: (d) => set({ videoDuration: d, trimEnd: d }),
  setVideoResolution: (r) => set({ videoResolution: r }),
  setIsPlaying: (p) => set({ isPlaying: p }),
  setCurrentTime: (t) => {
    const { trimEnd, trimStart, isLooping } = get();
    if (isLooping && trimEnd > 0 && t >= trimEnd) {
      set({ currentTime: trimStart });
    } else {
      set({ currentTime: Math.max(0, t) });
    }
  },
  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
  setPlaybackRate: (r) => set({ playbackRate: r }),

  setTrimStart: (t) => set({ trimStart: Math.max(0, t) }),
  setTrimEnd: (t) => set({ trimEnd: t }),
  setIsLooping: (l) => set({ isLooping: l }),

  setCaption: (c) => set({ caption: c }),
  setCaptionPosition: (p) => set({ captionPosition: p }),
  setCaptionColor: (c) => set({ captionColor: c }),
  setCaptionSize: (s) => set({ captionSize: s }),
  setShowCaption: (s) => set({ showCaption: s }),

  setActiveFilter: (f) => set({ activeFilter: f }),
  setFilterIntensity: (i) => set({ filterIntensity: i }),

  setExportTitle: (t) => set({ exportTitle: t }),

  setActiveTab: (t) => set({ activeTab: t }),
  setSidebarTab: (t) => set({ sidebarTab: t }),

  goToStart: () => set({ currentTime: get().trimStart }),
  goToEnd: () => set({ currentTime: get().trimEnd || get().videoDuration }),
  stepFrame: (dir) => {
    const { currentTime } = get();
    set({ currentTime: Math.max(0, currentTime + dir * 0.033) });
  },
}));
