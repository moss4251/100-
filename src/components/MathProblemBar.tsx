import React, { useState } from 'react';
import { MathProblem, BoardItem } from '../types';
import {
  Shuffle,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RotateCcw,
  LayoutGrid,
  Trash2,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { playSuccessSound, playNoticeSound, playPopSound } from '../utils/audio';

interface MathProblemBarProps {
  currentProblem: MathProblem | null;
  onNewProblem: () => void;
  onAutoSetupMinuend: () => void;
  onClear: () => void;
  onTidy: () => void;
  items: BoardItem[];
  deletedCount: number;
}

export const MathProblemBar: React.FC<MathProblemBarProps> = ({
  currentProblem,
  onNewProblem,
  onAutoSetupMinuend,
  onClear,
  onTidy,
  items,
  deletedCount,
}) => {
  const [checkResult, setCheckResult] = useState<{
    status: 'success' | 'warning' | 'info';
    message: string;
    details?: string;
  } | null>(null);

  // Derive current items count
  const bundleCount = items.filter((i) => i.type === 'bundle' && !i.isDeleting).length;
  const singleCount = items.filter((i) => i.type === 'stick' && !i.isDeleting).length;
  const currentTotal = bundleCount * 10 + singleCount;
  const hasRopeOnBoard = items.some((i) => i.type === 'rope' && !i.isDeleting);

  // Check student operation against current problem
  const handleCheckOperation = () => {
    if (!currentProblem) {
      setCheckResult({
        status: 'info',
        message: '请先点击“随机出题”生成一道退位减法算式！',
      });
      playNoticeSound();
      return;
    }

    const { a, b, diff } = currentProblem;
    const uA = a % 10;
    const uB = b % 10;

    // Condition 1: Perfect Match
    if (currentTotal === diff && deletedCount === b) {
      setCheckResult({
        status: 'success',
        message: `🎉 检验完全正确！算式：${a} - ${b} = ${diff}`,
        details: `成功退位拆捆并移走了 ${b} 根木棒，剩余 ${diff} 根木棒与图书，完全对应！`,
      });
      playSuccessSound();
      return;
    }

    // Condition 2: Board is empty
    if (currentTotal === 0 && deletedCount === 0) {
      setCheckResult({
        status: 'warning',
        message: `画板为空！请先摆出被减数 ${a} 根木棒`,
        details: `可从左下角拖出 ${Math.floor(a / 10)} 捆和 ${uA} 根，或点击“一键摆放被减数”。`,
      });
      playNoticeSound();
      return;
    }

    // Condition 3: Total matches difference, but deletedCount was slightly different
    if (currentTotal === diff) {
      setCheckResult({
        status: 'success',
        message: `🌟 画板剩余数量完全正确！${a} - ${b} = ${diff}`,
        details: `画板上与上方图书刚好剩余 ${diff} 本，计算结果正确！`,
      });
      playSuccessSound();
      return;
    }

    // Condition 4: Currently on minuend setup (before subtraction)
    if (currentTotal === a && deletedCount === 0) {
      if (!hasRopeOnBoard) {
        setCheckResult({
          status: 'info',
          message: `被减数 ${a} 根木棒已摆好！单根有 ${uA} 根，不够减去 ${b} 的个位 ${uB} 根`,
          details: `请【双击任意 1 捆木棒】进行拆捆退位（破十），再用减法删除框移走 ${b} 根！`,
        });
      } else {
        setCheckResult({
          status: 'info',
          message: `已成功拆捆！散木棒已经足够减除`,
          details: `请开启右上角【减法删除框】，框选移走 ${b} 根木棒！`,
        });
      }
      playNoticeSound();
      return;
    }

    // Condition 5: Minuend not set up properly yet
    if (deletedCount === 0 && currentTotal !== a) {
      setCheckResult({
        status: 'warning',
        message: `当前画板有 ${currentTotal} 根木棒，与被减数 ${a} 不符`,
        details: `被减数是 ${a}，请增加或拿走多余的木棒，使总数恰好等于 ${a} 根。`,
      });
      playNoticeSound();
      return;
    }

    // Condition 6: Subtraction in progress, but amount subtracted is incorrect
    if (deletedCount > 0) {
      if (deletedCount < b) {
        setCheckResult({
          status: 'warning',
          message: `减去数量不足：已移走 ${deletedCount} 根，算式要求减去 ${b} 根`,
          details: `还需要用减法删除框再框选移走 ${b - deletedCount} 根木棒！`,
        });
      } else if (deletedCount > b) {
        setCheckResult({
          status: 'warning',
          message: `减去数量过多：已移走 ${deletedCount} 根，超出了要求减去的 ${b} 根`,
          details: `移走超出了 ${deletedCount - b} 根，请点击清空重做或调整木棒。`,
        });
      } else {
        // deletedCount === b, but remaining is not diff
        setCheckResult({
          status: 'warning',
          message: `已移走 ${b} 根，但当前剩余 ${currentTotal} 根，与差值 ${diff} 不符`,
          details: `请检查初始摆放的被减数是否恰好为 ${a} 根。`,
        });
      }
      playNoticeSound();
      return;
    }

    // Fallback info
    setCheckResult({
      status: 'info',
      message: `算式：${a} - ${b} = ${diff}，当前画板：${currentTotal} 根，已减：${deletedCount} 根`,
    });
    playNoticeSound();
  };

  return (
    <div
      id="math-problem-bar"
      className="w-full bg-white/90 backdrop-blur-md border-b border-amber-900/10 px-3 sm:px-6 py-2 z-20 select-none shadow-2xs"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5">
        {/* Left: Math Equation Display & Random Trigger */}
        <div className="flex items-center flex-wrap gap-2.5">
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-1.5 shadow-2xs">
            <span className="text-xs font-black text-amber-900 tracking-wide">
              退位减法算式：
            </span>
            {currentProblem ? (
              <div className="flex items-baseline gap-1.5 text-amber-950 font-black">
                <span className="text-xl sm:text-2xl font-mono text-amber-800">
                  {currentProblem.a}
                </span>
                <span className="text-lg text-amber-600 font-sans">－</span>
                <span className="text-xl sm:text-2xl font-mono text-rose-700">
                  {currentProblem.b}
                </span>
                <span className="text-lg text-amber-600 font-sans">＝</span>
                <span className="text-xl sm:text-2xl font-mono px-2 py-0.5 rounded-lg bg-white border border-amber-300 text-amber-900 min-w-[36px] text-center shadow-inner">
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
              setCheckResult(null);
              playPopSound();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white rounded-xl font-bold text-xs shadow-xs hover:shadow-sm transition-all cursor-pointer"
            title="随机生成一道100以内的退位减法题目"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>随机出题</span>
          </button>

          {/* Helper: Auto Setup Minuend (一键摆放被减数) */}
          {currentProblem && (
            <button
              id="btn-auto-setup-minuend"
              onClick={() => {
                onAutoSetupMinuend();
                setCheckResult(null);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 active:bg-amber-300 text-amber-900 rounded-xl font-bold text-xs border border-amber-300 shadow-2xs transition-all cursor-pointer"
              title={`在画板上自动摆放被减数 ${currentProblem.a} 根小棒`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>摆放被减数({currentProblem.a})</span>
            </button>
          )}
        </div>

        {/* Center/Right: Action Buttons & Operation Verification */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Check Student's Operation Button */}
          <button
            id="btn-check-operation"
            onClick={handleCheckOperation}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-xs hover:shadow-sm transition-all cursor-pointer"
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
            <span className="hidden sm:inline">整理排列</span>
          </button>

          {/* Clear board button */}
          <button
            id="btn-clear-board"
            onClick={() => {
              onClear();
              setCheckResult(null);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-red-200 bg-red-50/70 hover:bg-red-100 text-red-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
            title="清空画板上的所有木棒与捆绳"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
            <span>清空</span>
          </button>
        </div>
      </div>

      {/* Check Result Feedback Banner */}
      <AnimatePresence>
        {checkResult && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -6 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -6 }}
            className={`mt-2 p-2.5 rounded-xl border text-xs flex items-start gap-2 ${
              checkResult.status === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : checkResult.status === 'warning'
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-sky-50 border-sky-300 text-sky-900'
            }`}
          >
            {checkResult.status === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle
                className={`w-4 h-4 shrink-0 mt-0.5 ${
                  checkResult.status === 'warning' ? 'text-amber-600' : 'text-sky-600'
                }`}
              />
            )}
            <div className="flex-1">
              <span className="font-bold">{checkResult.message}</span>
              {checkResult.details && (
                <p className="text-[11px] mt-0.5 opacity-90">{checkResult.details}</p>
              )}
            </div>
            <button
              onClick={() => setCheckResult(null)}
              className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer text-xs"
              title="关闭提示"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
