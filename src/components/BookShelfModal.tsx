import React from 'react';
import { BoardItem } from '../types';
import { X, BookOpen, Layers, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BookShelfModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: BoardItem[];
  deletedCountSinceStart?: number;
}

export const BookShelfModal: React.FC<BookShelfModalProps> = ({
  isOpen,
  onClose,
  items,
  deletedCountSinceStart = 0,
}) => {
  const bookColors = [
    { bg: 'bg-sky-500', border: 'border-sky-600', line: 'bg-sky-200' },
    { bg: 'bg-emerald-500', border: 'border-emerald-600', line: 'bg-emerald-200' },
    { bg: 'bg-amber-500', border: 'border-amber-600', line: 'bg-amber-200' },
    { bg: 'bg-rose-500', border: 'border-rose-600', line: 'bg-rose-200' },
    { bg: 'bg-indigo-500', border: 'border-indigo-600', line: 'bg-indigo-200' },
    { bg: 'bg-teal-500', border: 'border-teal-600', line: 'bg-teal-200' },
    { bg: 'bg-violet-500', border: 'border-violet-600', line: 'bg-violet-200' },
    { bg: 'bg-orange-500', border: 'border-orange-600', line: 'bg-orange-200' },
  ];

  const bundleItems = items.filter((i) => i.type === 'bundle' && !i.isDeleting);
  const stickItems = items.filter((i) => i.type === 'stick' && !i.isDeleting);
  const bundleCount = bundleItems.length;
  const singleCount = stickItems.length;
  const totalCount = bundleCount * 10 + singleCount;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/40 backdrop-blur-xs">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="w-full max-w-lg bg-white/98 rounded-2xl shadow-2xl border-2 border-amber-300 overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-amber-50 border-b border-amber-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-800 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-950">图书标志对应架 (1:1 对应)</h3>
                <p className="text-[11px] text-amber-800/80">画板上的每一捆木棒对应10本书，每根单木棍对应1本书</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-amber-200/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Counts Bar */}
          <div className="px-4 py-2.5 bg-amber-100/40 border-b border-amber-100 flex items-center justify-between text-xs">
            <div className="flex items-baseline gap-1 font-bold text-slate-800">
              <span>当前对应图书：</span>
              <span className="text-xl font-black text-amber-900">{totalCount}</span>
              <span>本</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-md font-medium">
                <Layers className="w-3 h-3" /> {bundleCount} 捆 ({bundleCount * 10}本)
              </span>
              <span className="inline-flex items-center gap-1 bg-orange-200/80 text-orange-950 px-2 py-0.5 rounded-md font-medium">
                <Sparkles className="w-3 h-3" /> {singleCount} 根 ({singleCount}本)
              </span>
              {deletedCountSinceStart > 0 && (
                <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md font-medium">
                  已减除 {deletedCountSinceStart} 本
                </span>
              )}
            </div>
          </div>

          {/* Shelf Body */}
          <div className="p-4 overflow-y-auto max-h-72 space-y-3">
            {totalCount === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                画板暂无木棒，请拖出木捆/木棍或点击上方“摆放被减数”
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Bundled Books */}
                {bundleItems.map((bItem, bIdx) => (
                  <div
                    key={bItem.id}
                    className="flex items-center p-1.5 rounded-xl border border-amber-300 bg-amber-50/50 shadow-2xs"
                  >
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 10 }).map((_, i) => {
                        const col = bookColors[(bIdx * 3 + i) % bookColors.length];
                        return (
                          <div
                            key={`b-${bItem.id}-${i}`}
                            className={`w-2.5 h-7 rounded-xs border shadow-2xs flex flex-col justify-between items-center py-0.5 ${col.bg} ${col.border}`}
                          >
                            <div className={`w-1.5 h-[1px] ${col.line}`} />
                            <div className={`w-1.5 h-[1px] ${col.line}`} />
                          </div>
                        );
                      })}
                    </div>
                    <span className="ml-1.5 text-[10px] font-black text-amber-900 bg-amber-200/80 px-1 py-0.2 rounded">
                      第{bIdx + 1}捆(10本)
                    </span>
                  </div>
                ))}

                {/* Loose Single Books */}
                {stickItems.length > 0 && (
                  <div className="w-full pt-2 border-t border-amber-100">
                    <div className="text-[11px] font-bold text-orange-900 mb-1.5 flex items-center gap-1">
                      <span>散本图书 ({stickItems.length}本，与单根小棒1:1对应)：</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {stickItems.map((sItem, sIdx) => {
                        const col = bookColors[sIdx % bookColors.length];
                        return (
                          <div
                            key={sItem.id}
                            className={`w-2.5 h-7 rounded-xs border shadow-2xs flex flex-col justify-between items-center py-0.5 ${col.bg} ${col.border}`}
                            title={`单本图书 #${sIdx + 1}`}
                          >
                            <div className={`w-1.5 h-[1px] ${col.line}`} />
                            <div className={`w-1.5 h-[1px] ${col.line}`} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-amber-50/50 border-t border-amber-200/60 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            >
              返回画板继续操作
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
