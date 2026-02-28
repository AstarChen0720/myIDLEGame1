import React, { useEffect, useState } from 'react';

let styleInjected = false;

function injectFloaterStyles() {
  if (styleInjected) return;
  const style = document.createElement('style');
  style.textContent = `
    @keyframes cookieFloatUp {
      0% {
        transform: translateY(0px);
        opacity: 1;
      }
      100% {
        transform: translateY(-32px);
        opacity: 0;
      }
    }

    .cookie-floater {
      position: absolute;
      color: #ffeb8a;
      text-shadow: 0 0 6px rgba(0,0,0,0.6);
      font-weight: 700;
      pointer-events: none;
      animation: cookieFloatUp 600ms ease-out forwards;
      font-size: 18px;
      left: 50%;
      transform: translateX(-50%);
    }
  `;
  document.head.appendChild(style);
  styleInjected = true;
}

function CookieButton({ onCookieClick }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [floaters, setFloaters] = useState([]);

  useEffect(() => {
    injectFloaterStyles();
  }, []);

  const handleClick = () => {
    const success = onCookieClick?.();
    if (success) {
      const id = Date.now() + Math.random();
      setFloaters((prev) => [...prev, { id }]);

      setTimeout(() => {
        setFloaters((prev) => prev.filter((f) => f.id !== id));
      }, 600);
    }
  };

  const scale = isPressed ? 0.93 : isHovered ? 1.07 : 1.0;

  return (
    <div
      style={{
        position: 'relative',
        width: '200px',
        height: '200px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {floaters.map((floater) => (
        <div key={floater.id} className="cookie-floater">
          +1
        </div>
      ))}

      <button
        type="button"
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsPressed(false);
        }}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        style={{
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          border: '4px solid #f2b35d',
          background:
            'radial-gradient(circle at 30% 30%, #ffdd9b, #e8a852 60%, #c47b28)',
          boxShadow:
            '0 18px 35px rgba(0,0,0,0.6), inset 0 4px 6px rgba(255,255,255,0.6)',
          cursor: 'pointer',
          outline: 'none',
          transform: `scale(${scale})`,
          transition: 'transform 120ms ease-out, box-shadow 120ms ease-out',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '56px',
          userSelect: 'none',
        }}
      >
        🍪
      </button>
    </div>
  );
}

export default CookieButton;
