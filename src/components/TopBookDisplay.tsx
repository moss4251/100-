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

  // Flatten every single book unit for 1-to-1 correspondence
  // Bundles generate 10 individual books each; single sticks generate 1 individual book
  const booksList = useMemo(() => {
    const list: Array<{
      id: string;
      sourceId: string;
      isBundlePart: boolean;
      bundleIndex?: number;
      isDeleting?: boolean;
    }> = [];

    // All bundle books
    items
      .filter((i) => i.type === 'bundle')
      .forEach((b) => {
        for (let idx = 0; idx < 10; idx++) {
          list.push({
            id: `book-${b.id}-${idx}`,
            sourceId: b.id,
            isBundlePart: true,
            bundleIndex: idx,
            isDeleting: b.isDeleting,
          });
        }
      });

    // All single stick books
    items
      .filter((i) => i.type === 'stick')
      .forEach((s) => {
        list.push({
          id: `book-${s.id}`,
          sourceId: s.id,
          isBundlePart: false,
          isDeleting: s.isDeleting,
        });
      });

    return list;
  }, [items]);

  return (
    <header
      id="top-book-header"
      className="w-full bg-white/92 backdrop-blur-md border-b border-amber-900/10 shadow-xs px-3 sm:px-5 py-2.5 z-30 select-none transition-all"
    >
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Left: Library Indicator & Live Synced Count */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-700 shadow-xs">
            <BookOpen className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold tracking-wider text-amber-900/70">
                二年级数学 · 退位减法直观演示
              </span>
              {deletedCountSinceStart > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-red-100 text-red-700 px-2 py-0.5 rounded-full animate-fadeIn">
                  已减去 {deletedCountSinceStart} 本图书
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-sm sm:text-base font-bold text-slate-700">
                当前图书总数：
              </span>
              <motion.span
                key={totalCount}
                initial={{ scale: 1.3, color: '#dc2626' }}
                animate={{ scale: 1, color: '#1e293b' }}
                transition={{ type: 'spring', stiffness: 450, damping: 22 }}
                className="text-2xl sm:text-3xl font-black tracking-tight"
              >
                {totalCount}
              </motion.span>
              <span className="text-xs font-semibold text-slate-500">本</span>

              {/* Tens and Ones breakdown badge */}
              <div className="hidden sm:flex items-center gap-1.5 ml-3 px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-200 text-xs">
                <span className="text-amber-800 font-bold flex items-center gap-1">
                  <Layers className="w-3 h-3 text-amber-600" />
                  {bundleCount}捆({bundleCount * 10}本)
                </span>
                <span className="text-amber-300 font-bold">+</span>
                <span className="text-orange-800 font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-orange-600" />
                  {singleCount}根({singleCount}本)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: EXACT 1-to-1 BOOK ICONS DISPLAY (一一对应产生与隐去) */}
        <div className="flex-1 min-w-0 bg-amber-50/70 border border-amber-200/80 rounded-xl px-3 py-2 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-900">
              <span>📚 图书标志库（与画板木棒 1:1 一一对应）：</span>
              <span className="text-slate-500 font-normal">
                共 {totalCount} 本
              </span>
            </div>
            <span className="text-[10px] text-amber-700/80">
              减去/隐去木棒时，对应书本同步隐去
            </span>
          </div>

          {/* Book Shelf / Rack showing every single book icon 1-to-1 */}
          <div className="max-h-24 overflow-y-auto overflow-x-auto scrollbar-thin scrollbar-thumb-amber-300 py-1">
            {totalCount === 0 ? (
              <div className="py-2 text-center text-xs text-slate-400 italic">
                画板上暂无木棒，请从左下角拖出木捆或木棍
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
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
                        y: bItem.isDeleting ? -12 : 0,
                      }}
                      exit={{ scale: 0, opacity: 0, y: -12 }}
                      transition={{ duration: 0.25 }}
                      className={`flex items-center p-1 rounded-lg border bg-white/90 shadow-2xs transition-all ${
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
                              className={`w-2.5 h-6 sm:w-3 sm:h-7 rounded-xs border shadow-2xs flex flex-col justify-between items-center py-0.5 ${col.bg} ${col.border}`}
                            >
                              <div className={`w-1.5 h-[1px] ${col.line}`} />
                              <div className={`w-1.5 h-[1px] ${col.line}`} />
                            </div>
                          );
                        })}
                      </div>
                      <span className="ml-1 text-[9px] font-black text-amber-800 bg-amber-100 px-1 py-0.2 rounded leading-none">
                        10本
                      </span>
                    </motion.div>
                  ))}

                {/* 2. Loose Single Books for Single Sticks (每根单棍对应1本独立图书) */}
                {items.some((it) => it.type === 'stick') && (
                  <div className="flex items-center gap-1 pl-1 border-l border-amber-300/80">
                    <AnimatePresence>
                      {items
                        .filter((it) => it.type === 'stick')
                        .map((sItem, sIdx) => {
                          const col = bookColors[sIdx % bookColors.length];
                          return (
                            <motion.div
                              key={sItem.id}
                              initial={{ scale: 0, opacity: 0, y: 10 }}
                              animate={{
                                scale: sItem.isDeleting ? 0 : 1,
                                opacity: sItem.isDeleting ? 0 : 1,
                                y: sItem.isDeleting ? -15 : 0,
                              }}
                              exit={{ scale: 0, opacity: 0, y: -15 }}
                              transition={{ duration: 0.25 }}
                              title="1根单木棍对应1本独立图书"
                              className={`w-2.5 h-6 sm:w-3 sm:h-7 rounded-xs border shadow-2xs flex flex-col justify-between items-center py-0.5 cursor-default ${col.bg} ${col.border}`}
                            >
                              <div className={`w-1.5 h-[1px] ${col.line}`} />
                              <div className={`w-1.5 h-[1px] ${col.line}`} />
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
