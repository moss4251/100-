/**
 * Grade 2 Math Subtraction with Regrouping (100以内退位减法) Interactive Tool
 * Mobile Ultra-Compact & Desktop Responsive Edition
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { BoardItem, ItemType, SelectionRect, MathProblem } from '../src/types';
import { TopBookDisplay } from './components/TopBookDisplay';
import { MobileCompactHeader } from './components/MobileCompactHeader';
import { SpawnerDock } from './components/SpawnerDock';
import { DeleteBoxTool } from './components/DeleteBoxTool';
import { BundleGraphic } from './components/BundleGraphic';
import { StickGraphic } from './components/StickGraphic';
import { RopeGraphic } from './components/RopeGraphic';
import { MathProblemBar } from './components/MathProblemBar';
import { BookShelfModal } from './components/BookShelfModal';
import { FloatingToast, CheckResultData } from './components/FloatingToast';
import { evaluateSubtractionOperation } from './utils/mathChecker';
import {
  playPopSound,
  playUnbundleSound,
  playDeleteSound,
  playSuccessSound,
  playNoticeSound,
  toggleSound,
  isSoundEnabled,
} from './utils/audio';
import { Volume2, VolumeX, Sliders } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Library background asset
const LIBRARY_BG_URL =
  'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1920&q=80';

// Helper: Generate random 100-within subtraction with regrouping (100以内退位减法)
function generateRandomRegroupingProblem(): MathProblem {
  const uA = Math.floor(Math.random() * 8); // 0..7
  const tA = Math.floor(Math.random() * 8) + 2; // 2..9 -> tens 2..9
  const a = tA * 10 + uA; // 20..97

  const minUB = uA + 1;
  const uB = Math.floor(Math.random() * (10 - minUB)) + minUB; // minUB..9

  const maxTB = tA - 1;
  const tB = Math.floor(Math.random() * (maxTB + 1)); // 0..maxTB
  const b = tB * 10 + uB;

  const safeB = b >= a ? uB : b;
  return {
    a,
    b: safeB,
    diff: a - safeB,
  };
}

export default function App() {
  // Board items state - 打开默认是无木棍的 (default empty)
  const [items, setItems] = useState<BoardItem[]>([]);

  // Random 100-within subtraction problem state
  const [currentProblem, setCurrentProblem] = useState<MathProblem | null>(() =>
    generateRandomRegroupingProblem()
  );

  // Statistics
  const [deletedCountSinceStart, setDeletedCountSinceStart] = useState<number>(0);

  // Operation check result state (floating banner)
  const [checkResult, setCheckResult] = useState<CheckResultData | null>(null);

  // Mobile Book Shelf Modal
  const [isBookShelfModalOpen, setIsBookShelfModalOpen] = useState<boolean>(false);

  // Sound state
  const [soundOn, setSoundOn] = useState<boolean>(true);

  // Background Opacity
  const [bgOpacity, setBgOpacity] = useState<number>(0.28);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Deletion Marquee Mode
  const [isDeleteModeActive, setIsDeleteModeActive] = useState<boolean>(false);
  const [selectionRect, setSelectionRect] = useState<SelectionRect | null>(null);
  const isMarqueeActiveRef = useRef<boolean>(false);

  // Dragging state for items already on board
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const dragOffsetRef = useRef<{ offsetX: number; offsetY: number }>({ offsetX: 0, offsetY: 0 });

  // Dragging state for spawning fresh items from bottom-left dock
  const [spawnerDrag, setSpawnerDrag] = useState<{
    type: ItemType;
    x: number;
    y: number;
  } | null>(null);

  // Reference to board canvas container
  const boardRef = useRef<HTMLDivElement>(null);

  // Sound toggle handler
  const handleToggleSound = () => {
    const next = toggleSound();
    setSoundOn(next);
  };

  // Convert client coordinates to board-relative coordinates
  const getBoardPos = useCallback((clientX: number, clientY: number) => {
    if (!boardRef.current) return { x: 0, y: 0 };
    const rect = boardRef.current.getBoundingClientRect();
    return {
      x: Math.round(clientX - rect.left),
      y: Math.round(clientY - rect.top),
    };
  }, []);

  // Handle unbundling: expands into 10 single sticks and places rope underneath
  const handleUnbundle = useCallback((bundleId: string) => {
    const bundle = items.find((it) => it.id === bundleId);
    if (!bundle || bundle.type !== 'bundle') return;

    playUnbundleSound();

    const timestamp = Date.now();
    const groupId = `unbundled-${timestamp}`;

    const boardWidth = boardRef.current ? boardRef.current.clientWidth : window.innerWidth;
    const isNarrow = boardWidth < 520;

    let newSticks: BoardItem[] = [];
    let ropeItem: BoardItem;

    if (isNarrow) {
      // Mobile screen: arrange 10 sticks in 2 neat rows of 5
      const startX = Math.max(15, Math.min(boardWidth - 145, bundle.x));
      const row1Sticks = Array.from({ length: 5 }).map((_, idx) => ({
        id: `stick-${timestamp}-${idx}`,
        type: 'stick' as const,
        x: startX + idx * 24,
        y: Math.max(15, bundle.y - 15),
        unbundledGroup: groupId,
      }));
      const row2Sticks = Array.from({ length: 5 }).map((_, idx) => ({
        id: `stick-${timestamp}-${idx + 5}`,
        type: 'stick' as const,
        x: startX + idx * 24,
        y: Math.max(15, bundle.y + 65),
        unbundledGroup: groupId,
      }));
      newSticks = [...row1Sticks, ...row2Sticks];

      ropeItem = {
        id: `rope-${timestamp}`,
        type: 'rope',
        x: startX - 5,
        y: Math.max(15, bundle.y + 145),
        unbundledGroup: groupId,
      };
    } else {
      // Desktop screen: 1 row of 10 sticks
      const startX = Math.max(20, Math.min(boardWidth - 280, bundle.x));
      newSticks = Array.from({ length: 10 }).map((_, idx) => ({
        id: `stick-${timestamp}-${idx}`,
        type: 'stick',
        x: startX + idx * 26,
        y: bundle.y,
        unbundledGroup: groupId,
      }));

      ropeItem = {
        id: `rope-${timestamp}`,
        type: 'rope',
        x: startX - 8,
        y: bundle.y + 115,
        unbundledGroup: groupId,
      };
    }

    setItems((prev) => [...prev.filter((it) => it.id !== bundleId), ...newSticks, ropeItem]);
  }, [items]);

  // Handle deletion of specific items
  const deleteItemsByIds = useCallback((idsToDelete: string[]) => {
    if (idsToDelete.length === 0) return;

    playDeleteSound();

    let subtractedBooks = 0;
    items.forEach((it) => {
      if (idsToDelete.includes(it.id)) {
        if (it.type === 'bundle') subtractedBooks += 10;
        else if (it.type === 'stick') subtractedBooks += 1;
      }
    });

    setDeletedCountSinceStart((prev) => prev + subtractedBooks);

    setItems((prev) =>
      prev.map((it) => (idsToDelete.includes(it.id) ? { ...it, isDeleting: true } : it))
    );

    setTimeout(() => {
      setItems((prev) => prev.filter((it) => !idsToDelete.includes(it.id)));
    }, 250);
  }, [items]);

  // Start dragging from Spawner Dock
  const handleStartSpawnerDrag = (type: 'bundle' | 'stick', clientX: number, clientY: number) => {
    const pos = getBoardPos(clientX, clientY);
    setSpawnerDrag({
      type,
      x: pos.x,
      y: pos.y,
    });
    playPopSound();
  };

  // Direct spawn by clicking spawner
  const handleSpawnDirectly = (type: 'bundle' | 'stick') => {
    if (!boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const spawnX = Math.min(rect.width - 90, Math.max(20, 30 + Math.random() * (rect.width - 120)));
    const spawnY = Math.min(rect.height - 110, Math.max(25, 30 + Math.random() * (rect.height - 150)));

    const newItem: BoardItem = {
      id: `${type[0]}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      x: spawnX,
      y: spawnY,
    };

    setItems((prev) => [...prev, newItem]);
    playPopSound();
  };

  // Start dragging an existing item on the board
  const handleStartItemDrag = (item: BoardItem, e: React.PointerEvent) => {
    e.stopPropagation();

    if (isDeleteModeActive) {
      deleteItemsByIds([item.id]);
      return;
    }

    const pos = getBoardPos(e.clientX, e.clientY);
    dragOffsetRef.current = {
      offsetX: pos.x - item.x,
      offsetY: pos.y - item.y,
    };
    setDraggingItemId(item.id);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  // Global pointer move on board
  const handleBoardPointerMove = (e: React.PointerEvent) => {
    const pos = getBoardPos(e.clientX, e.clientY);

    if (spawnerDrag) {
      setSpawnerDrag((prev) => (prev ? { ...prev, x: pos.x, y: pos.y } : null));
      return;
    }

    if (draggingItemId) {
      const boardRect = boardRef.current?.getBoundingClientRect();
      const maxX = boardRect ? boardRect.width - 35 : 2000;
      const maxY = boardRect ? boardRect.height - 35 : 2000;

      setItems((prev) =>
        prev.map((it) => {
          if (it.id === draggingItemId) {
            const rawX = pos.x - dragOffsetRef.current.offsetX;
            const rawY = pos.y - dragOffsetRef.current.offsetY;
            const nextX = Math.max(10, Math.min(maxX, rawX));
            const nextY = Math.max(10, Math.min(maxY, rawY));
            return { ...it, x: nextX, y: nextY };
          }
          return it;
        })
      );
      return;
    }

    if (isDeleteModeActive && isMarqueeActiveRef.current && selectionRect) {
      setSelectionRect((prev) => (prev ? { ...prev, currentX: pos.x, currentY: pos.y } : null));
    }
  };

  // Global pointer up on board
  const handleBoardPointerUp = (e: React.PointerEvent) => {
    if (spawnerDrag) {
      const pos = getBoardPos(e.clientX, e.clientY);
      const newItem: BoardItem = {
        id: `${spawnerDrag.type[0]}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: spawnerDrag.type,
        x: Math.max(15, pos.x - (spawnerDrag.type === 'bundle' ? 35 : 10)),
        y: Math.max(15, pos.y - (spawnerDrag.type === 'bundle' ? 35 : 30)),
      };
      setItems((prev) => [...prev, newItem]);
      setSpawnerDrag(null);
      return;
    }

    if (draggingItemId) {
      setDraggingItemId(null);
      return;
    }

    if (isDeleteModeActive && isMarqueeActiveRef.current && selectionRect) {
      isMarqueeActiveRef.current = false;

      const minX = Math.min(selectionRect.startX, selectionRect.currentX);
      const maxX = Math.max(selectionRect.startX, selectionRect.currentX);
      const minY = Math.min(selectionRect.startY, selectionRect.currentY);
      const maxY = Math.max(selectionRect.startY, selectionRect.currentY);

      if (maxX - minX > 10 && maxY - minY > 10) {
        const hitIds = items
          .filter((it) => {
            const itemWidth = it.type === 'bundle' ? 85 : it.type === 'stick' ? 22 : 65;
            const itemHeight = it.type === 'bundle' ? 85 : it.type === 'stick' ? 95 : 45;

            const itemRight = it.x + itemWidth;
            const itemBottom = it.y + itemHeight;

            const overlaps =
              it.x < maxX && itemRight > minX && it.y < maxY && itemBottom > minY;
            return overlaps;
          })
          .map((it) => it.id);

        if (hitIds.length > 0) {
          deleteItemsByIds(hitIds);
        }
      }

      setSelectionRect(null);
    }
  };

  // Start selection box on canvas down (only when in Delete Mode)
  const handleBoardPointerDown = (e: React.PointerEvent) => {
    if (!isDeleteModeActive) return;

    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('#infinite-spawner-dock')) {
      return;
    }

    const pos = getBoardPos(e.clientX, e.clientY);
    isMarqueeActiveRef.current = true;
    setSelectionRect({
      startX: pos.x,
      startY: pos.y,
      currentX: pos.x,
      currentY: pos.y,
    });
  };

  // Calculate live selected IDs
  const liveSelectedIds = React.useMemo(() => {
    if (!selectionRect) return new Set<string>();
    const minX = Math.min(selectionRect.startX, selectionRect.currentX);
    const maxX = Math.max(selectionRect.startX, selectionRect.currentX);
    const minY = Math.min(selectionRect.startY, selectionRect.currentY);
    const maxY = Math.max(selectionRect.startY, selectionRect.currentY);

    if (maxX - minX < 8 || maxY - minY < 8) return new Set<string>();

    const hit = new Set<string>();
    items.forEach((it) => {
      const itemWidth = it.type === 'bundle' ? 85 : it.type === 'stick' ? 22 : 65;
      const itemHeight = it.type === 'bundle' ? 85 : it.type === 'stick' ? 95 : 45;
      const itemRight = it.x + itemWidth;
      const itemBottom = it.y + itemHeight;

      if (it.x < maxX && itemRight > minX && it.y < maxY && itemBottom > minY) {
        hit.add(it.id);
      }
    });
    return hit;
  }, [selectionRect, items]);

  // Trigger a new random subtraction problem
  const handleNewProblem = useCallback(() => {
    const prob = generateRandomRegroupingProblem();
    setCurrentProblem(prob);
    setItems([]);
    setDeletedCountSinceStart(0);
    setCheckResult(null);
    playPopSound();
  }, []);

  // Helper: Automatically place minuend sticks/bundles with responsive wrapping
  const handleAutoSetupMinuend = useCallback(() => {
    if (!currentProblem) return;
    const a = currentProblem.a;
    const bCount = Math.floor(a / 10);
    const sCount = a % 10;
    const newItems: BoardItem[] = [];
    const timestamp = Date.now();

    const boardWidth = boardRef.current ? boardRef.current.clientWidth : window.innerWidth;
    const isMobile = boardWidth < 600;

    if (isMobile) {
      const bundleStepX = 84;
      const maxBundlesPerRow = Math.max(2, Math.floor((boardWidth - 20) / bundleStepX));

      for (let i = 0; i < bCount; i++) {
        const col = i % maxBundlesPerRow;
        const row = Math.floor(i / maxBundlesPerRow);
        newItems.push({
          id: `bundle-setup-${timestamp}-${i}`,
          type: 'bundle',
          x: 12 + col * bundleStepX,
          y: 15 + row * 95,
        });
      }

      const bundleRows = bCount > 0 ? Math.ceil(bCount / maxBundlesPerRow) : 0;
      const sticksStartY = 15 + bundleRows * 95 + 10;
      const maxSticksPerRow = Math.max(5, Math.floor((boardWidth - 20) / 22));

      for (let j = 0; j < sCount; j++) {
        const sCol = j % maxSticksPerRow;
        const sRow = Math.floor(j / maxSticksPerRow);
        newItems.push({
          id: `stick-setup-${timestamp}-${j}`,
          type: 'stick',
          x: 12 + sCol * 22,
          y: sticksStartY + sRow * 105,
        });
      }
    } else {
      for (let i = 0; i < bCount; i++) {
        newItems.push({
          id: `bundle-setup-${timestamp}-${i}`,
          type: 'bundle',
          x: 70 + i * 105,
          y: 50,
        });
      }

      const startStickX = 70 + bCount * 105 + 25;
      for (let j = 0; j < sCount; j++) {
        newItems.push({
          id: `stick-setup-${timestamp}-${j}`,
          type: 'stick',
          x: startStickX + j * 26,
          y: 50,
        });
      }
    }

    setItems(newItems);
    setDeletedCountSinceStart(0);
    setCheckResult(null);
    playPopSound();
  }, [currentProblem]);

  // Check student's operation
  const handleCheck = useCallback(() => {
    const result = evaluateSubtractionOperation(currentProblem, items, deletedCountSinceStart);
    setCheckResult(result);
    if (result.status === 'success') {
      playSuccessSound();
    } else {
      playNoticeSound();
    }
  }, [currentProblem, items, deletedCountSinceStart]);

  // Auto-tidy items on board with responsive wrapping
  const handleTidy = () => {
    if (items.length === 0) return;

    const bundles = items.filter((it) => it.type === 'bundle');
    const ropes = items.filter((it) => it.type === 'rope');
    const sticks = items.filter((it) => it.type === 'stick');

    const tidied: BoardItem[] = [];
    const boardWidth = boardRef.current ? boardRef.current.clientWidth : window.innerWidth;
    const isMobile = boardWidth < 600;

    if (isMobile) {
      const bundleStepX = 84;
      const maxBundlesPerRow = Math.max(2, Math.floor((boardWidth - 20) / bundleStepX));

      bundles.forEach((b, idx) => {
        const col = idx % maxBundlesPerRow;
        const row = Math.floor(idx / maxBundlesPerRow);
        tidied.push({
          ...b,
          x: 12 + col * bundleStepX,
          y: 15 + row * 95,
        });
      });

      const bundleRows = bundles.length > 0 ? Math.ceil(bundles.length / maxBundlesPerRow) : 0;
      let currentY = 15 + bundleRows * 95 + 10;

      const maxSticksPerRow = Math.max(5, Math.floor((boardWidth - 20) / 22));
      sticks.forEach((s, idx) => {
        const sCol = idx % maxSticksPerRow;
        const sRow = Math.floor(idx / maxSticksPerRow);
        tidied.push({
          ...s,
          x: 12 + sCol * 22,
          y: currentY + sRow * 105,
        });
      });

      const stickRows = sticks.length > 0 ? Math.ceil(sticks.length / maxSticksPerRow) : 0;
      currentY += stickRows * 105 + 10;

      ropes.forEach((r, idx) => {
        tidied.push({
          ...r,
          x: 12,
          y: currentY + idx * 40,
        });
      });
    } else {
      bundles.forEach((b, idx) => {
        tidied.push({
          ...b,
          x: 70 + idx * 105,
          y: 50,
        });
      });

      const stickStartX = Math.max(70 + bundles.length * 105 + 25, 140);
      sticks.forEach((s, idx) => {
        const row = Math.floor(idx / 10);
        const col = idx % 10;
        tidied.push({
          ...s,
          x: stickStartX + col * 26,
          y: 50 + row * 140,
        });
      });

      ropes.forEach((r, idx) => {
        tidied.push({
          ...r,
          x: stickStartX - 8,
          y: 50 + idx * 140 + 110,
        });
      });
    }

    setItems(tidied);
    playPopSound();
  };

  // Clear all items on board
  const handleClear = () => {
    setItems([]);
    setDeletedCountSinceStart(0);
    setCheckResult(null);
    playPopSound();
  };

  // Sync initial sound state
  useEffect(() => {
    setSoundOn(isSoundEnabled());
  }, []);

  return (
    <div
      id="main-app-container"
      className="relative w-screen h-screen flex flex-col overflow-hidden bg-amber-50/50 font-sans text-slate-800 select-none"
    >
      {/* 1. PHOTOREALISTIC LIBRARY BACKGROUND (WITH OPACITY CONTROL) */}
      <div
        id="library-background-layer"
        className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none transition-opacity duration-300"
        style={{
          backgroundImage: `url(${LIBRARY_BG_URL})`,
          opacity: bgOpacity,
        }}
      />

      {/* 2. MOBILE-ONLY COMPACT SINGLE-ROW HEADER (ONLY 48px TALL! GIVES ~90% SCREEN TO CANVAS) */}
      <div className="block md:hidden shrink-0">
        <MobileCompactHeader
          currentProblem={currentProblem}
          items={items}
          deletedCount={deletedCountSinceStart}
          isDeleteModeActive={isDeleteModeActive}
          soundOn={soundOn}
          bgOpacity={bgOpacity}
          onToggleDeleteMode={() => setIsDeleteModeActive((prev) => !prev)}
          onNewProblem={handleNewProblem}
          onAutoSetupMinuend={handleAutoSetupMinuend}
          onCheck={handleCheck}
          onClear={handleClear}
          onTidy={handleTidy}
          onToggleSound={handleToggleSound}
          onChangeBgOpacity={(val) => setBgOpacity(val)}
          onOpenBookShelf={() => setIsBookShelfModalOpen(true)}
        />
      </div>

      {/* 3. DESKTOP-ONLY FULL HEADER & PROBLEM BAR (DISPLAYED ON SCREENS >= 768px) */}
      <div className="hidden md:block shrink-0">
        <TopBookDisplay
          items={items}
          deletedCountSinceStart={deletedCountSinceStart}
        />

        <div className="w-full bg-white/85 backdrop-blur-md border-b border-amber-900/10 z-20 shadow-2xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 px-5 py-1.5">
            <div className="flex-1 min-w-0">
              <MathProblemBar
                currentProblem={currentProblem}
                onNewProblem={handleNewProblem}
                onAutoSetupMinuend={handleAutoSetupMinuend}
                onClear={handleClear}
                onTidy={handleTidy}
                items={items}
                deletedCount={deletedCountSinceStart}
                checkResult={checkResult}
                onCheck={handleCheck}
              />
            </div>

            {/* Right tools: Delete Box Tool, Sound, Settings */}
            <div className="flex items-center gap-2 shrink-0">
              <DeleteBoxTool
                isActive={isDeleteModeActive}
                onToggle={() => setIsDeleteModeActive((prev) => !prev)}
                selectedCount={liveSelectedIds.size}
              />

              <button
                id="sound-toggle-btn"
                onClick={handleToggleSound}
                title={soundOn ? '音效开启' : '音效静音'}
                className="p-2 rounded-xl bg-white/90 hover:bg-white text-amber-900 border border-amber-200/80 shadow-2xs transition-all cursor-pointer"
              >
                {soundOn ? <Volume2 className="w-4 h-4 text-amber-700" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
              </button>

              <div className="relative">
                <button
                  id="settings-toggle-btn"
                  onClick={() => setShowSettings((prev) => !prev)}
                  title="调整背景透明度"
                  className={`p-2 rounded-xl border shadow-2xs transition-all cursor-pointer ${
                    showSettings
                      ? 'bg-amber-100 text-amber-900 border-amber-400'
                      : 'bg-white/90 hover:bg-white text-amber-900 border-amber-200/80'
                  }`}
                >
                  <Sliders className="w-4 h-4 text-amber-700" />
                </button>

                {showSettings && (
                  <div
                    id="bg-settings-popover"
                    className="absolute right-0 top-11 w-64 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-amber-300 z-50 text-xs text-slate-800"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-amber-950">图书馆背景透明度</span>
                      <span className="font-mono text-amber-800">{Math.round(bgOpacity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.10"
                      max="0.80"
                      step="0.05"
                      value={bgOpacity}
                      onChange={(e) => setBgOpacity(parseFloat(e.target.value))}
                      className="w-full accent-amber-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>更淡 (突出小棒)</span>
                      <span>更浓 (突出背景)</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. FLOATING CHECK FEEDBACK TOAST (DOES NOT CONSUME ANY CANVAS SPACE) */}
      <FloatingToast
        result={checkResult}
        onClose={() => setCheckResult(null)}
      />

      {/* 5. 1:1 BOOK SHELF MODAL (ACCESSIBLE FROM MOBILE CAPTION OR DESKTOP) */}
      <BookShelfModal
        isOpen={isBookShelfModalOpen}
        onClose={() => setIsBookShelfModalOpen(false)}
        items={items}
        deletedCountSinceStart={deletedCountSinceStart}
      />

      {/* 6. FLOATING DELETION MODE BANNER (When Delete Mode is turned on) */}
      <AnimatePresence>
        {isDeleteModeActive && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-14 sm:top-24 inset-x-2 sm:inset-x-0 mx-auto max-w-sm sm:max-w-md z-40 px-3 py-1.5 bg-rose-600/95 text-white rounded-xl shadow-lg backdrop-blur-sm border border-rose-400 flex items-center justify-between text-[11px] sm:text-xs font-medium"
          >
            <div className="flex items-center gap-1.5">
              <span>✂️</span>
              <span>拉框圈住木棍即可移走 (书本同步扣除)</span>
            </div>
            <button
              onClick={() => setIsDeleteModeActive(false)}
              className="px-2 py-0.5 bg-rose-800 hover:bg-rose-900 rounded text-[10px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
            >
              退出
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 7. EXPANDED WORKBENCH / CANVAS (NOW TAKES OVER 90% OF SCREEN ON MOBILE!) */}
      <main
        id="workbench-canvas"
        ref={boardRef}
        onPointerDown={handleBoardPointerDown}
        onPointerMove={handleBoardPointerMove}
        onPointerUp={handleBoardPointerUp}
        className={`relative flex-1 w-full h-full overflow-hidden touch-none select-none ${
          isDeleteModeActive ? 'cursor-crosshair' : 'cursor-default'
        }`}
      >
        {/* Soft Grid Guides */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#78350f08_1px,transparent_1px),linear-gradient(to_bottom,#78350f08_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

        {/* Board Items */}
        <AnimatePresence>
          {items.map((item) => {
            const isHighlighted = liveSelectedIds.has(item.id);

            return (
              <motion.div
                key={item.id}
                id={`item-${item.id}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                  scale: item.isDeleting ? 0 : 1,
                  opacity: item.isDeleting ? 0 : 1,
                  x: item.x,
                  y: item.y,
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{
                  scale: { duration: 0.2 },
                  opacity: { duration: 0.2 },
                  x: { duration: 0 },
                  y: { duration: 0 },
                }}
                className={`absolute z-10 touch-none ${
                  isDeleteModeActive ? 'hover:brightness-90 cursor-pointer' : 'cursor-grab active:cursor-grabbing'
                }`}
                onPointerDown={(e) => handleStartItemDrag(item, e)}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  if (item.type === 'bundle') {
                    handleUnbundle(item.id);
                  }
                }}
              >
                {item.type === 'bundle' && (
                  <BundleGraphic
                    highlighted={isHighlighted}
                    isDragging={draggingItemId === item.id}
                    onUnbundle={() => handleUnbundle(item.id)}
                  />
                )}
                {item.type === 'stick' && (
                  <StickGraphic
                    highlighted={isHighlighted}
                    isDragging={draggingItemId === item.id}
                  />
                )}
                {item.type === 'rope' && (
                  <RopeGraphic
                    highlighted={isHighlighted}
                    isDragging={draggingItemId === item.id}
                    width={boardRef.current && boardRef.current.clientWidth < 520 ? 175 : 270}
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* MARQUEE SELECTION RECTANGLE */}
        {selectionRect && (
          <div
            id="selection-marquee-box"
            className="absolute pointer-events-none border-2 border-dashed border-rose-500 bg-rose-500/20 rounded-lg shadow-lg z-40 transition-none"
            style={{
              left: Math.min(selectionRect.startX, selectionRect.currentX),
              top: Math.min(selectionRect.startY, selectionRect.currentY),
              width: Math.abs(selectionRect.currentX - selectionRect.startX),
              height: Math.abs(selectionRect.currentY - selectionRect.startY),
            }}
          >
            {liveSelectedIds.size > 0 && (
              <div className="absolute -top-6 left-1 px-1.5 py-0.2 bg-rose-700 text-white font-bold text-[10px] rounded shadow-md whitespace-nowrap">
                圈住目标：{liveSelectedIds.size} 项 (松手移走)
              </div>
            )}
          </div>
        )}

        {/* DRAGGING GHOST (When dragging directly from SpawnerDock) */}
        {spawnerDrag && (
          <div
            id="spawner-drag-ghost"
            className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2 opacity-90 filter drop-shadow-2xl"
            style={{ left: spawnerDrag.x, top: spawnerDrag.y }}
          >
            {spawnerDrag.type === 'bundle' ? (
              <BundleGraphic showHint={false} isDragging />
            ) : (
              <StickGraphic isDragging />
            )}
          </div>
        )}

        {/* INFINITE SPAWNER DOCK (Supports Collapsing on Mobile) */}
        <SpawnerDock
          onStartDrag={handleStartSpawnerDrag}
          onSpawnDirectly={handleSpawnDirectly}
          disabled={isDeleteModeActive}
        />

        {/* Empty state hint */}
        {items.length === 0 && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-center p-3 z-5">
            <div className="bg-white/85 backdrop-blur-xs px-4 py-3 rounded-2xl border border-amber-900/10 shadow-xs max-w-xs flex flex-col items-center gap-1">
              <span className="text-2xl">🪵</span>
              <p className="text-xs font-bold text-amber-950">画板当前为空</p>
              <p className="text-[11px] text-slate-600">
                可从左下角拖出木棒，或点击上方「摆放」开始算式演示
              </p>
            </div>
          </div>
        )}

        {/* Subtle operation tip */}
        <div className="absolute bottom-2 right-2 sm:right-4 z-10 pointer-events-none hidden sm:flex items-center gap-1.5 text-xs text-amber-950/70 bg-white/75 backdrop-blur-xs px-3 py-1 rounded-xl border border-amber-900/10 shadow-2xs">
          <span className="font-bold text-amber-900">提示：</span>
          <span className="text-[11px] text-slate-600">
            双击木捆或点右上角拆为10根；点删除框圈选移走木棒
          </span>
        </div>
      </main>
    </div>
  );
}
