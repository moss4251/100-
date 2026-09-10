import React from 'react';
import { Scissors } from 'lucide-react';

interface BundleGraphicProps {
  className?: string;
  isDragging?: boolean;
  highlighted?: boolean;
  showHint?: boolean;
  onUnbundle?: () => void;
}

export const BundleGraphic: React.FC<BundleGraphicProps> = ({
  className = '',
  isDragging = false,
  highlighted = false,
  showHint = true,
  onUnbundle,
}) => {
  return (
    <div
      className={`relative w-24 sm:w-28 h-24 sm:h-28 select-none flex items-center justify-center group cursor-grab active:cursor-grabbing transition-transform duration-100 ${
        isDragging ? 'scale-105 shadow-2xl' : 'hover:scale-102'
      } ${highlighted ? 'ring-2 ring-red-500 ring-offset-2 rounded-xl' : ''} ${className}`}
    >
      {/* 10 wooden sticks arranged side by side with slight stagger and tight grouping */}
      <div className="relative flex items-center justify-center -space-x-2 sm:-space-x-2.5">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="w-3.5 sm:w-4 h-22 sm:h-26 rounded-full shadow-sm relative overflow-hidden"
            style={{
              background: 'linear-gradient(90deg, #d49a6a 0%, #ecd0a6 35%, #e5c18e 65%, #c58652 100%)',
              border: '1px solid #b77640',
              transform: `translateY(${(i % 2 === 0 ? -1 : 1) * 1.5}px)`,
            }}
          >
            <div className="w-1.5 sm:w-2 h-1.5 rounded-full bg-[#fce8ce]/70 mx-auto mt-0.5" />
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-[#8e5223]/30" />
            <div className="w-1.5 sm:w-2 h-1.5 rounded-full bg-[#a36332]/60 mx-auto mb-0.5 absolute bottom-0.5 inset-x-0" />
          </div>
        ))}

        {/* Center Red Ribbon / Bundle Tie (捆绳) */}
        <div className="absolute inset-x-[-4px] top-1/2 -translate-y-1/2 h-7 sm:h-8 pointer-events-none flex items-center justify-center">
          {/* Main tie band */}
          <div className="w-full h-4 sm:h-5 bg-gradient-to-r from-red-700 via-red-500 to-red-700 rounded-sm shadow-md border-y border-amber-300/60 flex items-center justify-center relative">
            {/* Cord texture stripes */}
            <div className="absolute inset-0 opacity-25 bg-[repeating-linear-gradient(45deg,transparent,transparent_3px,#000_3px,#000_5px)]" />
            {/* Ribbon Knot / Badge */}
            <div className="relative z-10 px-1 sm:px-1.5 py-0.2 sm:py-0.5 bg-amber-100 rounded-full border border-amber-400 shadow-sm flex items-center gap-0.5">
              <span className="text-[9px] sm:text-[10px] font-black tracking-tight text-red-700 leading-none">10</span>
            </div>
          </div>
          {/* Hanging rope ribbon tails */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-3 flex justify-center gap-1">
            <div className="w-0.5 sm:w-1 h-2.5 sm:h-3 bg-red-600 rounded-full rotate-[-15deg] shadow-sm" />
            <div className="w-0.5 sm:w-1 h-3 sm:h-3.5 bg-red-700 rounded-full rotate-[12deg] shadow-sm" />
          </div>
        </div>
      </div>

      {/* Unbundle trigger button for mobile touch & clarity */}
      {onUnbundle && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onUnbundle();
          }}
          title="点击或双击将此捆拆开为10根独立木棒"
          className="absolute -top-3.5 right-0 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md border border-white flex items-center gap-0.5 cursor-pointer z-10 hover:scale-105 active:scale-95 transition-all"
        >
          <Scissors className="w-2.5 h-2.5" />
          <span>拆捆</span>
        </button>
      )}

      {/* Badge label underneath */}
      <div className="absolute -bottom-3 inset-x-0 flex justify-center pointer-events-none">
        <span className="px-1.5 sm:px-2 py-0.2 sm:py-0.5 bg-amber-800 text-amber-50 text-[10px] sm:text-[11px] font-bold rounded-full shadow-md border border-amber-600 whitespace-nowrap">
          1捆 = 10根
        </span>
      </div>

      {/* Double click hint tooltip on hover */}
      {showHint && (
        <div className="absolute -top-6 inset-x-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden sm:flex">
          <span className="px-2 py-0.5 bg-slate-900/90 text-white text-[10px] sm:text-[11px] rounded shadow whitespace-nowrap">
            双击或点右上角拆开
          </span>
        </div>
      )}
    </div>
  );
};
