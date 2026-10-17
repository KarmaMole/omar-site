"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";

/**
 * The Deck's behaviour, re-attached on every route change.
 * - fits every .fig to its native ratio inside its .stage (rows chosen to give the work the most area)
 * - loops play muted only while their screen is on; the play button swaps in the YouTube / Vimeo player
 * - deck pages (<div data-mode="deck">): counter, chapter progress, arrow-key paging, overview (G)
 * - doc pages: plain scroll; archives get justified thumbnail rows and the shared filter
 */
export default function DeckRoot({ mode, name, children }: { mode: "deck" | "doc"; name?: string; children: ReactNode }) {
  const path = usePathname();
  useEffect(() => {
    const root = document.documentElement;
    const host = document.querySelector<HTMLElement>("[data-mode]");
    root.classList.remove("deck", "doc", "at-cover", "scrolled");
    root.classList.add(mode);
    const off: (() => void)[] = [];
    const on = <K extends keyof WindowEventMap>(t: K, f: (e: WindowEventMap[K]) => void, o?: AddEventListenerOptions) => {
      addEventListener(t, f, o); off.push(() => removeEventListener(t, f, o));
    };
    const $$ = <T extends Element = HTMLElement>(s: string, el: ParentNode = document) => Array.from(el.querySelectorAll<T & Element>(s)) as T[];
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = () => innerWidth < 900 || innerHeight < 560;
    const pad = (n: number) => String(n).padStart(2, "0");
    const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

    /* ---------- fit figures ---------- */
    type It = { el: HTMLElement; r: number };
    function layout(items: It[], W: number, H: number, gap: number) {
      const n = items.length;
      let best: { area: number; rows: It[][]; hs: number[] } | null = null;
      for (let k = 1; k <= Math.min(n, 3); k++) {
        const rows: It[][] = []; let i = 0;
        for (let r = 0; r < k; r++) { const c = Math.round((n - i) / (k - r)); rows.push(items.slice(i, i + c)); i += c; }
        let hs = rows.map((row) => (W - gap * (row.length - 1)) / row.reduce((s, f) => s + f.r, 0));
        const tot = hs.reduce((a, b) => a + b, 0) + gap * (k - 1);
        if (tot > H) { const s = (H - gap * (k - 1)) / (tot - gap * (k - 1)); hs = hs.map((h) => h * s); }
        const area = rows.reduce((a, row, ri) => a + row.reduce((s, f) => s + f.r * hs[ri] * hs[ri], 0), 0);
        if (!best || area > best.area * 1.04) best = { area, rows, hs };
      }
      return best!;
    }
    function fitStage(stage: HTMLElement) {
      const figs = $$<HTMLElement>(":scope > .fig, :scope > .row > .fig", stage);
      if (!figs.length) return;
      const items = figs.map((el) => ({ el, r: parseFloat(getComputedStyle(el).getPropertyValue("--r")) || 16 / 9 }));
      figs.forEach((f) => stage.append(f));
      $$(":scope > .row", stage).forEach((r) => r.remove());
      const gap = 14, W = stage.clientWidth;
      const H = small() ? innerHeight * 0.8 : stage.clientHeight;
      const { rows, hs } = layout(items, W, H, gap);
      rows.forEach((row, ri) => {
        const wrap = document.createElement("div"); wrap.className = "row";
        const h = Math.min(hs[ri], small() && row.length === 1 && row[0].r < 1 ? innerHeight * 0.72 : Infinity);
        row.forEach((f) => { f.el.style.width = Math.floor(h * f.r) + "px"; f.el.classList.toggle("small", h * f.r < 300); wrap.append(f.el); });
        stage.append(wrap);
      });
      sink(stage);
    }
    /* the words beside the work end on the work's bottom edge, not the stage's */
    function sink(stage: HTMLElement) {
      const aside = stage.parentElement?.querySelector<HTMLElement>(":scope > .aside");
      const last = stage.lastElementChild as HTMLElement | null;
      if (!aside || !last) return;
      aside.style.marginBottom = "";
      if (small()) return;
      const st = stage.getBoundingClientRect(), as = aside.getBoundingClientRect();
      if (as.top >= st.bottom - 1) return; // words sit under the work (narrow screens)
      aside.style.marginBottom = `${Math.round(st.bottom - last.getBoundingClientRect().bottom)}px`;
    }
    const stages = $$<HTMLElement>(".stage");
    const fitAll = () => stages.forEach(fitStage);
    fitAll();
    document.fonts?.ready.then(fitAll);

    /* ---------- archives: justified rows ---------- */
    function justify(sorter: HTMLElement) {
      const cards = $$<HTMLElement>(".card:not([hidden])", sorter);
      const W = sorter.clientWidth, gap = 14;
      const target = small() ? 150 : Math.max(190, Math.min(300, innerHeight * 0.32));
      let row: { c: HTMLElement; r: number }[] = [], sum = 0;
      /* phones: no card narrower than its caption can take; a row that would squeeze one is closed early */
      const minW = small() ? Math.min(150, W * 0.42) : 0;
      const flush = (last: boolean) => {
        if (!row.length) return;
        let h = (W - gap * (row.length - 1)) / sum;
        if (last && h > target * 1.25) h = target;
        if (minW) h = Math.min(h, target * 2);
        row.forEach(({ c, r }) => { c.style.width = Math.floor(h * r) + "px"; });
        row = []; sum = 0;
      };
      cards.forEach((c) => {
        const r = parseFloat(c.style.getPropertyValue("--r")) || 16 / 9;
        if (minW && row.length && Math.min(r, ...row.map((x) => x.r)) * ((W - gap * row.length) / (sum + r)) < minW) flush(false);
        row.push({ c, r }); sum += r;
        if ((W - gap * (row.length - 1)) / sum < target) flush(false);
      });
      flush(true);
    }
    const sorters = $$<HTMLElement>(".sorter");
    const justifyAll = () => sorters.forEach(justify);
    justifyAll();
    let rt: ReturnType<typeof setTimeout> | undefined;
    let lastW = innerWidth;
    /* phone toolbars collapsing fire a height-only resize; refitting then would make the work jump mid-scroll */
    on("resize", () => {
      if (innerWidth === lastW && small()) return;
      lastW = innerWidth;
      clearTimeout(rt); rt = setTimeout(() => { fitAll(); justifyAll(); }, 80);
    });

    /* ---------- players ---------- */
    const clicks = (e: MouseEvent) => {
      const btn = (e.target as Element).closest?.(".fig .watch");
      if (!btn) return;
      const fig = btn.closest<HTMLElement>(".fig")!;
      const src = fig.dataset.embed;
      if (!src) return;
      $$<HTMLVideoElement>("video").forEach((v) => v.pause());
      const f = document.createElement("iframe");
      f.src = src; f.allow = "autoplay; fullscreen; picture-in-picture; encrypted-media"; f.allowFullscreen = true;
      f.title = fig.querySelector("img, video")?.getAttribute("alt") || fig.querySelector("video")?.getAttribute("aria-label") || "Player";
      fig.querySelector("img, video")?.remove();
      fig.append(f); fig.classList.add("embedded");
      f.focus(); // the Watch button is gone now; keep keyboard focus on the player
    };
    document.addEventListener("click", clicks); off.push(() => document.removeEventListener("click", clicks));

    const noLoops = calm;
    let vio: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      vio = new IntersectionObserver((es) => es.forEach((e) => {
        $$<HTMLVideoElement>(".fig video", e.target).forEach((v) => {
          const fig = v.closest<HTMLElement>(".fig")!;
          if (e.isIntersecting) {
            if (noLoops) return;
            if (!v.src && fig.dataset.loop) v.src = fig.dataset.loop;
            v.play().catch(() => {});
          } else v.pause();
        });
      }), { threshold: 0.35 });
      $$(".slide, .ct-side").forEach((s) => s.querySelector(".fig video") && vio!.observe(s));
    }

    /* ---------- filter (archives) ---------- */
    const filter = document.querySelector<HTMLElement>(".filter[data-filter]");
    if (filter) {
      const items = $$<HTMLElement>("[data-cats]");
      const shown = filter.querySelector("[data-shown]");
      const key = `filter:${location.pathname}`;
      const apply = (b: HTMLButtonElement) => {
        $$<HTMLButtonElement>("button[data-val]", filter).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
        const val = b.dataset.val!;
        let n = 0;
        items.forEach((it) => { const ok = val === "all" || (it.dataset.cats || "").split("|").includes(val); it.hidden = !ok; if (ok) n++; });
        $$<HTMLElement>("[data-group]").forEach((g) => { g.hidden = !g.querySelector("[data-cats]:not([hidden])"); });
        if (shown) shown.textContent = pad(n);
        justifyAll();
      };
      const fclick = (e: MouseEvent) => {
        const b = (e.target as Element).closest<HTMLButtonElement>("button[data-val]"); if (!b) return;
        apply(b);
        try { sessionStorage.setItem(key, b.dataset.val!); } catch {}
      };
      /* coming back from a piece keeps the filter it was opened from */
      try {
        const saved = sessionStorage.getItem(key);
        const b = saved && saved !== "all" ? $$<HTMLButtonElement>("button[data-val]", filter).find((x) => x.dataset.val === saved) : null;
        if (b) apply(b);
      } catch {}
      filter.addEventListener("click", fclick); off.push(() => filter.removeEventListener("click", fclick));
    }

    /* ---------- chapters for the phone menu ---------- */
    const chaps: { id: string; name: string }[] = [];
    $$<HTMLElement>(".slide[id][data-chapter-name]").forEach((s) => { if (!chaps.some((c) => c.name === s.dataset.chapterName)) chaps.push({ id: s.id, name: s.dataset.chapterName! }); });
    dispatchEvent(new CustomEvent("deck:chapters", { detail: chaps }));

    /* the top bar's name shows once the cover's own lockup has scrolled under it (one name on screen at a time) */
    const lock = document.querySelector<HTMLElement>(".cover-slide .lock");
    if (lock) {
      const bar = document.querySelector<HTMLElement>(".top");
      const ac = () => root.classList.toggle("at-cover", lock.getBoundingClientRect().bottom > (bar?.offsetHeight ?? 56));
      ac(); on("scroll", ac, { passive: true });
    }

    if (mode === "doc") {
      const sc = () => root.classList.toggle("scrolled", scrollY > 8);
      sc(); on("scroll", sc, { passive: true });
    }

    /* ---------- deck: counter, progress, keys, overview ---------- */
    let ov: HTMLDivElement | null = null;
    let sio: IntersectionObserver | null = null;
    if (mode === "deck") {
      const slides = $$<HTMLElement>(".slide");
      const total = slides.length;
      let current = 0;
      /* Section / piece: sections are numbered in order (the cover isn't one), a section's divider reads
         "01 / Selected Work" and its pieces "01 / 01", "01 / 02"; the next section's first piece is "02 / 01". */
      const sections = [...new Set(slides.map((s) => s.dataset.chapter || "").filter(Boolean))];
      const counted = (s: HTMLElement) => !s.matches(".divider, .cover-slide");
      const place = slides.map((s) => {
        const c = s.dataset.chapter || "";
        const mates = slides.filter((t) => t.dataset.chapter === c && counted(t));
        return { s: c ? sections.indexOf(c) + 1 : 0, k: mates.indexOf(s) + 1, name: s.dataset.chapterName || "" };
      });
      /* a deck whose sections are single screens (a piece's own page) counts screens instead: "02 / 05" */
      const flat = place.every((p) => !p.s || p.k <= 1);
      const label = ({ s, k, name }: (typeof place)[number], html: boolean, i = 0) =>
        flat ? (html ? `${pad(i + 1)} <span>/ ${pad(total)}</span>` : `${pad(i + 1)} / ${pad(total)}`)
          : !s ? "" : html ? `${pad(s)} <span>/ ${k ? pad(k) : name}</span>` : k ? `${pad(s)} / ${pad(k)}` : pad(s);
      slides.forEach((s, i) => { const no = s.querySelector("[data-no]"); if (no) no.textContent = label(place[i], false, i); });
      const counter = document.querySelector<HTMLButtonElement>(".counter");
      const prog = document.querySelector<HTMLElement>(".prog");
      prog?.querySelector("ol")?.remove();
      type Ch = { id: string; name: string; from: number; n: number; li?: HTMLLIElement };
      const chapters: Ch[] = [];
      slides.forEach((s, i) => {
        const c = s.dataset.chapter || "";
        if (!chapters.length || chapters[chapters.length - 1].id !== c) chapters.push({ id: c, name: s.dataset.chapterName || "", from: i, n: 0 });
        chapters[chapters.length - 1].n++;
      });
      const go = (i: number) => { i = Math.max(0, Math.min(total - 1, i)); slides[i].scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "start" }); };
      if (prog) {
        const ol = document.createElement("ol");
        chapters.forEach((c) => {
          const li = document.createElement("li");
          li.style.flex = `${c.n} 1 0`;
          li.innerHTML = `<i><b></b></i><button type="button"><span class="sr">${esc(c.name || "Opening")}</span></button>`;
          li.querySelector("button")!.addEventListener("click", () => go(c.from));
          ol.append(li); c.li = li;
        });
        prog.append(ol);
      }
      const set = (i: number) => {
        current = i;
        if (counter) {
          counter.innerHTML = `${label({ ...place[i], name: esc(place[i].name) }, true, i)}<em>Overview</em>`;
          counter.setAttribute("aria-label", `Screen ${i + 1} of ${total}. Show all screens`);
        }
        const ci = chapters.findIndex((c) => i >= c.from && i < c.from + c.n);
        chapters.forEach((c, k) => {
          const b = c.li?.querySelector("b") as HTMLElement | null;
          if (b) b.style.width = k < ci ? "100%" : k > ci ? "0" : `${((i - c.from + 1) / c.n) * 100}%`;
        });
        const chap = prog?.querySelector(".chap");
        if (chap) { const c = chapters[ci]; chap.innerHTML = c && c.name ? `<b>${esc(c.name)}</b>` : "&nbsp;"; }
      };
      set(0);
      sio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) set(slides.indexOf(e.target as HTMLElement)); }), { threshold: 0.55 });
      slides.forEach((s) => sio!.observe(s));

      ov = document.createElement("div");
      ov.className = "overview"; ov.hidden = true; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-label", "All screens");
      ov.innerHTML = `<header><h2>${esc(host?.dataset.deckName || "Omar Kamel")} <span class="no" style="margin-left:10px">${pad(total)}</span></h2><button type="button" data-close>Close <kbd>Esc</kbd></button></header><ol></ol>`;
      const list = ov.querySelector("ol")!;
      let lastChap: string | undefined;
      slides.forEach((s, i) => {
        if (s.dataset.chapterName && s.dataset.chapter !== lastChap) {
          const h = document.createElement("li"); h.className = "chap-h"; h.textContent = s.dataset.chapterName; list.append(h);
        }
        lastChap = s.dataset.chapter;
        const li = document.createElement("li");
        const thumb = s.dataset.thumb || s.querySelector(".fig video")?.getAttribute("poster") || s.querySelector(".fig img, .illus img")?.getAttribute("src");
        const h = s.querySelector("h1, h2");
        const title = s.dataset.title || (h ? h.textContent!.replace(/\s*\|\s*/g, " | ").replace(/\s+/g, " ").trim() : "");
        li.innerHTML = `<button type="button"><span class="th${thumb ? "" : " txt"}">${thumb ? `<img src="${thumb}" alt="" loading="lazy">` : h ? `<span>${h.innerHTML}</span>` : ""}</span><span class="cap"><span class="no">${pad(i + 1)}</span><span></span></span></button>`;
        (li.querySelector(".cap > span:last-child") as HTMLElement).textContent = title;
        li.querySelector("button")!.addEventListener("click", () => { close(); slides[i].scrollIntoView({ block: "start" }); });
        list.append(li);
      });
      document.body.append(ov);
      let opener: Element | null = null;
      const behind = () => $$<HTMLElement>("main, .top, .foot-bar");
      const open = () => {
        opener = document.activeElement;
        const cards = $$<HTMLLIElement>("li:not(.chap-h)", list);
        cards.forEach((l) => l.classList.remove("now")); cards[current]?.classList.add("now");
        ov!.hidden = false; root.style.overflow = "hidden";
        behind().forEach((el) => { el.inert = true; });
        (cards[current] || cards[0])?.querySelector("button")?.focus();
      };
      const close = () => { ov!.hidden = true; root.style.overflow = ""; behind().forEach((el) => { el.inert = false; }); (opener as HTMLElement | null)?.focus?.(); };
      ov.querySelector("[data-close]")!.addEventListener("click", close);
      counter?.addEventListener("click", open); off.push(() => counter?.removeEventListener("click", open));
      on("deck:overview" as keyof WindowEventMap, open);
      dispatchEvent(new CustomEvent("deck:screens", { detail: total }));

      const keys = (e: KeyboardEvent) => {
        if (e.altKey || e.ctrlKey || e.metaKey) return;
        const t = (e.target as HTMLElement).tagName;
        if (["INPUT", "TEXTAREA", "SELECT", "VIDEO", "IFRAME"].includes(t)) return;
        if (!ov!.hidden) { if (e.key === "Escape" || e.key === "g") { e.preventDefault(); close(); } return; }
        if (!document.querySelector<HTMLElement>(".sheet")?.hidden) return;
        if (e.key === "g" || e.key === "G") { e.preventDefault(); open(); return; }
        if (small()) return;
        const fwd = ["ArrowDown", "ArrowRight", "PageDown"].includes(e.key) || (e.key === " " && !e.shiftKey && t !== "BUTTON" && t !== "A");
        const back = ["ArrowUp", "ArrowLeft", "PageUp"].includes(e.key) || (e.key === " " && e.shiftKey);
        const body = slides[current].querySelector<HTMLElement>(":scope.textslide > .body");
        if (body && body.scrollHeight > body.clientHeight + 2 && (fwd || back) && !e.key.startsWith("ArrowL") && !e.key.startsWith("ArrowR")) {
          const room = fwd ? body.scrollHeight - body.clientHeight - body.scrollTop : body.scrollTop;
          if (room > 2) { e.preventDefault(); body.scrollBy({ top: (fwd ? 1 : -1) * body.clientHeight * 0.8, behavior: calm ? "auto" : "smooth" }); return; }
        }
        if (["ArrowDown", "ArrowRight", "PageDown"].includes(e.key) || (e.key === " " && !e.shiftKey && t !== "BUTTON" && t !== "A")) { e.preventDefault(); go(current + 1); }
        else if (["ArrowUp", "ArrowLeft", "PageUp"].includes(e.key) || (e.key === " " && e.shiftKey)) { e.preventDefault(); go(current - 1); }
        else if (e.key === "Home") { e.preventDefault(); go(0); }
        else if (e.key === "End") { e.preventDefault(); go(total - 1); }
      };
      document.addEventListener("keydown", keys); off.push(() => document.removeEventListener("keydown", keys));
    }

    return () => {
      dispatchEvent(new CustomEvent("deck:screens", { detail: 0 }));
      off.forEach((f) => f());
      vio?.disconnect(); sio?.disconnect();
      ov?.remove(); root.style.overflow = "";
      document.querySelectorAll<HTMLElement>("main, .top, .foot-bar").forEach((el) => { el.inert = false; });
      clearTimeout(rt);
      root.classList.remove("deck", "doc", "at-cover", "scrolled");
      document.querySelector(".prog ol")?.remove();
    };
  }, [path, mode]);

  return (
    <div data-mode={mode} data-deck-name={name}>
      {children}
    </div>
  );
}
