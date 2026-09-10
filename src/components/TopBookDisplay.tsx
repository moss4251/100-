import React, { useMemo } from 'react';
import { BookOpen, Layers, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BoardItem } from '../types';

interface TopBookDisplayProps {
  items: BoardItem[];
  deletedCountSinceStart?: number;
}

export const TopBookDisplay: React.FC<TopBookDisplayProps> = ({
  items,
  deletedCountSinceStart = 0,
}) => {
  // Vibrant, friendly palette for books
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

  // Derive counts
  const bundleItems = useMemo(
    () => items.filter((i) => i.type === 'bundle' && !i.isDeleting),
    [items]
  );
  const stickItems = useMemo(
    () => items.filter((i) => i.type === 'stick' && !i.isDeleting),
    [items]
  );

  const bundleCount = bundleItems.length;
  const singleCount = stickItems.length;
  const totalCount = bundleCount * 10 + singleCount;

  return (
    <header
      id="top-book-header"
      className="w-full bg-white/92 backdrop-blur-md border-b border-amber-900/10 shadow-xs px-2.5 sm:px-5 py-1.5 sm:py-2.5 z-30 select-none transition-all"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-1.5 sm:gap-3">
        {/* Left: Library Indicator & Live Synced Count */}
        <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-700 shadow-xs shrink-0">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] sm:text-xs font-semibold tracking-wider text-amber-900/70">
                  二年级数学 · 退位减法
                </span>
                {deletedCountSinceStart > 0 && (
                  <span className="inline-flex items-center text-[10px] sm:text-[11px] font-medium bg-red-100 text-red-700 px-1.5 py-0.2 rounded-full animate-fadeIn">
                    已减 {deletedCountSinceStart} 本
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-1.5 sm:gap-2">
                <span className="text-xs sm:text-sm md:text-base font-bold text-slate-700">
                  当前图书：
                </span>
                <motion.span
                  key={totalCount}
                  initial={{ scale: 1.25, color: '#dc2626' }}
                  animate={{ scale: 1, color: '#1e293b' }}
                  transition={{ type: 'spring', stiffness: 450, damping: 22 }}
                  className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight"
                >
                  {totalCount}
                </motion.span>
                <span className="text-xs font-semibold text-slate-500">本</span>

                {/* Tens and Ones breakdown badge */}
                <div className="flex items-center gap-1 ml-1.5 sm:ml-3 px-1.5 sm:px-2 py-0.2 rounded-md sm:rounded-lg bg-amber-50 border border-amber-200 text-[10px] sm:text-xs">
                  <span className="text-amber-800 font-bold flex items-center gap-0.5">
                    <Layers className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-600" />
                    <span>{bundleCount}捆</span>
                    <span className="hidden sm:inline">({bundleCount * 10}本)</span>
                  </span>
                  <span className="text-amber-300 font-bold">+</span>
                  <span className="text-orange-800 font-bold flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-orange-600" />
                    <span>{singleCount}根</span>
                    <span className="hidden sm:inline">({singleCount}本)</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: EXACT 1-to-1 BOOK ICONS DISPLAY (一一对应产生与隐去) */}
        <div className="flex-1 min-w-0 bg-amber-50/70 border border-amber-200/80 rounded-xl px-2.5 sm:px-3 py-1 sm:py-1.5 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-amber-900">
              <span className="hidden sm:inline">📚 图书标志库（与画板木棒 1:1 一一对应）：</span>
              <span className="sm:hidden">📚 图书标志 (1:1对应)：</span>
              <span className="text-slate-500 font-normal">
                共 {totalCount} 本
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] text-amber-700/80 hidden xs:inline">
              框选减除木棒，书本同步隐去
            </span>
          </div>

          {/* Book Shelf / Rack showing every single book icon 1-to-1 */}
          <div className="max-h-16 sm:max-h-22 overflow-y-auto overflow-x-auto scrollbar-thin scrollbar-thumb-amber-300 py-0.5">
            {totalCount === 0 ? (
              <div className="py-1 text-center text-[11px] sm:text-xs text-slate-400 italic">
                画板暂无木棒，请拖出木捆/木棍或点击上方“摆放被减数”
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {/* 1. Bundled Books Grouped in 10s (每捆对应10本一组) */}
                {items
                  .filter((it) => it.type === 'bundle')
                  .map((bItem, bIdx) => (
                    <motion.div
                      key={bItem.id}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{
                        scale: bItem.isDeleting ? 0.3 : 1,
                        opacity: bItem.isDeleting ? 0 : 1,
                        y: bItem.isDeleting ? -10 : 0,
                      }}
                      exit={{ scale: 0, opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                      className={`flex items-center p-0.5 sm:p-1 rounded-md sm:rounded-lg border bg-white/90 shadow-2xs transition-all shrink-0 ${
                        bItem.isDeleting
                          ? 'border-red-400 bg-red-50'
                          : 'border-amber-300 hover:border-amber-400'
                      }`}
                      title={`第 ${bIdx + 1} 捆木棒对应的整套10本图书`}
                    >
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 10 }).map((_, i) => {
                          const col = bookColors[(bIdx * 3 + i) % bookColors.length];
                          return (
                            <div
                              key={`b-${bItem.id}-${i}`}
                              className={`w-2 h-5 sm:w-2.5 sm:h-6 md:w-3 md:h-7 rounded-xs border shadow-2xs flex flex-col justify-between items-center py-0.5 ${col.bg} ${col.border}`}
                            >
                              <div className={`w-1 sm:w-1.5 h-[1px] ${col.line}`} />
                              <div className={`w-1 sm:w-1.5 h-[1px] ${col.line}`} />
                            </div>
                          );
                        })}
                      </div>
                      <span className="ml-1 text-[8px] sm:text-[9px] font-black text-amber-800 bg-amber-100 px-0.5 sm:px-1 py-0.2 rounded leading-none">
                        10
                      </span>
                    </motion.div>
                  ))}

                {/* 2. Loose Single Books for Single Sticks (每根单棍对应1本独立图书) */}
                {items.some((it) => it.type === 'stick') && (
                  <div className="flex items-center gap-0.5 sm:gap-1 pl-1 border-l border-amber-300/80 flex-wrap">
                    <AnimatePresence>
                      {items
                        .filter((it) => it.type === 'stick')
                        .map((sItem, sIdx) => {
                          const col = bookColors[sIdx % bookColors.length];
                          return (
                            <motion.div
                              key={sItem.id}
                              initial={{ scale: 0, opacity: 0, y: 8 }}
                              animate={{
                                scale: sItem.isDeleting ? 0 : 1,
                                opacity: sItem.isDeleting ? 0 : 1,
                                y: sItem.isDeleting ? -12 : 0,
                              }}
                              exit={{ scale: 0, opacity: 0, y: -12 }}
                              transition={{ duration: 0.25 }}
                              title="1根单木棍对应1本独立图书"
                              className={`w-2 h-5 sm:w-2.5 sm:h-6 md:w-3 md:h-7 rounded-xs border shadow-2xs flex flex-col justify-between items-center py-0.5 cursor-default shrink-0 ${col.bg} ${col.border}`}
                            >
                              <div className={`w-1 sm:w-1.5 h-[1px] ${col.line}`} />
                              <div className={`w-1 sm:w-1.5 h-[1px] ${col.line}`} />
                            </motion.div>
                          );
                        })}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
