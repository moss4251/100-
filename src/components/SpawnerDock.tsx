import React from 'react';
import { BundleGraphic } from './BundleGraphic';
import { StickGraphic } from './StickGraphic';
import { Plus, Copy } from 'lucide-react';

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
  return (
    <div
      id="infinite-spawner-dock"
      className="absolute bottom-4 left-4 z-20 bg-white/92 backdrop-blur-md border-2 border-amber-400/80 rounded-2xl p-3 shadow-xl select-none"
    >
      <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-amber-200/80">
        <div className="flex items-center gap-1.5">
          <Copy className="w-3.5 h-3.5 text-amber-700" />
          <span className="text-xs font-bold text-amber-950">
            木棒补给站 · 无限复制
          </span>
        </div>
        <span className="text-[10px] bg-amber-100 text-amber-800 font-medium px-1.5 py-0.5 rounded-full">
          按住拖出
        </span>
      </div>

      <div className="flex items-end gap-5">
        {/* Infinite Bundle Spawner */}
        <div
          id="infinite-bundle-source"
          className="flex flex-col items-center group cursor-grab active:cursor-grabbing"
          title="按住并拖动可复制出一捆木棒（10根）"
          onPointerDown={(e) => {
            if (disabled) return;
            e.preventDefault();
            onStartDrag('bundle', e.clientX, e.clientY);
          }}
          onClick={(e) => {
            // Also allow click-to-add for accessibility
            if (!disabled && e.detail === 1) {
              onSpawnDirectly('bundle');
            }
          }}
        >
          <div className="relative p-2 rounded-xl border border-dashed border-amber-400 bg-amber-50/70 group-hover:bg-amber-100/80 group-hover:border-amber-600 transition-all shadow-inner">
            <BundleGraphic showHint={false} className="pointer-events-none scale-90 sm:scale-95" />
            <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Plus className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="mt-1.5 text-xs font-bold text-amber-900 group-hover:text-amber-700">
            木捆 (10根)
          </span>
          <span className="text-[10px] text-slate-500">拖动复制</span>
        </div>

        {/* Infinite Stick Spawner */}
        <div
          id="infinite-stick-source"
          className="flex flex-col items-center group cursor-grab active:cursor-grabbing"
          title="按住并拖动可复制出一根单木棍（1根）"
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
          <div className="relative p-3 w-16 h-28 flex items-center justify-center rounded-xl border border-dashed border-amber-400 bg-amber-50/70 group-hover:bg-amber-100/80 group-hover:border-amber-600 transition-all shadow-inner">
            <StickGraphic className="pointer-events-none scale-90 sm:scale-95" />
            <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-xs">
              <Plus className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="mt-1.5 text-xs font-bold text-orange-950 group-hover:text-orange-700">
            木棍 (1根)
          </span>
          <span className="text-[10px] text-slate-500">拖动复制</span>
        </div>
      </div>
    </div>
  );
};
