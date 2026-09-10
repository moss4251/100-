import { MathProblem, BoardItem } from '../types';
import { CheckResultData } from '../components/FloatingToast';

export function evaluateSubtractionOperation(
  currentProblem: MathProblem | null,
  items: BoardItem[],
  deletedCount: number
): CheckResultData {
  if (!currentProblem) {
    return {
      status: 'info',
      message: '请先点击“随机出题”生成一道退位减法算式！',
    };
  }

  const bundleCount = items.filter((i) => i.type === 'bundle' && !i.isDeleting).length;
  const singleCount = items.filter((i) => i.type === 'stick' && !i.isDeleting).length;
  const currentTotal = bundleCount * 10 + singleCount;
  const hasRopeOnBoard = items.some((i) => i.type === 'rope' && !i.isDeleting);

  const { a, b, diff } = currentProblem;
  const uA = a % 10;
  const uB = b % 10;

  // Condition 1: Perfect Match
  if (currentTotal === diff && deletedCount === b) {
    return {
      status: 'success',
      message: `🎉 检验完全正确！算式：${a} - ${b} = ${diff}`,
      details: `成功拆捆退位并移走了 ${b} 根木棒，剩余 ${diff} 根木棒与图书，完全吻合！`,
    };
  }

  // Condition 2: Board is empty
  if (currentTotal === 0 && deletedCount === 0) {
    return {
      status: 'warning',
      message: `画板为空！请先摆出被减数 ${a} 根木棒`,
      details: `可从左下角拖出 ${Math.floor(a / 10)} 捆和 ${uA} 根，或点击“摆放”。`,
    };
  }

  // Condition 3: Total matches difference
  if (currentTotal === diff) {
    return {
      status: 'success',
      message: `🌟 画板剩余数量完全正确！${a} - ${b} = ${diff}`,
      details: `画板上与上方图书刚好剩余 ${diff} 本，计算结果正确！`,
    };
  }

  // Condition 4: Currently on minuend setup (before subtraction)
  if (currentTotal === a && deletedCount === 0) {
    if (!hasRopeOnBoard) {
      return {
        status: 'info',
        message: `被减数 ${a} 根已摆好！个位只有 ${uA} 根，不够减去 ${b} 的个位 ${uB} 根`,
        details: `请【双击任意 1 捆木棒】进行拆捆退位（破十），再用减法删除框移走 ${b} 根！`,
      };
    } else {
      return {
        status: 'info',
        message: `已成功拆捆！散木棒已经足够减除`,
        details: `请开启【减法删除框】，框选移走 ${b} 根木棒！`,
      };
    }
  }

  // Condition 5: Minuend not set up properly yet
  if (deletedCount === 0 && currentTotal !== a) {
    return {
      status: 'warning',
      message: `当前画板有 ${currentTotal} 根木棒，与被减数 ${a} 不符`,
      details: `被减数是 ${a}，请增减木棒，使总数恰好等于 ${a} 根。`,
    };
  }

  // Condition 6: Subtraction in progress, but amount subtracted is incorrect
  if (deletedCount > 0) {
    if (deletedCount < b) {
      return {
        status: 'warning',
        message: `减去数量不足：已移走 ${deletedCount} 根，算式要求减去 ${b} 根`,
        details: `还需要用减法删除框再框选移走 ${b - deletedCount} 根木棒！`,
      };
    } else if (deletedCount > b) {
      return {
        status: 'warning',
        message: `减去数量过多：已移走 ${deletedCount} 根，超出了要求减去的 ${b} 根`,
        details: `多移走了 ${deletedCount - b} 根，请点击清空重做或补上木棒。`,
      };
    } else {
      return {
        status: 'warning',
        message: `已移走 ${b} 根，但当前剩余 ${currentTotal} 根，与差值 ${diff} 不符`,
        details: `请检查初始摆放的被减数是否恰好为 ${a} 根。`,
      };
    }
  }

  // Fallback
  return {
    status: 'info',
    message: `算式：${a} - ${b} = ${diff}，当前画板：${currentTotal} 根，已减：${deletedCount} 根`,
  };
}
