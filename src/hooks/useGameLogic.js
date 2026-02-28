import { useCallback } from 'react';
import { CLICK_POWER } from '../constants/gameConfig';
import { useGameStore } from '../store/useGameStore';

export function useGameLogic() {
  const addCookies = useGameStore((state) => state.addCookies);

  const cookieBeenClicked = useCallback(() => {
    addCookies(CLICK_POWER);
    return true;
  }, [addCookies]);

  return {
    cookieBeenClicked,
  };
}
