import React from 'react';
import { MathProblem, BoardItem } from '../types';
import {
  Shuffle,
  CheckCircle2,
  Sparkles,
  LayoutGrid,
  Trash2,
} from 'lucide-react';
import { playPopSound } from '../utils/audio';
import { CheckResultData } from './FloatingToast';

interface MathProblemBarProps {
  currentProblem: MathProblem | null;
  onNewProblem: () => void;
  onAutoSetupMinuend: () => void;
  onClear: () => void;
  onTidy: () => void;
  items: BoardItem[];
  deletedCount: number;
  checkResult: CheckResultData | null;
  onCheck: () => void;
}

export const MathProblemBar: React.FC<MathProblemBarProps> = ({
  currentProblem,
  onNewProblem,
  onAutoSetupMinuend,
  onClear,
  onTidy,
  checkResult,
  onCheck,
}) => {
  return (
    <div className="w-full flex items-center justify-between gap-2">
      {/* Left: Math Equation Display */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-1 shadow-2xs">
          <span className="text-xs font-black text-amber-900 tracking-wide">
            算式：
          </span>
          {currentProblem ? (
            <div className="flex items-baseline gap-1 text-amber-950 font-black">
              <span className="text-xl md:text-2xl font-mono text-amber-800">
                {currentProblem.a}
              </span>
              <span className="text-base text-amber-600 font-sans">－</span>
              <span className="text-xl md:text-2xl font-mono text-rose-700">
                {currentProblem.b}
              </span>
              <span className="text-base text-amber-600 font-sans">＝</span>
              <span className="text-xl md:text-2xl font-mono px-2 py-0.2 rounded-lg bg-white border border-amber-300 text-amber-900 min-w-[36px] text-center shadow-inner">
                {checkResult?.status === 'success' ? currentProblem.diff : '？'}
              </span>
            </div>
          ) : (
            <span className="text-xs text-amber-800/80 italic">
              点击右侧按钮随机生成算式
            </span>
          )}
        </div>

        {/* Random Question Button */}
        <button
          id="btn-random-problem"
          onClick={() => {
            onNewProblem();
            playPopSound();
          }}
          className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer shrink-0"
          title="随机生成一道100以内的退位减法题目"
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span>随机出题</span>
        </button>

        {/* Helper: Auto Setup Minuend (一键摆放被减数) */}
        {currentProblem && (
          <button
            id="btn-auto-setup-minuend"
            onClick={onAutoSetupMinuend}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 active:bg-amber-300 text-amber-900 rounded-xl font-bold text-xs border border-amber-300 shadow-2xs transition-all cursor-pointer shrink-0"
            title={`在画板上自动摆放被减数 ${currentProblem.a} 根小棒`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>摆放被减数({currentProblem.a})</span>
          </button>
        )}
      </div>

      {/* Right: Action Buttons */}
      <div className="flex items-center gap-1.5">
        {/* Check Student's Operation Button */}
        <button
          id="btn-check-operation"
          onClick={onCheck}
          className="flex items-center gap-1 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer"
          title="检查画板上的操作与算式是否匹配"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>检查操作</span>
        </button>

        {/* Tidy button */}
        <button
          id="btn-tidy-board"
          onClick={onTidy}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
          title="整理并对齐画板上的所有小棒"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-slate-500" />
          <span>整理排列</span>
        </button>

        {/* Clear board button */}
        <button
          id="btn-clear-board"
          onClick={onClear}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-red-200 bg-red-50/70 hover:bg-red-100 text-red-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
          title="清空画板上的所有木棒与捆绳"
        >
          <Trash2 className="w-3.5 h-3.5 text-red-500" />
          <span>清空</span>
        </button>
      </div>
    </div>
  );
};
