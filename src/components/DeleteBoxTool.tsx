import React from 'react';
import { Scissors, CheckCircle2, SquareDashed } from 'lucide-react';

interface DeleteBoxToolProps {
  isActive: boolean;
  onToggle: () => void;
  selectedCount?: number;
}

export const DeleteBoxTool: React.FC<DeleteBoxToolProps> = ({
  isActive,
  onToggle,
  selectedCount = 0,
}) => {
  return (
    <div className="relative select-none shrink-0">
      <button
        id="delete-mode-toggle-btn"
        onClick={onToggle}
        className={`relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl font-bold text-xs sm:text-sm shadow-xs hover:shadow-sm transition-all duration-200 cursor-pointer border ${
          isActive
            ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-700 ring-2 sm:ring-4 ring-rose-300/60 scale-[1.02]'
            : 'bg-white/95 hover:bg-rose-50/90 text-rose-700 border-rose-300 hover:border-rose-400'
        }`}
        title="单击进入删除模式，在画板上框选木棍进行隐去/减去"
      >
        <div className={`p-1 rounded-lg ${isActive ? 'bg-rose-700 text-white' : 'bg-rose-100 text-rose-600'}`}>
          <SquareDashed className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'animate-pulse' : ''}`} />
        </div>

        <div className="flex flex-col items-start text-left">
          <div className="flex items-center gap-1">
            <span className="leading-tight text-xs font-bold">
              {isActive ? '删除模式中' : '减法删除框'}
            </span>
            {isActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-ping" />
            )}
          </div>
          <span className={`text-[9px] sm:text-[10px] font-normal leading-tight hidden xs:inline ${isActive ? 'text-rose-100' : 'text-slate-500'}`}>
            {isActive ? '框选木棍即隐去' : '单击开启'}
          </span>
        </div>

        {isActive ? (
          <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-200 ml-0.5" />
        ) : (
          <Scissors className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400 ml-0.5" />
        )}
      </button>

      {/* Floating tooltip badge when active */}
      {isActive && (
        <div className="absolute -bottom-6 right-0 sm:left-0 sm:right-auto px-2 py-0.5 bg-rose-900 text-rose-50 text-[10px] sm:text-[11px] font-medium rounded shadow-md whitespace-nowrap z-30 pointer-events-none">
          ✂️ 在画板上拉框，木棍即隐去！再点退出
        </div>
      )}
    </div>
  );
};
