"use client";

import { useRef, useEffect, useState, useCallback } from "react";

/* ── Types ─────────────────────────────────────────────────────── */

interface Point {
  x: number;
  y: number;
}

interface Cycle {
  x: number;
  y: number;
  dx: number;
  dy: number;
  trail: Point[];
  alive: boolean;
  color: string;
  glow: string;
  name: string;
}

type Phase = "boot" | "ready" | "playing" | "won" | "lost";

/* ── Constants ─────────────────────────────────────────────────── */

const MIN_CELL = 10;
const MAX_CELL = 14;
const TICK_MS = 110;
const WALL_PAD = 2; // px padding inside arena border

const CYAN = "#00d9ff";
const ORANGE = "#ff6b00";
const MAGENTA = "#ff2d78";

/* ── Helpers ───────────────────────────────────────────────────── */

function key(x: number, y: number) {
  return `${x},${y}`;
}

function opposites(dx: number, dy: number, ndx: number, ndy: number) {
  return dx === -ndx && dy === -ndy;
}

/* ── Sound FX (Web Audio API) ──────────────────────────────────── */

function getAudioCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  return new AC();
}

let audioCtx: AudioContext | null = null;

function ensureAudio() {
  if (!audioCtx || audioCtx.state === "closed") {
    audioCtx = getAudioCtx();
  }
  if (audioCtx?.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTone(freq: number, duration: number, type: OscillatorType = "square", volume = 0.08) {
  const ctx = ensureAudio();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

function sfxBoot() {
  playTone(800, 0.06, "square", 0.04);
}

function sfxCountdown() {
  playTone(440, 0.15, "square", 0.06);
}

function sfxStart() {
  playTone(880, 0.2, "square", 0.08);
  setTimeout(() => playTone(1100, 0.3, "square", 0.06), 100);
}

function sfxTurn() {
  playTone(600, 0.04, "square", 0.03);
}

function sfxEnemyCrash() {
  const ctx = ensureAudio();
  if (!ctx) return;
  // Noise burst
  const bufferSize = ctx.sampleRate * 0.15;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.12, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
  source.connect(gain);
  gain.connect(ctx.destination);
  source.start();
}

function sfxPlayerCrash() {
  const ctx = ensureAudio();
  if (!ctx) return;
  // Low rumble + noise
  const osc = ctx.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(120, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.4);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.4);
  // Noise on top
  const bufferSize = ctx.sampleRate * 0.3;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const ng = ctx.createGain();
  ng.gain.setValueAtTime(0.1, ctx.currentTime);
  ng.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
  source.connect(ng);
  ng.connect(ctx.destination);
  source.start();
}

function sfxWin() {
  [660, 880, 1100, 1320].forEach((f, i) => {
    setTimeout(() => playTone(f, 0.3, "square", 0.06), i * 100);
  });
}

function sfxTick() {
  playTone(200, 0.02, "square", 0.01);
}

/* ── AI ────────────────────────────────────────────────────────── */

function aiDirection(
  cycle: Cycle,
  occupied: Set<string>,
  cols: number,
  rows: number
): [number, number] {
  const dirs: [number, number][] = [
    [0, -1],
    [0, 1],
    [-1, 0],
    [1, 0],
  ];

  const safe = dirs.filter(([dx, dy]) => {
    if (opposites(cycle.dx, cycle.dy, dx, dy)) return false;
    const nx = cycle.x + dx;
    const ny = cycle.y + dy;
    if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) return false;
    return !occupied.has(key(nx, ny));
  });

  if (safe.length === 0) return [cycle.dx, cycle.dy];

  // Lookahead: count open cells ahead for each safe direction
  const scores = safe.map(([dx, dy]) => {
    let score = 0;
    let cx = cycle.x + dx;
    let cy = cycle.y + dy;
    for (let i = 0; i < 10; i++) {
      if (cx < 0 || cx >= cols || cy < 0 || cy >= rows) break;
      if (occupied.has(key(cx, cy))) break;
      score++;
      cx += dx;
      cy += dy;
    }
    // Also check perpendicular freedom at the first step
    const nx = cycle.x + dx;
    const ny = cycle.y + dy;
    for (const [pdx, pdy] of dirs) {
      if (pdx === -dx && pdy === -dy) continue;
      if (pdx === dx && pdy === dy) continue;
      let px = nx + pdx;
      let py = ny + pdy;
      for (let i = 0; i < 5; i++) {
        if (px < 0 || px >= cols || py < 0 || py >= rows) break;
        if (occupied.has(key(px, py))) break;
        score += 0.5;
        px += pdx;
        py += pdy;
      }
    }
    return score;
  });

  // Current direction bias
  const currentIdx = safe.findIndex(
    ([dx, dy]) => dx === cycle.dx && dy === cycle.dy
  );
  if (currentIdx >= 0) scores[currentIdx] += 2;

  // Add slight randomness so AI isn't perfect
  const jittered = scores.map((s) => s + Math.random() * 3);
  const bestIdx = jittered.indexOf(Math.max(...jittered));

  return safe[bestIdx];
}

/* ── Component ─────────────────────────────────────────────────── */

export default function TronGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("boot");
  const [bootLines, setBootLines] = useState<string[]>([]);

  // Mutable game state lives in refs to avoid re-render overhead
  const gameRef = useRef<{
    cols: number;
    rows: number;
    cellSize: number;
    player: Cycle;
    enemies: Cycle[];
    occupied: Set<string>;
    tickInterval: ReturnType<typeof setInterval> | null;
    pendingDir: [number, number] | null;
    prevEnemyAlive: boolean[];
  } | null>(null);

  /* ── Resize ──────────────────────────────────────────────────── */

  const computeGrid = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return { cols: 40, rows: 30, cellSize: 12 };

    const w = container.clientWidth - WALL_PAD * 2;
    const h = container.clientHeight - WALL_PAD * 2;
    const dpr = window.devicePixelRatio || 1;

    // Choose cell size to get a reasonable grid density
    let cellSize = Math.floor(Math.min(w / 30, h / 20));
    cellSize = Math.max(MIN_CELL, Math.min(MAX_CELL, cellSize));

    const cols = Math.floor(w / cellSize);
    const rows = Math.floor(h / cellSize);

    const canvasW = cols * cellSize;
    const canvasH = rows * cellSize;

    canvas.width = canvasW * dpr;
    canvas.height = canvasH * dpr;
    canvas.style.width = `${canvasW}px`;
    canvas.style.height = `${canvasH}px`;

    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(dpr, dpr);

    return { cols, rows, cellSize };
  }, []);

  /* ── Init game ───────────────────────────────────────────────── */

  const initGame = useCallback(() => {
    const { cols, rows, cellSize } = computeGrid();

    const player: Cycle = {
      x: Math.floor(cols / 2),
      y: rows - 5,
      dx: 0,
      dy: -1,
      trail: [],
      alive: true,
      color: CYAN,
      glow: "rgba(0, 217, 255, 0.5)",
      name: "PLAYER",
    };

    const enemy1: Cycle = {
      x: Math.floor(cols * 0.2),
      y: 4,
      dx: 1,
      dy: 0,
      trail: [],
      alive: true,
      color: ORANGE,
      glow: "rgba(255, 107, 0, 0.5)",
      name: "SARK",
    };

    const enemy2: Cycle = {
      x: Math.floor(cols * 0.8),
      y: 4,
      dx: -1,
      dy: 0,
      trail: [],
      alive: true,
      color: MAGENTA,
      glow: "rgba(255, 45, 120, 0.5)",
      name: "MCP",
    };

    const occupied = new Set<string>();
    // Mark starting positions
    [player, enemy1, enemy2].forEach((c) => {
      occupied.add(key(c.x, c.y));
      c.trail.push({ x: c.x, y: c.y });
    });

    gameRef.current = {
      cols,
      rows,
      cellSize,
      player,
      enemies: [enemy1, enemy2],
      occupied,
      tickInterval: null,
      pendingDir: null,
      prevEnemyAlive: [true, true],
    };
  }, [computeGrid]);

  /* ── Render ──────────────────────────────────────────────────── */

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const game = gameRef.current;
    if (!canvas || !game) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { cols, rows, cellSize, player, enemies } = game;
    const w = cols * cellSize;
    const h = rows * cellSize;

    // Background
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= cols; x++) {
      ctx.beginPath();
      ctx.moveTo(x * cellSize, 0);
      ctx.lineTo(x * cellSize, h);
      ctx.stroke();
    }
    for (let y = 0; y <= rows; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * cellSize);
      ctx.lineTo(w, y * cellSize);
      ctx.stroke();
    }

    // Draw trails and heads
    const allCycles = [player, ...enemies];
    for (const cycle of allCycles) {
      if (cycle.trail.length === 0) continue;

      // Trail
      ctx.fillStyle = cycle.alive ? cycle.color : `${cycle.color}44`;
      for (const pt of cycle.trail) {
        ctx.fillRect(
          pt.x * cellSize + 1,
          pt.y * cellSize + 1,
          cellSize - 2,
          cellSize - 2
        );
      }

      // Head glow
      if (cycle.alive) {
        const head = cycle.trail[cycle.trail.length - 1];
        ctx.shadowColor = cycle.glow;
        ctx.shadowBlur = 12;
        ctx.fillStyle = "#fff";
        ctx.fillRect(
          head.x * cellSize + 1,
          head.y * cellSize + 1,
          cellSize - 2,
          cellSize - 2
        );
        ctx.shadowBlur = 0;
      }
    }

    // Arena border - visible glowing edge
    ctx.shadowColor = "rgba(0, 217, 255, 0.3)";
    ctx.shadowBlur = 15;
    ctx.strokeStyle = "rgba(0, 217, 255, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0.5, 0.5, w - 1, h - 1);
    ctx.shadowBlur = 0;

    // Corner accents
    const corner = 8;
    ctx.strokeStyle = "rgba(0, 217, 255, 0.6)";
    ctx.lineWidth = 2;
    // Top-left
    ctx.beginPath();
    ctx.moveTo(0, corner);
    ctx.lineTo(0, 0);
    ctx.lineTo(corner, 0);
    ctx.stroke();
    // Top-right
    ctx.beginPath();
    ctx.moveTo(w - corner, 0);
    ctx.lineTo(w, 0);
    ctx.lineTo(w, corner);
    ctx.stroke();
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(0, h - corner);
    ctx.lineTo(0, h);
    ctx.lineTo(corner, h);
    ctx.stroke();
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(w - corner, h);
    ctx.lineTo(w, h);
    ctx.lineTo(w, h - corner);
    ctx.stroke();
  }, []);

  /* ── Game tick ───────────────────────────────────────────────── */

  const tick = useCallback(() => {
    const game = gameRef.current;
    if (!game) return;

    const { cols, rows, player, enemies, occupied } = game;

    // Apply pending direction
    if (game.pendingDir) {
      const [ndx, ndy] = game.pendingDir;
      if (!opposites(player.dx, player.dy, ndx, ndy)) {
        if (ndx !== player.dx || ndy !== player.dy) {
          sfxTurn();
        }
        player.dx = ndx;
        player.dy = ndy;
      }
      game.pendingDir = null;
    }

    // Update AI
    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      const [dx, dy] = aiDirection(enemy, occupied, cols, rows);
      enemy.dx = dx;
      enemy.dy = dy;
    }

    // Move all alive cycles
    const allCycles = [player, ...enemies];
    for (const cycle of allCycles) {
      if (!cycle.alive) continue;

      const nx = cycle.x + cycle.dx;
      const ny = cycle.y + cycle.dy;

      // Wall collision
      if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) {
        cycle.alive = false;
        continue;
      }

      // Trail collision
      if (occupied.has(key(nx, ny))) {
        cycle.alive = false;
        continue;
      }

      cycle.x = nx;
      cycle.y = ny;
      cycle.trail.push({ x: nx, y: ny });
      occupied.add(key(nx, ny));
    }

    // Sound effects for enemy crashes
    enemies.forEach((e, i) => {
      if (game.prevEnemyAlive[i] && !e.alive) {
        sfxEnemyCrash();
      }
    });
    game.prevEnemyAlive = enemies.map((e) => e.alive);

    // Subtle tick sound
    sfxTick();

    // Check win/lose
    if (!player.alive) {
      if (game.tickInterval) clearInterval(game.tickInterval);
      game.tickInterval = null;
      sfxPlayerCrash();
      setPhase("lost");
    } else if (enemies.every((e) => !e.alive)) {
      if (game.tickInterval) clearInterval(game.tickInterval);
      game.tickInterval = null;
      sfxWin();
      setPhase("won");
    }

    render();
  }, [render]);

  /* ── Start game ──────────────────────────────────────────────── */

  const startGame = useCallback(() => {
    ensureAudio();
    initGame();
    render();
    setPhase("playing");
    sfxStart();

    const interval = setInterval(tick, TICK_MS);
    if (gameRef.current) {
      gameRef.current.tickInterval = interval;
    }
  }, [initGame, render, tick]);

  /* ── Lock body scroll on mobile ────────────────────────────── */

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.inset = "0";
    body.style.width = "100%";

    return () => {
      html.style.overflow = "";
      body.style.overflow = "";
      body.style.position = "";
      body.style.inset = "";
      body.style.width = "";
    };
  }, []);

  /* ── Boot sequence ───────────────────────────────────────────── */

  useEffect(() => {
    if (phase !== "boot") return;

    const lines = [
      "> SYSTEM BOOT v4.1.2",
      "> LOADING GRID PROTOCOL...",
      "> INITIALIZING LIGHT CYCLES...",
      "> OPPONENTS DETECTED: 2",
      "> THREAT LEVEL: MODERATE",
      "> GRID STATUS: ONLINE",
      "",
      "> CLASSIFIED DOCUMENT LOCKED",
      "> MANUAL OVERRIDE REQUIRED",
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < lines.length) {
        setBootLines((prev) => [...prev, lines[i]]);
        sfxBoot();
        i++;
      } else {
        clearInterval(interval);
        sfxCountdown();
        setPhase("ready");
      }
    }, 250);

    return () => clearInterval(interval);
  }, [phase]);

  /* ── Keyboard input ──────────────────────────────────────────── */

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (phase === "ready") {
        e.preventDefault();
        startGame();
        return;
      }

      if (phase === "lost" && (e.key === " " || e.key === "Enter")) {
        e.preventDefault();
        startGame();
        return;
      }

      if (phase !== "playing" || !gameRef.current) return;

      let dir: [number, number] | null = null;
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          dir = [0, -1];
          break;
        case "ArrowDown":
        case "s":
        case "S":
          dir = [0, 1];
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          dir = [-1, 0];
          break;
        case "ArrowRight":
        case "d":
        case "D":
          dir = [1, 0];
          break;
      }

      if (dir) {
        e.preventDefault();
        gameRef.current.pendingDir = dir;
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [phase, startGame]);

  /* ── Touch / swipe input ─────────────────────────────────────── */

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (phase === "ready") {
        e.preventDefault();
        startGame();
        return;
      }
      if (phase === "lost") {
        e.preventDefault();
        startGame();
        return;
      }

      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      e.preventDefault();
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (phase !== "playing" || !gameRef.current) return;

      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStartX;
      const dy = touch.clientY - touchStartY;
      const minSwipe = 20;

      if (Math.abs(dx) < minSwipe && Math.abs(dy) < minSwipe) {
        // Tap: turn based on which half of screen
        const rect = canvas.getBoundingClientRect();
        const tapX = touch.clientX - rect.left;
        const midX = rect.width / 2;

        const { player } = gameRef.current;
        // Relative turn: left tap = turn left, right tap = turn right
        if (player.dx === 0) {
          // Moving vertically
          if (tapX < midX) {
            gameRef.current.pendingDir =
              player.dy === -1 ? [-1, 0] : [1, 0];
          } else {
            gameRef.current.pendingDir =
              player.dy === -1 ? [1, 0] : [-1, 0];
          }
        } else {
          // Moving horizontally
          if (tapX < midX) {
            gameRef.current.pendingDir =
              player.dx === 1 ? [0, -1] : [0, 1];
          } else {
            gameRef.current.pendingDir =
              player.dx === 1 ? [0, 1] : [0, -1];
          }
        }
        return;
      }

      // Swipe: absolute direction
      if (Math.abs(dx) > Math.abs(dy)) {
        gameRef.current.pendingDir = dx > 0 ? [1, 0] : [-1, 0];
      } else {
        gameRef.current.pendingDir = dy > 0 ? [0, 1] : [0, -1];
      }
    };

    canvas.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    canvas.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    canvas.addEventListener("touchend", handleTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, [phase, startGame]);

  /* ── Handle resize ───────────────────────────────────────────── */

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ro = new ResizeObserver(() => {
      if (phase === "playing" && gameRef.current) {
        return;
      }
      if (phase === "ready") {
        initGame();
        render();
      }
    });

    ro.observe(container);
    return () => ro.disconnect();
  }, [phase, initGame, render]);

  /* ── Cleanup ─────────────────────────────────────────────────── */

  useEffect(() => {
    return () => {
      if (gameRef.current?.tickInterval) {
        clearInterval(gameRef.current.tickInterval);
      }
    };
  }, []);

  /* ── Render ready state ──────────────────────────────────────── */

  useEffect(() => {
    if (phase === "ready") {
      initGame();
      render();
    }
  }, [phase, initGame, render]);

  /* ── UI ──────────────────────────────────────────────────────── */

  return (
    <div className="relative flex flex-col h-[calc(100dvh-3.5rem)] lg:h-[100dvh] select-none overflow-hidden touch-none">
      {/* CRT scanline overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-20"
        style={{
          background:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.06) 0px, rgba(0,0,0,0.06) 1px, transparent 1px, transparent 3px)",
        }}
      />

      {/* Boot screen */}
      {phase === "boot" && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#0a0a0a]">
          <div className="font-mono text-sm md:text-base text-cyan space-y-1 p-8 max-w-lg">
            {bootLines.map((line, i) => (
              <div
                key={i}
                className={`${line === "" ? "h-4" : ""} ${
                  i === bootLines.length - 1 ? "animate-pulse" : ""
                }`}
              >
                {line}
              </div>
            ))}
            <span className="inline-block w-2 h-4 bg-cyan animate-pulse" />
          </div>
        </div>
      )}

      {/* Game area */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center overflow-hidden p-4 py-8 md:p-6"
      >
        <canvas
          ref={canvasRef}
          className={`block ${
            phase === "boot" ? "opacity-0" : "opacity-100"
          } transition-opacity duration-500`}
        />
      </div>

      {/* Ready overlay */}
      {phase === "ready" && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
          <div className="bg-[#0a0a0a]/80 backdrop-blur-sm p-8 md:p-12 text-center space-y-4">
            <h2 className="font-mono text-cyan text-xl md:text-2xl tracking-widest">
              ENTER THE GRID
            </h2>
            <div className="text-light-300 text-sm font-mono space-y-1">
              <p className="hidden md:block">
                Arrow keys or WASD to steer
              </p>
              <p className="md:hidden">Swipe or tap to steer</p>
              <p className="text-white/40 text-xs mt-2">
                Outlast both opponents to unlock access
              </p>
            </div>
            <button
              onClick={startGame}
              className="mt-4 font-mono text-sm tracking-widest text-black bg-cyan px-6 py-2 hover:bg-cyan/90 transition-colors"
            >
              START
            </button>
          </div>
        </div>
      )}

      {/* Playing HUD */}
      {phase === "playing" && (
        <div className="absolute top-2 left-0 right-0 z-10 flex justify-center gap-6 font-mono text-xs tracking-wider">
          <span className="text-cyan/70">YOU</span>
          {gameRef.current?.enemies.map((e, i) => (
            <span
              key={i}
              style={{ color: e.alive ? e.color : `${e.color}44` }}
            >
              {e.name}
              {!e.alive && " ✕"}
            </span>
          ))}
        </div>
      )}

      {/* Won overlay */}
      {phase === "won" && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
          <div className="bg-[#0a0a0a]/85 backdrop-blur-sm p-8 md:p-12 text-center space-y-6">
            <div className="font-mono text-cyan text-2xl md:text-3xl tracking-widest animate-pulse">
              ACCESS GRANTED
            </div>
            <div className="font-mono text-light-300 text-sm space-y-1">
              <p>Decryption complete.</p>
              <p className="text-white/40 text-xs">
                All opponents derezzed.
              </p>
            </div>
            <div className="flex flex-col gap-3 items-center">
              <a
                href="/Omar Kamel CV2026.pdf"
                download
                className="font-mono text-sm tracking-widest text-black bg-cyan px-8 py-3 hover:bg-cyan/90 transition-colors inline-block"
              >
                DOWNLOAD CV
              </a>
              <button
                onClick={startGame}
                className="font-mono text-xs tracking-widest text-cyan/60 hover:text-cyan transition-colors"
              >
                PLAY AGAIN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lost overlay */}
      {phase === "lost" && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
          <div className="bg-[#0a0a0a]/85 backdrop-blur-sm p-8 md:p-12 text-center space-y-6">
            <div className="font-mono text-red-500 text-2xl md:text-3xl tracking-widest">
              DEREZZED
            </div>
            <div className="font-mono text-light-300 text-sm">
              <p>Your light cycle has been terminated.</p>
            </div>
            <button
              onClick={startGame}
              className="font-mono text-sm tracking-widest text-black bg-cyan px-8 py-3 hover:bg-cyan/90 transition-colors"
            >
              RETRY
            </button>
            <p className="font-mono text-white/30 text-xs">
              Press Space or tap to retry
            </p>
          </div>
        </div>
      )}

      {/* Mobile touch hint */}
      {phase === "playing" && (
        <div className="md:hidden absolute bottom-4 left-0 right-0 z-10 text-center">
          <span className="font-mono text-white/20 text-xs">
            swipe or tap sides to turn
          </span>
        </div>
      )}
    </div>
  );
}
