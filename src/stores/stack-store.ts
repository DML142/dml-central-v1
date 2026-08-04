import { create } from 'zustand';

interface StackState {
  openPanels: string[];
  setOpenPanels: (ids: string[]) => void;
  togglePanel: (id: string) => void;
}

export const useStackStore = create<StackState>((set, get) => ({
  openPanels: [],
  setOpenPanels: (ids) => {
    set({ openPanels: ids });
  },
  togglePanel: (id) => {
    const open = get().openPanels;
    set({ openPanels: open.includes(id) ? open.filter((item) => item !== id) : [...open, id] });
  },
}));
