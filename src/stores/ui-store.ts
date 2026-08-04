import { create } from 'zustand';

export type ContactSource = 'hero' | 'footer';

interface UiState {
  isContactOpen: boolean;
  contactSource: ContactSource | null;
  openContact: (source: ContactSource) => void;
  closeContact: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  isContactOpen: false,
  contactSource: null,
  openContact: (source) => {
    set({ isContactOpen: true, contactSource: source });
  },
  closeContact: () => {
    set({ isContactOpen: false, contactSource: null });
  },
}));
