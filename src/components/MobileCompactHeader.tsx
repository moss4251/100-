import React, { useState } from 'react';
import { MathProblem, BoardItem } from '../types';
import {
  Sparkles,
  Shuffle,
  PackagePlus,
  CheckCircle2,
  Trash2,
  MoreVertical,
  Volume2,
  VolumeX,
  Sliders,
  RotateCcw,
  BookOpen,
} from 'lucide-react';

interface MobileCompactHeaderProps {
  currentProblem: MathProblem | null;
  items: BoardItem[];
  deletedCount: number;
  isDeleteModeActive: boolean;
  soundOn: boolean;
  bgOpacity: number;
  onToggleDeleteMode: () => void;
  onNewProblem: () => void;
  onAutoSetupMinuend: () => void;
  onCheck: () => void;
  onClear: () => void;
  onTidy: () => void;
  onToggleSound: () => void;
  onChangeBgOpacity: (val: number) => void;
  onOpenBookShelf: () => void;
}

export const MobileCompactHeader: React.FC<MobileCompactHeaderProps> = ({
  currentProblem,
  items,
  deletedCount,
  isDeleteModeActive,
  soundOn,
  bgOpacity,
  onToggleDeleteMode,
  onNewProblem,
  onAutoSetupMinuend,
  onCheck,
  onClear,
  onTidy,
  onToggleSound,
  onChangeBgOpacity,
  onOpenBookShelf,
}) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const bundleCount = items.filter((i) => i.type === 'bundle' && !i.isDeleting).length;
  const singleCount = items.filter((i) => i.type === 'stick' && !i.isDeleting).length;
  const totalSticks = bundleCount * 10 + singleCount;

  return (
    <header
      id="mobile-compact-header"
      className="w-full bg-white/95 backdrop-blur-md border-b border-amber-900/15 shadow-xs px-2 py-1.5 z-30 select-none flex items-center justify-between gap-1.5 h-12"
    >
      {/* 1. Left: Equation & Book Count Capsule */}
      <div className="flex items-center gap-1.5 min-w-0">
        {/* Math Equation */}
        {currentProblem ? (
          <div
            onClick={onNewProblem}
            title="点击可换一题"
            className="flex items-baseline gap-0.5 bg-amber-100/70 active:bg-amber-200 border border-amber-300 rounded-lg px-2 py-0.5 cursor-pointer shrink-0 transition-colors"
          >
            <span className="text-sm font-black font-mono text-amber-950">
              {currentProblem.a}
            </span>
            <span className="text-xs font-bold text-amber-700">－</span>
            <span className="text-sm font-black font-mono text-rose-700">
              {currentProblem.b}
            </span>
            <span className="text-xs font-bold text-amber-700">＝</span>
            <span className="text-sm font-black font-mono text-amber-900">
              ？
            </span>
          </div>
        ) : null}

        {/* Live Book Count (Click to open full 1:1 shelf modal) */}
        <button
          onClick={onOpenBookShelf}
          title="点击查看 1:1 图书对应架"
          className="flex items-center gap-1 bg-amber-500 text-white font-bold text-xs px-2 py-1 rounded-lg shadow-2xs active:scale-95 transition-transform shrink-0"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>{totalSticks}本</span>
          {deletedCount > 0 && (
            <span className="text-[10px] bg-rose-600 px-1 py-0.2 rounded font-normal">
              -{deletedCount}
            </span>
          )}
        </button>
      </div>

      {/* 2. Right: Action Buttons Group */}
      <div className="flex items-center gap-1 shrink-0">
        {/* New Problem */}
        <button
          onClick={onNewProblem}
          title="随机换一题"
          className="p-1.5 rounded-lg bg-amber-50 active:bg-amber-100 text-amber-900 border border-amber-200 flex items-center justify-center cursor-pointer"
        >
          <Shuffle className="w-3.5 h-3.5" />
        </button>

        {/* Auto Setup Minuend */}
        <button
          onClick={onAutoSetupMinuend}
          title="摆放被减数木棒"
          className="flex items-center gap-0.5 px-2 py-1 bg-amber-600 active:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-2xs cursor-pointer"
        >
          <PackagePlus className="w-3.5 h-3.5" />
          <span>摆放</span>
        </button>

        {/* Check Answer */}
        <button
          onClick={onCheck}
          title="检查算式与操作"
          className="flex items-center gap-0.5 px-2 py-1 bg-emerald-600 active:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-2xs cursor-pointer"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>检查</span>
        </button>

        {/* Delete Box Tool Toggle */}
        <button
          onClick={onToggleDeleteMode}
          title={isDeleteModeActive ? '退出删除模式' : '进入拉框删除模式'}
          className={`p-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center gap-0.5 ${
            isDeleteModeActive
              ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
              : 'bg-white text-rose-700 border-rose-300 active:bg-rose-50'
          }`}
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{isDeleteModeActive ? '退删' : '删'}</span>
        </button>

        {/* More Actions Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowMoreMenu((prev) => !prev)}
            className="p-1.5 rounded-lg bg-slate-100 active:bg-slate-200 text-slate-700 border border-slate-300 cursor-pointer"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>

          {/* More Actions Dropdown */}
          {showMoreMenu && (
            <div
              className="absolute right-0 top-10 w-48 bg-white rounded-xl shadow-2xl border border-amber-200 p-2 z-50 text-xs space-y-1.5"
              onClick={() => setShowMoreMenu(false)}
            >
              <button
                onClick={onTidy}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-amber-50 text-slate-800 text-left cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>整理排列木棒</span>
              </button>

              <button
                onClick={onClear}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 text-rose-700 text-left cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-rose-600" />
                <span>清空画板</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenBookShelf();
                  setShowMoreMenu(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-amber-50 text-amber-900 text-left cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-amber-600" />
                <span>查看1:1图书架</span>
              </button>

              <div className="h-[1px] bg-slate-100 my-1" />

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSound();
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-50 text-slate-700 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  {soundOn ? <Volume2 className="w-4 h-4 text-amber-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                  <span>音效反馈</span>
                </span>
                <span className="font-bold text-amber-800">{soundOn ? '开' : '关'}</span>
              </button>

              <div
                className="px-2.5 py-1.5"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between text-[11px] text-slate-600 mb-1">
                  <span className="flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-amber-600" />
                    <span>背景透明度</span>
                  </span>
                  <span className="font-mono text-amber-800">{Math.round(bgOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.80"
                  step="0.05"
                  value={bgOpacity}
                  onChange={(e) => onChangeBgOpacity(parseFloat(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer h-1.5"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
