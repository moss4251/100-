/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { BoardItem, ItemType, SelectionRect, MathProblem } from './types';
import { TopBookDisplay } from './components/TopBookDisplay';
import { SpawnerDock } from './components/SpawnerDock';
import { DeleteBoxTool } from './components/DeleteBoxTool';
import { BundleGraphic } from './components/BundleGraphic';
import { StickGraphic } from './components/StickGraphic';
import { RopeGraphic } from './components/RopeGraphic';
import { MathProblemBar } from './components/MathProblemBar';
import {
  playPopSound,
  playUnbundleSound,
  playDeleteSound,
  toggleSound,
  isSoundEnabled,
} from './utils/audio';
import { Volume2, VolumeX, Sliders, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Library background asset
import libraryBg from './assets/images/library_background_1789007975262.jpg';

// Helper: Generate random 100-within subtraction with regrouping (100以内退位减法)
function generateRandomRegroupingProblem(): MathProblem {
  // Minuend A between 21 and 98
  // Units digit uA between 0 and 7
  const uA = Math.floor(Math.random() * 8); // 0..7
  const tA = Math.floor(Math.random() * 8) + 2; // 2..9 -> tens 2..9
  const a = tA * 10 + uA; // 20..97

  // Subtrahend units uB must be strictly greater than uA (requires regrouping/退位)
  const minUB = uA + 1;
  const uB = Math.floor(Math.random() * (10 - minUB)) + minUB; // minUB..9

  // Subtrahend tens tB between 0 and tA - 1 (so B < A)
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

  // Sound state
  const [soundOn, setSoundOn] = useState<boolean>(true);

  // Background opacity (user requested appropriately transparent)
  const [bgOpacity, setBgOpacity] = useState<number>(0.38);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Deletion tool mode state
  const [isDeleteModeActive, setIsDeleteModeActive] = useState<boolean>(false);

  // Dragging existing item on board
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const dragOffsetRef = useRef<{ offsetX: number; offsetY: number }>({ offsetX: 0, offsetY: 0 });

  // Dragging NEW item from spawner dock
  const [spawnerDrag, setSpawnerDrag] = useState<{
    type: 'bundle' | 'stick';
    x: number;
    y: number;
  } | null>(null);

  // Selection box for deletion marquee mode
  const [selectionRect, setSelectionRect] = useState<SelectionRect | null>(null);
  const isMarqueeActiveRef = useRef<boolean>(false);

  // Reference to board canvas container
  const boardRef = useRef<HTMLDivElement>(null);

  // Item counts
  const bundleCount = items.filter((i) => i.type === 'bundle' && !i.isDeleting).length;
  const singleCount = items.filter((i) => i.type === 'stick' && !i.isDeleting).length;
  const totalCount = bundleCount * 10 + singleCount;

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

  // Handle double clicking a bundle to expand into 10 single sticks and keep the rope
  const handleUnbundle = useCallback((bundleId: string) => {
    const bundle = items.find((it) => it.id === bundleId);
    if (!bundle || bundle.type !== 'bundle') return;

    playUnbundleSound();

    const timestamp = Date.now();
    const groupId = `unbundled-${timestamp}`;

    // 10 Independent single sticks arranged side-by-side
    const newSticks: BoardItem[] = Array.from({ length: 10 }).map((_, idx) => ({
      id: `stick-${timestamp}-${idx}`,
      type: 'stick',
      x: bundle.x + idx * 26,
      y: bundle.y,
      unbundledGroup: groupId,
    }));

    // 1 Unfolded Rope item: placed DIRECTLY UNDERNEATH the 10 wooden sticks
    const ropeItem: BoardItem = {
      id: `rope-${timestamp}`,
      type: 'rope',
      x: bundle.x - 8,
      y: bundle.y + 115, // Placed directly under the 10 wooden sticks
      unbundledGroup: groupId,
    };

    setItems((prev) => [...prev.filter((it) => it.id !== bundleId), ...newSticks, ropeItem]);
  }, [items]);

  // Handle deletion of specific items (used by marquee selection or direct click in delete mode)
  const deleteItemsByIds = useCallback((idsToDelete: string[]) => {
    if (idsToDelete.length === 0) return;

    playDeleteSound();

    // Calculate how many book units were deleted
    let subtractedBooks = 0;
    items.forEach((it) => {
      if (idsToDelete.includes(it.id)) {
        if (it.type === 'bundle') subtractedBooks += 10;
        else if (it.type === 'stick') subtractedBooks += 1;
      }
    });

    setDeletedCountSinceStart((prev) => prev + subtractedBooks);

    // Mark as deleting for visual animation
    setItems((prev) =>
      prev.map((it) => (idsToDelete.includes(it.id) ? { ...it, isDeleting: true } : it))
    );

    // Remove from array after transition
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
    const spawnX = Math.min(rect.width - 150, Math.max(220, 240 + Math.random() * 200));
    const spawnY = Math.min(rect.height - 180, Math.max(120, 160 + Math.random() * 140));

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

    // If in delete mode, clicking directly on an item deletes it immediately!
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

    // 1. If currently dragging a newly spawned item
    if (spawnerDrag) {
      setSpawnerDrag((prev) => (prev ? { ...prev, x: pos.x, y: pos.y } : null));
      return;
    }

    // 2. If currently dragging an existing item on the board
    if (draggingItemId) {
      setItems((prev) =>
        prev.map((it) => {
          if (it.id === draggingItemId) {
            const nextX = Math.max(10, pos.x - dragOffsetRef.current.offsetX);
            const nextY = Math.max(10, pos.y - dragOffsetRef.current.offsetY);
            return { ...it, x: nextX, y: nextY };
          }
          return it;
        })
      );
      return;
    }

    // 3. If in deletion marquee mode and drawing the box
    if (isDeleteModeActive && isMarqueeActiveRef.current && selectionRect) {
      setSelectionRect((prev) => (prev ? { ...prev, currentX: pos.x, currentY: pos.y } : null));
    }
  };

  // Global pointer up on board
  const handleBoardPointerUp = (e: React.PointerEvent) => {
    // 1. If dropping newly spawned item
    if (spawnerDrag) {
      const pos = getBoardPos(e.clientX, e.clientY);
      const newItem: BoardItem = {
        id: `${spawnerDrag.type[0]}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: spawnerDrag.type,
        x: Math.max(30, pos.x - (spawnerDrag.type === 'bundle' ? 45 : 10)),
        y: Math.max(30, pos.y - (spawnerDrag.type === 'bundle' ? 45 : 40)),
      };
      setItems((prev) => [...prev, newItem]);
      setSpawnerDrag(null);
      return;
    }

    // 2. If releasing existing dragged item
    if (draggingItemId) {
      setDraggingItemId(null);
      return;
    }

    // 3. If finishing deletion marquee box
    if (isDeleteModeActive && isMarqueeActiveRef.current && selectionRect) {
      isMarqueeActiveRef.current = false;

      const minX = Math.min(selectionRect.startX, selectionRect.currentX);
      const maxX = Math.max(selectionRect.startX, selectionRect.currentX);
      const minY = Math.min(selectionRect.startY, selectionRect.currentY);
      const maxY = Math.max(selectionRect.startY, selectionRect.currentY);

      // Require meaningful selection box size (>10px) to prevent accidental clicks
      if (maxX - minX > 12 && maxY - minY > 12) {
        // Find all items intersecting or enclosed in the selection box
        const hitIds = items
          .filter((it) => {
            const itemWidth = it.type === 'bundle' ? 100 : it.type === 'stick' ? 24 : 70;
            const itemHeight = it.type === 'bundle' ? 100 : it.type === 'stick' ? 110 : 70;

            const itemRight = it.x + itemWidth;
            const itemBottom = it.y + itemHeight;

            // Box collision overlap check
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

    // Check if target is not a button or spawner
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

  // Calculate items currently enclosed or intersecting the live selection rectangle
  const liveSelectedIds = React.useMemo(() => {
    if (!selectionRect) return new Set<string>();
    const minX = Math.min(selectionRect.startX, selectionRect.currentX);
    const maxX = Math.max(selectionRect.startX, selectionRect.currentX);
    const minY = Math.min(selectionRect.startY, selectionRect.currentY);
    const maxY = Math.max(selectionRect.startY, selectionRect.currentY);

    if (maxX - minX < 8 || maxY - minY < 8) return new Set<string>();

    const hit = new Set<string>();
    items.forEach((it) => {
      const itemWidth = it.type === 'bundle' ? 100 : it.type === 'stick' ? 24 : 70;
      const itemHeight = it.type === 'bundle' ? 100 : it.type === 'stick' ? 110 : 70;
      const itemRight = it.x + itemWidth;
      const itemBottom = it.y + itemHeight;

      if (it.x < maxX && itemRight > minX && it.y < maxY && itemBottom > minY) {
        hit.add(it.id);
      }
    });
    return hit;
  }, [selectionRect, items]);

  // Trigger a new random subtraction problem and reset board to empty
  const handleNewProblem = useCallback(() => {
    const prob = generateRandomRegroupingProblem();
    setCurrentProblem(prob);
    setItems([]);
    setDeletedCountSinceStart(0);
    playPopSound();
  }, []);

  // Helper: Automatically place minuend sticks/bundles on board
  const handleAutoSetupMinuend = useCallback(() => {
    if (!currentProblem) return;
    const a = currentProblem.a;
    const bCount = Math.floor(a / 10);
    const sCount = a % 10;
    const newItems: BoardItem[] = [];
    const timestamp = Date.now();

    // Place bundles neatly on the left
    for (let i = 0; i < bCount; i++) {
      newItems.push({
        id: `bundle-setup-${timestamp}-${i}`,
        type: 'bundle',
        x: 130 + i * 110,
        y: 130,
      });
    }

    // Place single sticks neatly to the right
    const startStickX = 130 + bCount * 110 + 35;
    for (let j = 0; j < sCount; j++) {
      newItems.push({
        id: `stick-setup-${timestamp}-${j}`,
        type: 'stick',
        x: startStickX + j * 28,
        y: 130,
      });
    }

    setItems(newItems);
    setDeletedCountSinceStart(0);
    playPopSound();
  }, [currentProblem]);

  // Auto-tidy items on board (bundles to left, ropes, single sticks to right)
  const handleTidy = () => {
    if (items.length === 0) return;

    const bundles = items.filter((it) => it.type === 'bundle');
    const ropes = items.filter((it) => it.type === 'rope');
    const sticks = items.filter((it) => it.type === 'stick');

    const tidied: BoardItem[] = [];

    // Arrange bundles
    bundles.forEach((b, idx) => {
      tidied.push({
        ...b,
        x: 120 + idx * 110,
        y: 130,
      });
    });

    // Arrange sticks
    const stickStartX = Math.max(120 + bundles.length * 110 + 30, 200);
    sticks.forEach((s, idx) => {
      const row = Math.floor(idx / 10);
      const col = idx % 10;
      tidied.push({
        ...s,
        x: stickStartX + col * 26,
        y: 130 + row * 165,
      });
    });

    // Arrange ropes under their corresponding sticks
    ropes.forEach((r, idx) => {
      tidied.push({
        ...r,
        x: stickStartX - 8,
        y: 130 + idx * 165 + 115,
      });
    });

    setItems(tidied);
    playPopSound();
  };

  // Clear all items on board
  const handleClear = () => {
    setItems([]);
    setDeletedCountSinceStart(0);
    playDeleteSound();
  };

  return (
    <div
      id="teaching-app-root"
      className="relative w-screen h-screen overflow-hidden flex flex-col bg-[#e7d8c5] select-none font-sans"
    >
      {/* 1. LIBRARY BACKGROUND (Appropriately transparent as requested) */}
      <div
        id="library-background-layer"
        className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-300"
        style={{ opacity: bgOpacity }}
      >
        <img
          src={libraryBg}
          alt="Library Classroom Backdrop"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover filter contrast-95 saturate-105"
        />
      </div>

      {/* Gentle classroom tabletop warmth vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#faf6ed]/70 via-[#f5ede0]/60 to-[#eddcc7]/80 pointer-events-none z-0" />

      {/* 2. TOP BOOK DISPLAY & SYNCHRONIZED COUNTER (1:1 CORRESPONDENCE) */}
      <TopBookDisplay
        items={items}
        deletedCountSinceStart={deletedCountSinceStart}
      />

      {/* 3. RETREAT SUBTRACTION PROBLEM BAR & OPERATION CHECKER */}
      <div className="w-full bg-white/80 backdrop-blur-md border-b border-amber-900/10 z-20">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2 px-3 sm:px-5 py-1.5">
          <div className="flex-1 min-w-0">
            <MathProblemBar
              currentProblem={currentProblem}
              onNewProblem={handleNewProblem}
              onAutoSetupMinuend={handleAutoSetupMinuend}
              onClear={handleClear}
              onTidy={handleTidy}
              items={items}
              deletedCount={deletedCountSinceStart}
            />
          </div>

          {/* Right tools: Delete Box Tool, Sound, Settings */}
          <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
            {/* THE REQUESTED DELETE BOX TOOL (单击进入删除模式，框选隐去) */}
            <DeleteBoxTool
              isActive={isDeleteModeActive}
              onToggle={() => setIsDeleteModeActive((prev) => !prev)}
              selectedCount={liveSelectedIds.size}
            />

            {/* Sound toggle button */}
            <button
              id="sound-toggle-btn"
              onClick={handleToggleSound}
              title={soundOn ? '音效开启' : '音效静音'}
              className="p-2 rounded-xl bg-white/80 hover:bg-white text-amber-900 border border-amber-200/80 shadow-2xs transition-all cursor-pointer"
            >
              {soundOn ? <Volume2 className="w-4 h-4 text-amber-700" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>

            {/* Settings button (Background transparency slider) */}
            <div className="relative">
              <button
                id="settings-toggle-btn"
                onClick={() => setShowSettings((prev) => !prev)}
                title="调整背景透明度"
                className={`p-2 rounded-xl border shadow-2xs transition-all cursor-pointer ${
                  showSettings
                    ? 'bg-amber-100 text-amber-900 border-amber-400'
                    : 'bg-white/80 hover:bg-white text-amber-900 border-amber-200/80'
                }`}
              >
                <Sliders className="w-4 h-4 text-amber-700" />
              </button>

              {/* Popover slider for background opacity */}
              {showSettings && (
                <div
                  id="bg-settings-popover"
                  className="absolute right-0 top-11 w-64 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-amber-300 z-50 text-xs text-slate-800"
                >
                  <div className="flex items-center justify-between mb-2">
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
                    <span>更淡 (清晰木棒)</span>
                    <span>更浓 (更显图书馆)</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. ACTIVE DELETION MODE BANNER (When Delete Mode is turned on) */}
      <AnimatePresence>
        {isDeleteModeActive && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="absolute top-28 inset-x-0 mx-auto max-w-xl z-30 px-4 py-2 bg-rose-600/90 text-white rounded-xl shadow-lg backdrop-blur-sm border border-rose-400 flex items-center justify-between text-xs sm:text-sm font-medium"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">✂️</span>
              <span>
                <strong>已进入减法删除模式：</strong>在画板上按住并拖动鼠标拉出选框，框中的木棒将被隐去！
              </span>
            </div>
            <button
              onClick={() => setIsDeleteModeActive(false)}
              className="ml-2 px-2 py-0.5 bg-rose-800 hover:bg-rose-900 rounded text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
            >
              退出删除
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. MAIN WORKBENCH / BLACKBOARD AREA */}
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
        {/* Soft Grid/Desk Guides */}
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
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* 6. MARQUEE SELECTION RECTANGLE (During deletion drag) */}
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
              <div className="absolute -top-7 left-2 px-2 py-0.5 bg-rose-700 text-white font-bold text-[11px] rounded shadow-md whitespace-nowrap">
                框选目标：{liveSelectedIds.size} 项 (松开减去/隐去)
              </div>
            )}
          </div>
        )}

        {/* 7. DRAGGING GHOST (When dragging directly from SpawnerDock) */}
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

        {/* 8. INFINITE SPAWNER DOCK (停在左下角放置，支持无限复制木捆与木棍) */}
        <SpawnerDock
          onStartDrag={handleStartSpawnerDrag}
          onSpawnDirectly={handleSpawnDirectly}
          disabled={isDeleteModeActive}
        />

        {/* Empty state hint */}
        {items.length === 0 && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-center p-4 z-5">
            <div className="bg-white/75 backdrop-blur-xs px-6 py-4 rounded-2xl border border-amber-900/10 shadow-xs max-w-sm flex flex-col items-center gap-1.5">
              <span className="text-2xl">🪵</span>
              <p className="text-sm font-bold text-amber-950">
                画板当前为空（无木棒）
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                可从左下角拖出木捆和木棍，或点击上方「摆放被减数」开始算式操作
              </p>
            </div>
          </div>
        )}

        {/* Subtle operation tip */}
        <div className="absolute bottom-3 right-4 z-10 pointer-events-none flex items-center gap-1.5 text-xs text-amber-950/70 bg-white/70 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-amber-900/10 shadow-2xs">
          <span className="font-bold text-amber-900">操作提示：</span>
          <span className="text-[11px] text-slate-600">
            双击木捆拆开为10根并置捆绳于下方；开启右上角删除框可圈选移走木棒
          </span>
        </div>
      </main>
    </div>
  );
}
