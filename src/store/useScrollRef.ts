import { create } from "zustand";

type ScrollStore = {
  scrollRef: React.RefObject<HTMLDivElement> | null;
  setScrollRef: (ref: React.RefObject<HTMLDivElement>) => void;
  scrollToTop: () => void;
};

export const useScrollStore = create<ScrollStore>((set, get) => ({
  scrollRef: null,
  setScrollRef: (ref) => {
    set({ scrollRef: ref });
  },
  scrollToTop: () => {
    const ref = get().scrollRef;
    if (ref?.current) {
      ref.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  },
}));
