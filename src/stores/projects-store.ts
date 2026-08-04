import { create } from 'zustand';

interface ProjectsState {
  openProjectId: string | null;
  activeSlide: number;
  openProject: (id: string) => void;
  closeProject: () => void;
  setSlide: (index: number) => void;
  /** Wraps in both directions: looping is on, so the arrows never disable (tech.md 6.4). */
  stepSlide: (delta: number, total: number) => void;
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  openProjectId: null,
  activeSlide: 0,
  openProject: (id) => {
    set({ openProjectId: id, activeSlide: 0 });
  },
  closeProject: () => {
    set({ openProjectId: null, activeSlide: 0 });
  },
  setSlide: (index) => {
    set({ activeSlide: index });
  },
  stepSlide: (delta, total) => {
    if (total <= 0) return;
    set({ activeSlide: (((get().activeSlide + delta) % total) + total) % total });
  },
}));
