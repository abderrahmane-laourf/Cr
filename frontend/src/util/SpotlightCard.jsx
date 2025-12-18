import { useRef, useState } from 'react';

/**
 * SpotlightCard - Premium card component with spotlight hover effect
 * Automatically adapts to light/dark mode via Tailwind's dark: classes
 */
const SpotlightCard = ({ 
  children, 
  className = '', 
  spotlightColor = 'rgba(59, 130, 246, 0.15)' // Blue tint for spotlight
}) => {
  const divRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = e => {
    if (!divRef.current || isFocused) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => {
    setIsFocused(true);
    setOpacity(0.6);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setOpacity(0);
  };

  const handleMouseEnter = () => setOpacity(0.6);
  const handleMouseLeave = () => setOpacity(0);

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`
        relative rounded-2xl border overflow-hidden p-6 
        transition-all duration-300 ease-out
        bg-white/95 dark:bg-slate-900/40 
        dark:backdrop-blur-xl dark:backdrop-saturate-150
        border-slate-200 dark:border-blue-500/20 
        shadow-sm hover:shadow-xl dark:shadow-black/50
        ${className}
      `}
    >
      {/* Spotlight effect overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ease-in-out"
        style={{
          opacity,
          background: `radial-gradient(circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 80%)`
        }}
      />
      {children}
    </div>
  );
};

export default SpotlightCard;
