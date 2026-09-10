import React, { useState } from 'react';
import { BundleGraphic } from './BundleGraphic';
import { StickGraphic } from './StickGraphic';
import { Plus, Copy, ChevronLeft, ChevronRight } from 'lucide-react';

interface SpawnerDockProps {
  onStartDrag: (type: 'bundle' | 'stick', clientX: number, clientY: number) => void;
  onSpawnDirectly: (type: 'bundle' | 'stick') => void;
  disabled?: boolean;
}

export const SpawnerDock: React.FC<SpawnerDockProps> = ({
  onStartDrag,
  onSpawnDirectly,
  disabled = false,
}) => {
  // Mobile collapsed state to give maximum room to children
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      id="infinite-spawner-dock"
      className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 z-20 select-none transition-all duration-200"
      style={{ touchAction: 'none' }}
    >
      {isCollapsed ? (
        /* Collapsed pill on mobile/desktop */
        <button
          onClick={() => setIsCollapsed(false)}
          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold px-2.5 py-1.5 rounded-full shadow-lg border border-amber-300 text-xs cursor-pointer active:scale-95 transition-transform"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>木棒补给</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      ) : (
        /* Expanded Spawner Card */
        <div className="bg-white/95 backdrop-blur-md border-2 border-amber-400/80 rounded-xl sm:rounded-2xl p-1.5 sm:p-3 shadow-xl">
          <div className="flex items-center justify-between gap-1 mb-1 pb-1 border-b border-amber-200/80">
            <div className="flex items-center gap-1">
              <Copy className="w-3 h-3 text-amber-700" />
              <span className="text-[10px] sm:text-xs font-bold text-amber-950">木棒补给站</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[8px] sm:text-[9px] bg-amber-100 text-amber-800 font-medium px-1 py-0.2 rounded-full">
                点/拖
              </span>
              <button
                onClick={() => setIsCollapsed(true)}
                title="收起补给站，让出更多画板空间"
                className="text-slate-400 hover:text-slate-700 p-0.5 rounded hover:bg-amber-100 cursor-pointer"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Infinite Bundle Spawner */}
            <div
              id="infinite-bundle-source"
              className="flex flex-col items-center group cursor-grab active:cursor-grabbing touch-none"
              title="按住并拖动或点击复制出一捆木棒（10根）"
              onPointerDown={(e) => {
                if (disabled) return;
                e.preventDefault();
                onStartDrag('bundle', e.clientX, e.clientY);
              }}
              onClick={(e) => {
                if (!disabled && e.detail === 1) {
                  onSpawnDirectly('bundle');
                }
              }}
            >
              <div className="relative p-1 rounded-lg border border-dashed border-amber-400 bg-amber-50/80 group-hover:bg-amber-100/90 group-hover:border-amber-600 transition-all shadow-inner flex items-center justify-center">
                <BundleGraphic showHint={false} className="pointer-events-none scale-60 sm:scale-90 origin-center" />
                <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <Plus className="w-2.5 h-2.5" />
                </div>
              </div>
              <span className="mt-0.5 text-[9px] sm:text-[11px] font-bold text-amber-900 group-hover:text-amber-700 whitespace-nowrap">
                木捆(10根)
              </span>
            </div>

            {/* Infinite Stick Spawner */}
            <div
              id="infinite-stick-source"
              className="flex flex-col items-center group cursor-grab active:cursor-grabbing touch-none"
              title="按住并拖动或点击复制出一根单木棍（1根）"
              onPointerDown={(e) => {
                if (disabled) return;
                e.preventDefault();
                onStartDrag('stick', e.clientX, e.clientY);
              }}
              onClick={(e) => {
                if (!disabled && e.detail === 1) {
                  onSpawnDirectly('stick');
                }
              }}
            >
              <div className="relative p-1 w-9 sm:w-14 h-14 sm:h-24 flex items-center justify-center rounded-lg border border-dashed border-amber-400 bg-amber-50/80 group-hover:bg-amber-100/90 group-hover:border-amber-600 transition-all shadow-inner">
                <StickGraphic className="pointer-events-none scale-60 sm:scale-90 origin-center" />
                <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-xs">
                  <Plus className="w-2.5 h-2.5" />
                </div>
              </div>
              <span className="mt-0.5 text-[9px] sm:text-[11px] font-bold text-orange-950 group-hover:text-orange-700 whitespace-nowrap">
                木棍(1根)
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
