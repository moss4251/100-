import React from 'react';

interface StickGraphicProps {
  className?: string;
  isDragging?: boolean;
  highlighted?: boolean;
}

export const StickGraphic: React.FC<StickGraphicProps> = ({
  className = '',
  isDragging = false,
  highlighted = false,
}) => {
  return (
    <div
      className={`relative w-4.5 h-26 sm:w-5 sm:h-28 rounded-full flex flex-col items-center justify-between select-none transition-transform duration-100 ${
        isDragging ? 'scale-105 shadow-xl' : 'shadow-md hover:shadow-lg'
      } ${highlighted ? 'ring-2 ring-red-500 ring-offset-2' : ''} ${className}`}
      style={{
        background: 'linear-gradient(90deg, #d49a6a 0%, #ecd0a6 30%, #e5c18e 60%, #c58652 100%)',
        border: '1px solid #b77640',
      }}
    >
      {/* Wood grain subtleties */}
      <div className="w-full h-full rounded-full overflow-hidden relative pointer-events-none opacity-40">
        <div className="absolute inset-x-0 top-3 h-[1px] bg-[#8e5223]" />
        <div className="absolute inset-x-0 top-8 h-[1px] bg-[#8e5223]" />
        <div className="absolute inset-x-0 top-14 h-[1px] bg-[#8e5223]" />
        <div className="absolute inset-x-0 top-20 h-[1px] bg-[#8e5223]" />
      </div>
      {/* Stick top bevel */}
      <div className="w-2.5 h-2 rounded-full bg-[#fce8ce]/70 mt-1 pointer-events-none" />
      {/* Stick bottom bevel */}
      <div className="w-2.5 h-2 rounded-full bg-[#a36332]/60 mb-1 pointer-events-none" />
    </div>
  );
};
