import { create } from 'zustand';

interface OffersState {
  activeOfferId: string | null;
  setActiveOfferId: (id: string | null) => void;
}

export const useOffersStore = create<OffersState>((set) => ({
  activeOfferId: null,
  setActiveOfferId: (id) => set({ activeOfferId: id }),
}));
