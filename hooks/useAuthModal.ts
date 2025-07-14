import { create } from "zustand";

type View = 'sign_in' | 'sign_up'

interface AuthModalStore {
    isOpen: boolean;
    view: View
    onOpen: (view: View) => void
    onClose: () => void
};

const useAuthModal = create<AuthModalStore>((set) => ({
    isOpen:false,
    view: 'sign_in',
    onOpen: (view) => set({ isOpen: true, view }),
    onClose: () => set({ isOpen: false}),
}));

export default useAuthModal;