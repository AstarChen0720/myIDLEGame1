import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { useGameLogic } from '../hooks/useGameLogic';
import CookieButton from './CookieButton';

function GameScreen() {
  const cookies = useGameStore((state) => state.cookies);
  const { cookieBeenClicked } = useGameLogic();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#121212',
        color: '#f5f5f5',
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '24px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '32px',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            padding: '24px 16px',
            borderRadius: '16px',
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
            boxShadow: '0 18px 45px rgba(0,0,0,0.55)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div
            style={{
              fontSize: '16px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#b0b0b0',
              marginBottom: '8px',
            }}
          >
            Cookies
          </div>
          <div
            style={{
              fontSize: '48px',
              fontWeight: 700,
              letterSpacing: '0.04em',
            }}
          >
            {cookies}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            paddingBottom: '24px',
          }}
        >
          <CookieButton onCookieClick={cookieBeenClicked} />
        </div>
      </div>
    </div>
  );
}

export default GameScreen;
