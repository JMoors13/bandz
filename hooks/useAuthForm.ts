import { create } from 'zustand';

type View = 'sign_in' | 'sign_up';

type AuthModalState = {
  isOpen: boolean;
  view: View;
  onOpen: (view?: View) => void;
  onClose: () => void;
  setView: (view: View) => void;
};

export const useAuthForm = create<AuthModalState>((set) => ({
  isOpen: false,
  view: 'sign_in',
  onOpen: (view = 'sign_in') => set({ isOpen: true, view }),
  onClose: () => set({ isOpen: false }),
  setView: (view) => set({ view }),
}));

export default useAuthForm;
