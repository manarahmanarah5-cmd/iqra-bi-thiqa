import React, { useEffect, useState } from 'react';

interface ReadingRulerProps {
  enabled: boolean;
  height: number;
  color: string;
}

export const ReadingRuler: React.FC<ReadingRulerProps> = ({
  enabled,
  height,
  color
}) => {
  const [mouseY, setMouseY] = useState(240);

  useEffect(() => {
    if (!enabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMouseY(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [enabled]);

  if (!enabled) return null;

  const rulerTop = Math.max(0, mouseY - height / 2);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-40 select-none overflow-hidden transition-all duration-75"
      aria-hidden="true"
    >
      {/* Upper Dimmed Mask */}
      <div
        className="absolute top-0 left-0 right-0 bg-stone-900/35 backdrop-blur-[0.5px] transition-all duration-75"
        style={{ height: `${rulerTop}px` }}
      />

      {/* Active Line Spotlight / Ruler Window */}
      <div
        className="absolute left-0 right-0 border-y-2 border-amber-500/60 shadow-lg transition-all duration-75"
        style={{
          top: `${rulerTop}px`,
          height: `${height}px`,
          backgroundColor: color || 'rgba(254, 240, 138, 0.15)',
        }}
      >
        {/* Subtle reading centerline */}
        <div className="w-full h-full flex items-center justify-between px-6 opacity-30">
          <span className="text-[10px] tracking-widest text-amber-800 font-mono">مسطرة التركيز القرائي</span>
          <span className="text-[10px] tracking-widest text-amber-800 font-mono">← خط القراءة المباشر →</span>
        </div>
      </div>

      {/* Lower Dimmed Mask */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-stone-900/35 backdrop-blur-[0.5px] transition-all duration-75"
        style={{ top: `${rulerTop + height}px` }}
      />
    </div>
  );
};
