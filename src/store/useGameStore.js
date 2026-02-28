import { create } from 'zustand';
import { BASE_COOKIES } from '../constants/gameConfig';

export const useGameStore = create((set) => ({
  cookies: BASE_COOKIES,
  addCookies: (amount) =>
    set((state) => ({
      cookies: state.cookies + amount,
    })),
}));
