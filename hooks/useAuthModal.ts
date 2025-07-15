import { create } from "zustand";

type View = 'sign_in' | 'sign_up'

type AuthModalState = {
  isOpen: boolean;
  view: 'sign_in' | 'sign_up';
  onOpen: (view?: 'sign_in' | 'sign_up') => void;
  onClose: () => void;
  setView: (view: 'sign_in' | 'sign_up') => void;
};

export const useAuthModal = create<AuthModalState>((set) => ({
  isOpen: false,
  view: 'sign_in',
  onOpen: (view = 'sign_in') => set({ isOpen: true, view }),
  onClose: () => set({ isOpen: false }),
  setView: (view) => set({ view }),
}));


export default useAuthModal;