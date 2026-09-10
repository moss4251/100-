import React from 'react';
import { Scissors, Trash2, CheckCircle2, SquareDashed } from 'lucide-react';

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
    <div className="relative select-none">
      <button
        id="delete-mode-toggle-btn"
        onClick={onToggle}
        className={`relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all duration-200 cursor-pointer border ${
          isActive
            ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-700 ring-4 ring-rose-300/60 scale-102'
            : 'bg-white/95 hover:bg-rose-50/90 text-rose-700 border-rose-300 hover:border-rose-400'
        }`}
        title="单击进入删除模式，在画板上框选木棍进行隐去/减去"
      >
        <div className={`p-1 rounded-lg ${isActive ? 'bg-rose-700 text-white' : 'bg-rose-100 text-rose-600'}`}>
          <SquareDashed className={`w-5 h-5 ${isActive ? 'animate-pulse' : ''}`} />
        </div>

        <div className="flex flex-col items-start text-left">
          <div className="flex items-center gap-1.5">
            <span className="leading-tight text-xs sm:text-sm">
              {isActive ? '删除框选模式开启中' : '减法删除框'}
            </span>
            {isActive && (
              <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping" />
            )}
          </div>
          <span className={`text-[11px] font-normal leading-tight ${isActive ? 'text-rose-100' : 'text-slate-500'}`}>
            {isActive ? '拖动框选木棍即可隐去' : '单击此框进入删除模式'}
          </span>
        </div>

        {isActive ? (
          <CheckCircle2 className="w-4 h-4 ml-1 text-rose-200" />
        ) : (
          <Scissors className="w-4 h-4 ml-1 text-rose-400" />
        )}
      </button>

      {/* Floating tooltip badge when active */}
      {isActive && (
        <div className="absolute -bottom-7 right-0 left-auto sm:left-0 sm:right-auto px-2 py-0.5 bg-rose-900 text-rose-50 text-[11px] font-medium rounded shadow-md whitespace-nowrap z-30 pointer-events-none animate-bounce">
          ✂️ 按住鼠标在画板上拉框，框中即隐去！再次单击退出
        </div>
      )}
    </div>
  );
};
