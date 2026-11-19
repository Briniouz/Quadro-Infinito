'use strict';
/* =========================================================
   Quadro — quadro infinito pessoal
   JavaScript puro, sem dependências. Tudo fica salvo no
   IndexedDB do navegador.
   ========================================================= */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const NS = 'http://www.w3.org/2000/svg';
  const root = document.documentElement;
  const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const r2 = n => Math.round(n * 100) / 100;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const svgEl = (tag, attrs = {}) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
  const setA = (e, attrs) => { for (const k in attrs) { const v = attrs[k]; if (v == null) e.removeAttribute(k); else if (e.getAttribute(k) !== String(v)) e.setAttribute(k, v); } };
  const strip = (k, v) => (k[0] === '_' ? undefined : v);
  const clone = o => JSON.parse(JSON.stringify(o, strip));
  const CLIP = 'quadro-infinito:v1:';

  /* ---------------- ícones ---------------- */
  const I = {
    select: '<path d="M6 3.5 18.5 11l-5.6 1.4-2.8 5.6z"/>',
    hand: '<path d="M8 12.5V6a1.5 1.5 0 0 1 3 0v5.5M11 11V4.5a1.5 1.5 0 0 1 3 0V11M14 11V6a1.5 1.5 0 0 1 3 0v6"/><path d="M17 9.5a1.5 1.5 0 0 1 3 0V15a6.5 6.5 0 0 1-6.5 6.5h-1a6.5 6.5 0 0 1-5.3-2.7l-3-4.3a1.6 1.6 0 0 1 2.5-2l1.3 1.3"/>',
    pen: '<path d="m4 20 1-4.5L15.5 5a2.1 2.1 0 0 1 3 3L8 18.5z"/><path d="m13.5 7 3 3"/>',
    hl: '<path d="m9 15-3.5 3.5H10l1.2-1.2"/><path d="m9 15 3 3 8.2-8.2a2 2 0 0 0 0-2.8l-1.2-1.2a2 2 0 0 0-2.8 0z"/><path d="M4 21h16" opacity=".5"/>',
    eraser: '<path d="M7.5 20H20"/><path d="m4.6 15.4 9.2-9.2a2 2 0 0 1 2.8 0l3.2 3.2a2 2 0 0 1 0 2.8L13 19H8.2z"/><path d="m9.5 10.5 4.9 4.9"/>',
    rect: '<rect x="4" y="5.5" width="16" height="13" rx="2.5"/>',
    ellipse: '<ellipse cx="12" cy="12" rx="8.5" ry="6.5"/>',
    diamond: '<path d="M12 3.5 20.5 12 12 20.5 3.5 12z"/>',
    arrow: '<path d="M5 19 19 5"/><path d="M10 5h9v9"/>',
    line: '<path d="M5 19 19 5"/>',
    text: '<path d="M5 7V5h14v2M12 5v14M9 19h6"/>',
    note: '<path d="M5 4.5h14v10l-5 5H5z"/><path d="M14 19.5v-5h5"/>',
    table: '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><path d="M3.5 9.5h17M3.5 14.5h17M9.5 4.5v15"/>',
    image: '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="9" cy="9.5" r="1.7"/><path d="m4 17 4.5-4.5 3.5 3.5 2.5-2.5L20 19"/>',
    branch: '<rect x="3" y="9" width="7" height="6" rx="2"/><rect x="14" y="3.5" width="7" height="6" rx="2"/><rect x="14" y="14.5" width="7" height="6" rx="2"/><path d="M10 12h2m0 0V6.5h2M12 12v5.5h2"/>',
    edit: '<path d="m4 20 1-4.5L15.5 5a2.1 2.1 0 0 1 3 3L8 18.5z"/>',
    dup: '<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
    front: '<rect x="8" y="8" width="11" height="11" rx="2"/><path d="M5 15V7a2 2 0 0 1 2-2h8"/>',
    back: '<rect x="5" y="5" width="11" height="11" rx="2" opacity=".45"/><path d="M19 9v8a2 2 0 0 1-2 2H9"/>',
    trash: '<path d="M4.5 7h15M10 11v6M14 11v6"/><path d="M6.5 7l.8 11.2A2 2 0 0 0 9.3 20h5.4a2 2 0 0 0 2-1.8L17.5 7M9.5 7V5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2"/>',
    rowAdd: '<rect x="3.5" y="4" width="17" height="9" rx="2"/><path d="M12 15.5v5M9.5 18h5"/>',
    colAdd: '<rect x="4" y="3.5" width="9" height="17" rx="2"/><path d="M15.5 12h5M18 9.5v5"/>',
    rowDel: '<rect x="3.5" y="4" width="17" height="9" rx="2"/><path d="M9.5 18h5"/>',
    colDel: '<rect x="4" y="3.5" width="9" height="17" rx="2"/><path d="M15.5 12h5"/>',
    header: '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><path d="M3.5 9.5h17"/><path d="M4 5h16v4.5H4z" fill="currentColor" stroke="none" opacity=".35"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v2.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V16"/>',
    download: '<path d="M12 4v12M7 11l5 5 5-5"/><path d="M4 16v2.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V16"/>',
    keyboard: '<rect x="2.5" y="6" width="19" height="12" rx="2.5"/><path d="M6 10h.01M9.5 10h.01M13 10h.01M16.5 10h.01M7 14h10"/>',
    sheet: '<rect x="4" y="3.5" width="16" height="17" rx="2.5"/><path d="M4 9h16M4 14.5h16M10 9v11.5"/>',
    broom: '<path d="M14 4 9.5 12"/><path d="M6 13h8l1.5 7h-11z"/>',
  };
  const icon = (n, extra = '') => `<svg viewBox="0 0 24 24" aria-hidden="true" ${extra}>${I[n]}</svg>`;

  /* ---------------- dados e preferências ---------------- */
  const PALETTE = ['ink', '#e5484d', '#f76b15', '#f5b301', '#30a46c', '#12a594', '#0090ff', '#6e56cf', '#d6409f', '#8b8d98'];
  const NOTE_COLORS = ['#f5b301', '#f76b15', '#e5484d', '#d6409f', '#6e56cf', '#0090ff', '#12a594', '#30a46c', '#8b8d98', 'ink'];
  const col = c => (c === 'ink' ? 'var(--ink)' : c);
  const DEFAULT_STYLES = {
    pen: { color: 'ink', size: 4, opacity: 1 },
    hl: { color: '#f5b301', size: 22 },
    eraser: { size: 22 },
    shape: { color: 'ink', sw: 2, fill: 'none', dashed: false, fontSize: 18 },
    arrow: { color: 'ink', sw: 2, dashed: false, head: true },
    text: { color: 'ink', fontSize: 22 },
    note: { color: '#f5b301', fontSize: 17 },
    table: { color: '#0090ff' },
  };
  const DEFAULT_SETTINGS = { barrel: 'erase-hold', middle: 'pan-hold', penOnly: true, pressure: true, smoothing: 0.45, bg: 'dots', wheel: 'pan', refraction: true };
  const PEN_ACTIONS = [
    ['erase-hold', 'Segurar = borracha'],
    ['pan-hold', 'Segurar = mover quadro'],
    ['toggle-select', 'Clique = caneta ⇄ seleção'],
    ['toggle-eraser', 'Clique = caneta ⇄ borracha'],
    ['undo', 'Clique = desfazer'],
    ['none', 'Nada'],
  ];

  const DB = {
    db: null, mem: null,
    open() {
      return new Promise((res, rej) => {
        if (!globalThis.indexedDB) return rej(Error('sem IndexedDB'));
        const r = indexedDB.open('quadro-infinito', 1);
        r.onupgradeneeded = () => r.result.createObjectStore('kv');
        r.onsuccess = () => { this.db = r.result; res(); };
        r.onerror = () => rej(r.error);
      });
    },
    req(mode, fn) {
      if (!this.db) return Promise.resolve(fn(null));
      return new Promise((res, rej) => {
        const tx = this.db.transaction('kv', mode); const st = tx.objectStore('kv'); const r = fn(st);
        tx.oncomplete = () => res(r && 'result' in r ? r.result : undefined);
        tx.onerror = () => rej(tx.error); tx.onabort = () => rej(tx.error);
      });
    },
    get(k) { return this.db ? this.req('readonly', st => st.get(k)) : Promise.resolve(this.mem.get(k)); },
    set(k, v) { return this.db ? this.req('readwrite', st => st.put(v, k)) : Promise.resolve(void this.mem.set(k, v)); },
    del(k) { return this.db ? this.req('readwrite', st => st.delete(k)) : Promise.resolve(void this.mem.delete(k)); },
  };

  /* ---------------- estado ---------------- */
  let meta = null, board = null;
  let tool = 'pen', lastDraw = 'pen';
  const selection = new Set();
  let editing = null;
  let gesture = null;
  let heldOverride = null;
  let spaceDown = false;
  let lastPenTime = 0;
  let lastClick = null;
  let pointerWorld = null;
  const nodes = new Map();
  const histories = new Map();
  let hist = null;
  const styles = () => meta.styles;
  const S = () => meta.settings;

  const svg = $('#board'), world = $('#world'), layer = $('#layer'), overlay = $('#overlay');
  const byId = id => (id ? board.elements.find(e => e.id === id) : undefined);
  const isNode = el => el && ['rect', 'ellipse', 'diamond', 'note', 'text'].includes(el.type);
  const isBindable = el => el && ['rect', 'ellipse', 'diamond', 'note', 'text', 'image', 'table'].includes(el.type);
  const editable = el => el && ['rect', 'ellipse', 'diamond', 'note', 'text', 'table'].includes(el.type);
  const isTyping = t => t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));

  /* ---------------- câmera ---------------- */
  const toWorld = e => { const c = board.cam; return [(e.clientX - c.x) / c.z, (e.clientY - c.y) / c.z]; };
  const viewCenter = () => { const c = board.cam; return [(innerWidth / 2 - c.x) / c.z, (innerHeight / 2 - c.y) / c.z]; };
  function applyCam() {
    const c = board.cam;
    world.setAttribute('transform', `translate(${r2(c.x)} ${r2(c.y)}) scale(${c.z})`);
    let gs = 24 * c.z; while (gs < 14) gs *= 4; while (gs > 96) gs /= 4;
    const g = $('#grid').style;
    g.setProperty('--gs', gs + 'px');
    g.setProperty('--gx', (c.x % gs) - gs / 2 + 'px');
    g.setProperty('--gy', (c.y % gs) - gs / 2 + 'px');
    $('#zoomLabel').textContent = Math.round(c.z * 100) + '%';
    renderOverlay();
  }
  function zoomAt(f, sx, sy) {
    const c = board.cam; const nz = clamp(c.z * f, 0.08, 8);
    const wx = (sx - c.x) / c.z, wy = (sy - c.y) / c.z;
    c.z = nz; c.x = sx - wx * nz; c.y = sy - wy * nz;
    applyCam(); scheduleSave();
  }
  function fitAll() {
    const all = board.elements; const c = board.cam;
    if (!all.length) { c.z = 1; c.x = innerWidth / 2; c.y = innerHeight / 2; applyCam(); return; }
    const b = unionBox(all.map(bb));
    const W = innerWidth - (innerWidth > 900 ? 500 : 60), H = innerHeight - 220;
    const z = clamp(Math.min(W / Math.max(b.w, 1), H / Math.max(b.h, 1)), 0.08, 2);
    c.z = z; c.x = innerWidth / 2 - (b.x + b.w / 2) * z; c.y = innerHeight / 2 - (b.y + b.h / 2) * z + 10;
    applyCam(); scheduleSave();
  }

  /* ---------------- geometria ---------------- */
  function bb(el) {
    if (el.type === 'stroke') {
      if (!el._bb) {
        let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
        for (const p of el.pts) { if (p[0] < x0) x0 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[0] > x1) x1 = p[0]; if (p[1] > y1) y1 = p[1]; }
        const pad = el.size / 2 + 1;
        el._bb = { x: x0 - pad, y: y0 - pad, w: x1 - x0 + pad * 2, h: y1 - y0 + pad * 2 };
      }
      return el._bb;
    }
    if (el.type === 'arrow') {
      const [a, b] = arrowPts(el);
      return { x: Math.min(a[0], b[0]), y: Math.min(a[1], b[1]), w: Math.abs(a[0] - b[0]), h: Math.abs(a[1] - b[1]) };
    }
    return { x: el.x, y: el.y, w: el.w || 0, h: el.h || 0 };
  }
  const ctr = b => [b.x + b.w / 2, b.y + b.h / 2];
  function unionBox(list) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const b of list) { x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y); x1 = Math.max(x1, b.x + b.w); y1 = Math.max(y1, b.y + b.h); }
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  }
  function distSeg(p, a, b) {
    const dx = b[0] - a[0], dy = b[1] - a[1], l = dx * dx + dy * dy;
    const t = l ? clamp(((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l, 0, 1) : 0;
    return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
  }
  const inBox = (b, p, t = 0) => p[0] >= b.x - t && p[0] <= b.x + b.w + t && p[1] >= b.y - t && p[1] <= b.y + b.h + t;
  function edgePoint(el, c, t, gap) {
    const b = bb(el); let dx = t[0] - c[0], dy = t[1] - c[1]; const d = Math.hypot(dx, dy);
    if (d < 1e-6) return c;
    dx /= d; dy /= d;
    const a = b.w / 2 + gap, h = b.h / 2 + gap; let k;
    if (el.type === 'ellipse') k = 1 / Math.sqrt((dx / a) ** 2 + (dy / h) ** 2);
    else if (el.type === 'diamond') k = 1 / (Math.abs(dx) / a + Math.abs(dy) / h);
    else k = Math.min(Math.abs(dx) > 1e-9 ? a / Math.abs(dx) : Infinity, Math.abs(dy) > 1e-9 ? h / Math.abs(dy) : Infinity);
    k = Math.min(k, d);
    return [c[0] + dx * k, c[1] + dy * k];
  }
  function arrowPts(el) {
    const A = byId(el.sb), B = byId(el.eb);
    let a = [el.x1, el.y1], b = [el.x2, el.y2];
    const ca = A ? ctr(bb(A)) : a, cb = B ? ctr(bb(B)) : b;
    if (A) a = edgePoint(A, ca, cb, 7);
    if (B) b = edgePoint(B, cb, ca, 7);
    return [a, b];
  }
  function hitEl(el, p, tol) {
    if (el.type === 'stroke') {
      if (!inBox(bb(el), p, tol)) return false;
      const r = el.size / 2 + tol, P = el.pts;
      if (P.length === 1) return Math.hypot(p[0] - P[0][0], p[1] - P[0][1]) < r;
      for (let i = 1; i < P.length; i++) if (distSeg(p, P[i - 1], P[i]) < r) return true;
      return false;
    }
    if (el.type === 'arrow') { const [a, b] = arrowPts(el); return distSeg(p, a, b) < tol + (el.sw || 2); }
    return inBox(bb(el), p, tol);
  }
  function hitTest(p, tol, filter) {
    const list = board.elements;
    for (let i = list.length - 1; i >= 0; i--) { const el = list[i]; if ((!filter || filter(el)) && hitEl(el, p, tol)) return el; }
    return null;
  }
  const bindableAt = (p, except) => hitTest(p, 2 / board.cam.z, el => isBindable(el) && el.id !== except);

  /* ---------------- traço com pressão ---------------- */
  const fp = p => r2(p[0]) + ' ' + r2(p[1]);
  function smoothThrough(P) {
    let s = '';
    for (let i = 1; i < P.length - 1; i++) s += ` Q${fp(P[i])} ${fp([(P[i][0] + P[i + 1][0]) / 2, (P[i][1] + P[i + 1][1]) / 2])}`;
    return s + ` L${fp(P[P.length - 1])}`;
  }
  function polyPath(pts) {
    if (pts.length === 1) return `M${fp(pts[0])} l0.01 0`;
    return `M${fp(pts[0])}` + smoothThrough(pts);
  }
  function outlinePath(pts, size, usePr) {
    const n = pts.length;
    const rad = i => (size / 2) * (usePr ? 0.28 + 0.72 * (pts[i][2] ?? 0.5) : 0.78);
    if (n === 1 || (n === 2 && Math.hypot(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]) < 0.5)) {
      const r = Math.max(rad(0), 0.6), [x, y] = pts[0];
      return `M${r2(x - r)} ${r2(y)} a${r2(r)} ${r2(r)} 0 1 0 ${r2(r * 2)} 0 a${r2(r)} ${r2(r)} 0 1 0 ${r2(-r * 2)} 0Z`;
    }
    const L = [], R = [];
    for (let i = 0; i < n; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], p = pts[i];
      let dx = b[0] - a[0], dy = b[1] - a[1]; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
      const r = Math.max(rad(i), 0.35);
      L.push([p[0] - dy * r, p[1] + dx * r]); R.push([p[0] + dy * r, p[1] - dx * r]);
    }
    const re = Math.max(rad(n - 1), 0.35), rs = Math.max(rad(0), 0.35);
    const Rr = R.slice().reverse();
    return `M${fp(L[0])}` + smoothThrough(L) + ` A${r2(re)} ${r2(re)} 0 0 0 ${fp(Rr[0])}` + smoothThrough(Rr) + ` A${r2(rs)} ${r2(rs)} 0 0 0 ${fp(L[0])}Z`;
  }

  /* ---------------- HTML seguro ---------------- */
  const OK_TAGS = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'S', 'BR', 'DIV', 'P', 'SPAN', 'UL', 'OL', 'LI']);
  function clean(html) {
    const t = document.createElement('template'); t.innerHTML = String(html || '');
    const walk = node => {
      for (const ch of [...node.childNodes]) {
        if (ch.nodeType === 1) {
          if (/^(SCRIPT|STYLE|IFRAME|OBJECT|EMBED|LINK|META)$/.test(ch.tagName)) { ch.remove(); continue; }
          walk(ch);
          if (!OK_TAGS.has(ch.tagName)) ch.replaceWith(...ch.childNodes);
          else for (const a of [...ch.attributes]) ch.removeAttribute(a.name);
        } else if (ch.nodeType !== 3) ch.remove();
      }
    };
    walk(t.content);
    return t.innerHTML;
  }
  const textOf = html => { const d = document.createElement('div'); d.innerHTML = clean(html); return d.textContent || ''; };
  const textToHtml = t => esc(t).replace(/\n/g, '<br>');

  /* ---------------- planilha: fórmulas ---------------- */
  const colName = c => { let s = ''; c++; while (c > 0) { const m = (c - 1) % 26; s = String.fromCharCode(65 + m) + s; c = Math.floor((c - 1) / 26); } return s; };
  const colIndex = s => [...s].reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0) - 1;
  function toNum(v) {
    if (typeof v === 'number') return v;
    let t = String(v ?? '').trim().replace(/\s/g, '').replace(/^R\$/i, '');
    if (t === '') return NaN;
    let pct = false; if (t.endsWith('%')) { pct = true; t = t.slice(0, -1); }
    if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.');
    const n = Number(t);
    return isNaN(n) ? NaN : pct ? n / 100 : n;
  }
  const FN = {
    SOMA: a => a.reduce((s, x) => s + x, 0),
    MEDIA: a => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0),
    MIN: a => (a.length ? Math.min(...a) : 0),
    MAX: a => (a.length ? Math.max(...a) : 0),
    CONT: a => a.length,
    MULT: a => a.reduce((s, x) => s * x, 1),
    RAIZ: a => Math.sqrt(a[0]),
    ABS: a => Math.abs(a[0]),
    ARRED: a => { const f = 10 ** (a[1] || 0); return Math.round(a[0] * f) / f; },
    POT: a => a[0] ** a[1],
  };
  Object.assign(FN, { SUM: FN.SOMA, AVERAGE: FN.MEDIA, AVG: FN.MEDIA, COUNT: FN.CONT, PRODUCT: FN.MULT, SQRT: FN.RAIZ, ROUND: FN.ARRED, POWER: FN.POT });
  function evalTable(el) {
    const cache = new Map(), out = [];
    const get = (r, c, stack) => {
      const key = r + ',' + c;
      if (cache.has(key)) return cache.get(key);
      const raw = el.cells[r]?.[c] ?? '';
      if (!String(raw).startsWith('=')) { cache.set(key, raw); return raw; }
      if (stack.has(key)) throw Error('#CICLO');
      stack.add(key);
      let v;
      try { v = evalExpr(String(raw).slice(1), (rr, cc) => get(rr, cc, stack)); }
      finally { stack.delete(key); }
      cache.set(key, v); return v;
    };
    for (let r = 0; r < el.cells.length; r++) {
      out.push(el.cells[r].map((raw, c) => {
        if (!String(raw).startsWith('=')) return { text: raw, num: !isNaN(toNum(raw)) };
        try {
          const v = get(r, c, new Set());
          return typeof v === 'number' ? { text: v.toLocaleString('pt-BR', { maximumFractionDigits: 6 }), num: true } : { text: String(v), num: false };
        } catch (e) { return { text: /^#/.test(e.message) ? e.message : '#ERRO', err: true }; }
      }));
    }
    return out;
  }
  function evalExpr(expr, get) {
    let s = expr.toUpperCase().replace(/MÉDIA/g, 'MEDIA').replace(/\s+/g, '');
    const fnRe = /([A-Z]+)\(([^()]*)\)/;
    let guard = 0;
    while (fnRe.test(s) && guard++ < 200) {
      s = s.replace(fnRe, (m, name, args) => {
        const f = FN[name]; if (!f) throw Error('#NOME');
        const vals = [];
        for (const a of args.split(';').flatMap(x => (args.includes(';') ? [x] : x.split(',')))) {
          if (!a) continue;
          const rg = /^([A-Z]+)(\d+):([A-Z]+)(\d+)$/.exec(a);
          if (rg) {
            const c0 = colIndex(rg[1]), r0 = +rg[2] - 1, c1 = colIndex(rg[3]), r1 = +rg[4] - 1;
            for (let r = Math.min(r0, r1); r <= Math.max(r0, r1); r++) for (let c = Math.min(c0, c1); c <= Math.max(c0, c1); c++) {
              const n = toNum(get(r, c)); if (!isNaN(n)) vals.push(n);
            }
          } else vals.push(arith(a, get));
        }
        return '(' + f(vals) + ')';
      });
    }
    return arith(s, get);
  }
  function arith(s, get) {
    s = s.replace(/\b([A-Z]+)(\d+)\b/g, (m, c, r) => {
      const v = get(+r - 1, colIndex(c)); const n = String(v).trim() === '' ? 0 : toNum(v);
      if (isNaN(n)) throw Error('#VALOR');
      return '(' + n + ')';
    });
    s = s.replace(/(\d),(\d)/g, '$1.$2').replace(/(\d+(?:\.\d+)?)%/g, '($1/100)').replace(/\^/g, '**');
    if (!/^[\d.+\-*/()eE]*$/.test(s) || !s) throw Error('#ERRO');
    const v = Function('"use strict";return (' + s + ')')();
    if (typeof v !== 'number' || isNaN(v)) throw Error('#ERRO');
    if (!isFinite(v)) throw Error('#DIV/0');
    return v;
  }
  function parseDelimited(text) {
    text = text.replace(/\r\n?/g, '\n').replace(/\n+$/, '');
    const first = text.split('\n')[0];
    const delim = first.includes('\t') ? '\t' : first.split(';').length > first.split(',').length ? ';' : ',';
    const rows = []; let row = [], cell = '', q = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (q) { if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += ch; }
      else if (ch === '"' && cell === '') q = true;
      else if (ch === delim) { row.push(cell); cell = ''; }
      else if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
      else cell += ch;
    }
    row.push(cell); rows.push(row);
    const R = rows.slice(0, 300), W = Math.min(40, Math.max(...R.map(r => r.length)));
    return R.map(r => Array.from({ length: W }, (_, i) => (r[i] ?? '').trim()));
  }

  /* ---------------- renderização ---------------- */
  function createNode(el) {
    let n;
    if (el.type === 'stroke') n = svgEl('path', { class: 'el el-stroke' });
    else if (el.type === 'arrow') { n = svgEl('g', { class: 'el el-arrow' }); n.append(svgEl('path', { class: 'a-line' }), svgEl('path', { class: 'a-head' })); }
    else if (['rect', 'ellipse', 'diamond'].includes(el.type)) {
      n = svgEl('g', { class: 'el el-shape' });
      n.append(svgEl(el.type === 'ellipse' ? 'ellipse' : el.type === 'rect' ? 'rect' : 'polygon', { class: 's-body' }));
      const fo = svgEl('foreignObject', { class: 's-fo' }); const d = document.createElement('div'); d.className = 's-label editable'; fo.append(d); n.append(fo);
    } else if (el.type === 'image') n = svgEl('image', { class: 'el el-image', preserveAspectRatio: 'none' });
    else { n = svgEl('foreignObject', { class: 'el el-fo el-' + el.type }); const d = document.createElement('div'); d.className = 'fo-inner'; n.append(d); }
    n.dataset.id = el.id;
    return n;
  }
  function renderEl(el) {
    let n = nodes.get(el.id);
    if (!n) { n = createNode(el); nodes.set(el.id, n); el._dirty = true; }
    if (el._dirty || el.type === 'arrow') { updateNode(el, n); el._dirty = false; }
    return n;
  }
  function updateNode(el, n) {
    const isEd = editing?.id === el.id;
    switch (el.type) {
      case 'stroke': {
        setA(n, { d: el.hl ? polyPath(el.pts) : outlinePath(el.pts, el.size, el.pr) });
        n.classList.toggle('hl', !!el.hl);
        if (el.hl) Object.assign(n.style, { fill: 'none', stroke: col(el.color), strokeWidth: el.size, strokeLinecap: 'round', strokeLinejoin: 'round', opacity: 0.4 });
        else Object.assign(n.style, { fill: col(el.color), stroke: 'none', opacity: el.opacity ?? 1 });
        break;
      }
      case 'arrow': {
        const [a, b] = arrowPts(el);
        if (el.sb || el.eb) { el.x1 = r2(a[0]); el.y1 = r2(a[1]); el.x2 = r2(b[0]); el.y2 = r2(b[1]); }
        const sw = el.sw || 2, s = 7 + sw * 2.4, dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
        const head = el.head !== false && d > 2;
        const end = head ? [b[0] - ux * s * 0.65, b[1] - uy * s * 0.65] : b;
        const [line, hd] = n.children;
        setA(line, { d: `M${fp(a)} L${fp(end)}` });
        Object.assign(line.style, { fill: 'none', stroke: col(el.color), strokeWidth: sw, strokeLinecap: 'round', strokeDasharray: el.dashed ? `${sw * 3} ${sw * 2.6}` : '' });
        setA(hd, { d: head ? `M${fp(b)} L${fp([b[0] - ux * s - uy * s * 0.52, b[1] - uy * s + ux * s * 0.52])} L${fp([b[0] - ux * s + uy * s * 0.52, b[1] - uy * s - ux * s * 0.52])}Z` : '' });
        Object.assign(hd.style, { fill: col(el.color), stroke: col(el.color), strokeWidth: sw * 0.7, strokeLinejoin: 'round' });
        break;
      }
      case 'rect': case 'ellipse': case 'diamond': {
        const [body, fo] = n.children; const { x, y, w, h } = el;
        if (el.type === 'rect') setA(body, { x, y, width: w, height: h, rx: r2(Math.min(14, w / 4, h / 4)) });
        else if (el.type === 'ellipse') setA(body, { cx: x + w / 2, cy: y + h / 2, rx: w / 2, ry: h / 2 });
        else setA(body, { points: `${x + w / 2},${y} ${x + w},${y + h / 2} ${x + w / 2},${y + h} ${x},${y + h / 2}` });
        const sw = el.sw || 2;
        Object.assign(body.style, {
          stroke: col(el.color), strokeWidth: sw, strokeLinejoin: 'round',
          fill: el.fill === 'none' ? 'transparent' : col(el.color), fillOpacity: el.fill === 'solid' ? 1 : el.fill === 'soft' ? 0.16 : 0,
          strokeDasharray: el.dashed ? `${sw * 3} ${sw * 2.6}` : '',
        });
        setA(fo, { x, y, width: Math.max(w, 1), height: Math.max(h, 1) });
        const d = fo.firstChild;
        d.style.fontSize = (el.fontSize || 18) + 'px';
        d.style.color = el.fill === 'solid' ? 'var(--paper)' : 'var(--ink)';
        if (!isEd) d.innerHTML = clean(el.html);
        break;
      }
      case 'image':
        setA(n, { x: el.x, y: el.y, width: Math.max(el.w, 1), height: Math.max(el.h, 1) });
        if (n.getAttribute('href') !== board.assets[el.asset]) n.setAttribute('href', board.assets[el.asset] || '');
        break;
      default: {
        setA(n, { x: el.x, y: el.y, width: Math.max(el.w || 1, 1), height: Math.max(el.h || 1, 1) });
        const d = n.firstChild;
        if (el.type === 'text') {
          d.className = 'fo-inner t-text' + (isEd ? ' editable' : '');
          d.style.cssText = `color:${col(el.color)};font-size:${el.fontSize}px;` + (el.autoW ? 'width:max-content;max-width:1400px' : `width:${el.w}px`);
          if (!isEd) d.innerHTML = clean(el.html);
        } else if (el.type === 'note') {
          d.className = 'fo-inner t-note' + (isEd ? ' editable' : '');
          d.style.cssText = `--nc:${col(el.color)};font-size:${el.fontSize}px;width:${el.w}px;min-height:${el.minH || 110}px`;
          if (!isEd) d.innerHTML = clean(el.html);
        } else if (el.type === 'table') {
          d.className = 'fo-inner t-table';
          d.style.cssText = `--tc:${col(el.color)}`;
          if (!isEd) d.innerHTML = tableHTML(el);
        }
      }
    }
  }
  function tableHTML(el) {
    const vals = evalTable(el);
    let h = '<table><tbody>';
    el.cells.forEach((row, r) => {
      h += '<tr>';
      row.forEach((_, c) => {
        const v = vals[r][c];
        h += `<td data-r="${r}" data-c="${c}" class="${el.header && r === 0 ? 'th' : ''}${v.num && !(el.header && r === 0) ? ' num' : ''}${v.err ? ' err' : ''}">${esc(v.text)}</td>`;
      });
      h += '</tr>';
    });
    return h + '</tbody></table>';
  }
  function measureEl(el) {
    const n = nodes.get(el.id);
    if (!n || n.tagName !== 'foreignObject') return;
    const d = n.firstChild; const w = d.offsetWidth, h = d.offsetHeight;
    if (!w && !h) return;
    el.w = w; el.h = h;
    setA(n, { width: w + 1, height: h + 1 });
  }
  function renderArrows() { for (const el of board.elements) if (el.type === 'arrow') renderEl(el); }
  function renderAll() {
    const ids = new Set(board.elements.map(e => e.id));
    for (const [id, n] of nodes) if (!ids.has(id)) { n.remove(); nodes.delete(id); }
    let prev = null;
    for (const el of board.elements) {
      const n = renderEl(el);
      const expected = prev ? prev.nextSibling : layer.firstChild;
      if (n !== expected) layer.insertBefore(n, expected);
      prev = n;
    }
    for (const el of board.elements) if (el.type === 'text' || el.type === 'note' || el.type === 'table') measureEl(el);
    renderArrows();
    renderOverlay();
  }
  const dirtyAll = () => { for (const el of board.elements) { el._dirty = true; el._bb = null; } };

  /* ---------------- overlay de seleção ---------------- */
  function handlesFor(el) {
    const z = board.cam.z;
    if (el.type === 'arrow') { const [a, b] = arrowPts(el); return [{ h: 'p1', x: a[0], y: a[1] }, { h: 'p2', x: b[0], y: b[1] }]; }
    if (el.type === 'table') return [];
    const b = bb(el), p = 6 / z;
    return [{ h: 'nw', x: b.x - p, y: b.y - p }, { h: 'ne', x: b.x + b.w + p, y: b.y - p }, { h: 'sw', x: b.x - p, y: b.y + b.h + p }, { h: 'se', x: b.x + b.w + p, y: b.y + b.h + p }];
  }
  function renderOverlay() {
    if (!board) return;
    overlay.replaceChildren();
    const z = board.cam.z, pad = 6 / z, multi = selection.size > 1;
    for (const id of selection) {
      const el = byId(id); if (!el) continue;
      if (el.type === 'arrow' && !multi) continue;
      const b = bb(el);
      overlay.append(svgEl('rect', { x: b.x - pad, y: b.y - pad, width: b.w + pad * 2, height: b.h + pad * 2, rx: 8 / z, class: 'sel-box' + (multi ? ' multi' : ''), 'stroke-width': 1.5 / z }));
    }
    if (selection.size === 1 && (!gesture || gesture.kind === 'noop')) {
      const el = byId([...selection][0]);
      if (el) for (const h of handlesFor(el)) {
        if (el.type === 'arrow') overlay.append(svgEl('circle', { cx: h.x, cy: h.y, r: 5.5 / z, class: 'handle', 'stroke-width': 1.6 / z }));
        else overlay.append(svgEl('rect', { x: h.x - 5 / z, y: h.y - 5 / z, width: 10 / z, height: 10 / z, rx: 3 / z, class: 'handle', 'stroke-width': 1.5 / z }));
      }
    }
    if (gesture?.kind === 'marquee' && gesture.cur) {
      const [a, b] = [gesture.start, gesture.cur];
      overlay.append(svgEl('rect', { x: Math.min(a[0], b[0]), y: Math.min(a[1], b[1]), width: Math.abs(a[0] - b[0]), height: Math.abs(a[1] - b[1]), class: 'marquee', 'stroke-width': 1 / z, rx: 4 / z }));
    }
    if (gesture?.bind) {
      const t = byId(gesture.bind);
      if (t) { const b = bb(t); overlay.append(svgEl('rect', { x: b.x - 7 / z, y: b.y - 7 / z, width: b.w + 14 / z, height: b.h + 14 / z, rx: 10 / z, class: 'bind-hl', 'stroke-width': 2 / z })); }
    }
    positionContextBar();
  }

  /* ---------------- histórico e salvamento ---------------- */
  const snap = () => JSON.stringify(board.elements, strip);
  function getHist(id) { if (!histories.has(id)) histories.set(id, { past: [], future: [], last: null }); return histories.get(id); }
  function commit() {
    const s = snap();
    if (hist.last !== null && s !== hist.last) { hist.past.push(hist.last); if (hist.past.length > 200) hist.past.shift(); hist.future = []; }
    hist.last = s;
    updateHistButtons(); scheduleSave();
  }
  function restore(s) {
    board.elements = JSON.parse(s); selection.clear(); editing = null;
    layer.replaceChildren(); nodes.clear(); renderAll(); onSelectionChange(); scheduleSave(); updateHistButtons();
  }
  function undo() { if (editing) endEdit(); if (!hist.past.length) return; hist.future.push(hist.last); hist.last = hist.past.pop(); restore(hist.last); }
  function redo() { if (editing) endEdit(); if (!hist.future.length) return; hist.past.push(hist.last); hist.last = hist.future.pop(); restore(hist.last); }
  function updateHistButtons() { $('#undoBtn').disabled = !hist?.past.length; $('#redoBtn').disabled = !hist?.future.length; }

  let saveTimer = null;
  const setSaveState = s => { const e = $('#saveState'); e.className = 'save-state ' + s; e.lastElementChild.textContent = s === 'saving' ? 'Salvando' : s === 'error' ? 'Erro ao salvar' : 'Salvo'; };
  function scheduleSave() { clearTimeout(saveTimer); setSaveState('saving'); saveTimer = setTimeout(flushSave, 450); }
  async function flushSave() {
    clearTimeout(saveTimer); saveTimer = null;
    if (!board) return;
    try {
      await DB.set('board:' + board.id, clone({ id: board.id, elements: board.elements, assets: board.assets, cam: board.cam }));
      await DB.set('meta', clone(meta));
      setSaveState('saved');
    } catch (e) { console.error(e); setSaveState('error'); toast('Não foi possível salvar neste navegador.'); }
  }
  let metaTimer = null;
  const saveMeta = () => { clearTimeout(metaTimer); metaTimer = setTimeout(() => DB.set('meta', clone(meta)).catch(() => {}), 300); };

  /* ---------------- edição de elementos ---------------- */
  function addEl(el, select = true) {
    if (!el.id) el.id = uid();
    board.elements.push(el); renderAll();
    if (select) { selection.clear(); selection.add(el.id); onSelectionChange(); }
    return el;
  }
  function removeIds(ids, doCommit = true) {
    if (!ids.size) return;
    for (const el of board.elements) if (el.type === 'arrow' && !ids.has(el.id) && (ids.has(el.sb) || ids.has(el.eb))) {
      const [a, b] = arrowPts(el); el.x1 = a[0]; el.y1 = a[1]; el.x2 = b[0]; el.y2 = b[1];
      if (ids.has(el.sb)) el.sb = null; if (ids.has(el.eb)) el.eb = null;
    }
    board.elements = board.elements.filter(e => !ids.has(e.id));
    for (const id of ids) { selection.delete(id); nodes.get(id)?.remove(); nodes.delete(id); }
    if (editing && ids.has(editing.id)) editing = null;
    renderArrows(); renderOverlay();
    if (doCommit) { commit(); onSelectionChange(); }
  }
  function translate(el, o, dx, dy) {
    if (el.type === 'stroke') { el.pts = o.pts.map(q => [r2(q[0] + dx), r2(q[1] + dy), q[2]]); el._bb = null; }
    else if (el.type === 'arrow') { el.x1 = o.x1 + dx; el.y1 = o.y1 + dy; el.x2 = o.x2 + dx; el.y2 = o.y2 + dy; }
    else { el.x = r2(o.x + dx); el.y = r2(o.y + dy); }
    el._dirty = true;
  }
  function duplicate() {
    if (!selection.size) return;
    const list = board.elements.filter(e => selection.has(e.id));
    pasteElements({ els: clone(list) }, [24, 24]);
  }
  function pasteElements(data, offset) {
    const map = new Map(); const out = [];
    for (const el of data.els) { const nid = uid(); map.set(el.id, nid); }
    for (const el of data.els) {
      const n = clone(el); n.id = map.get(el.id);
      if (n.type === 'arrow') { n.sb = map.get(n.sb) || null; n.eb = map.get(n.eb) || null; }
      if (n.type === 'image' && data.assets?.[n.asset] && !board.assets[n.asset]) board.assets[n.asset] = data.assets[n.asset];
      out.push(n);
    }
    let dx, dy;
    if (offset) [dx, dy] = offset;
    else {
      board.elements.push(...out); const b = unionBox(out.map(bb)); board.elements.splice(-out.length);
      const at = pointerWorld && inView(pointerWorld) ? pointerWorld : viewCenter();
      dx = at[0] - (b.x + b.w / 2); dy = at[1] - (b.y + b.h / 2);
    }
    for (const n of out) translate(n, clone(n), dx, dy);
    board.elements.push(...out);
    renderAll(); selection.clear(); out.forEach(n => selection.add(n.id)); onSelectionChange(); commit();
  }
  const inView = p => { const c = board.cam, sx = p[0] * c.z + c.x, sy = p[1] * c.z + c.y; return sx > 0 && sy > 60 && sx < innerWidth && sy < innerHeight - 70; };
  function reorder(front) {
    if (!selection.size) return;
    const sel = board.elements.filter(e => selection.has(e.id)), rest = board.elements.filter(e => !selection.has(e.id));
    board.elements = front ? [...rest, ...sel] : [...sel, ...rest];
    renderAll(); commit();
  }

  function createText(p, html = '') {
    const st = styles().text;
    const el = addEl({ type: 'text', x: r2(p[0]), y: r2(p[1] - st.fontSize * 0.7), w: 10, h: 10, autoW: true, html, color: st.color, fontSize: st.fontSize });
    if (!html) startEdit(el); else commit();
    return el;
  }
  function createNote(p) {
    const st = styles().note;
    const el = addEl({ type: 'note', x: r2(p[0] - 110), y: r2(p[1] - 55), w: 220, h: 110, minH: 110, html: '', color: st.color, fontSize: st.fontSize });
    startEdit(el);
  }
  function createTable(p, cells) {
    const el = addEl({ type: 'table', x: r2(p[0]), y: r2(p[1]), w: 10, h: 10, header: true, color: styles().table.color, cells: cells || [['', '', ''], ['', '', ''], ['', '', '']] });
    if (!cells) startEdit(el, [0, 0]); else commit();
    return el;
  }
  function addChild(parent, sibling) {
    let p = parent;
    if (sibling) {
      const inc = board.elements.find(a => a.type === 'arrow' && a.eb === parent.id && byId(a.sb));
      if (inc) p = byId(inc.sb);
    }
    const pb = bb(p);
    const kids = board.elements.filter(a => a.type === 'arrow' && a.sb === p.id).map(a => byId(a.eb)).filter(Boolean);
    const type = p.type === 'text' ? 'text' : p.type;
    const size = type === 'note' ? { w: p.w || 220, h: p.minH || 110 } : type === 'text' ? { w: 10, h: 30 } : { w: p.w, h: p.h };
    let x = pb.x + pb.w + 130, y;
    if (kids.length) { const kb = unionBox(kids.map(bb)); y = kb.y + kb.h + 34; x = Math.min(...kids.map(k => bb(k).x)); }
    else y = pb.y + pb.h / 2 - (type === 'text' ? 18 : size.h / 2);
    const base = { id: uid(), type, x: r2(x), y: r2(y), html: '' };
    let child;
    if (type === 'note') child = { ...base, w: size.w, h: size.h, minH: size.h, color: p.color, fontSize: p.fontSize };
    else if (type === 'text') child = { ...base, w: 10, h: 10, autoW: true, color: p.color, fontSize: Math.max(14, Math.round(p.fontSize * 0.85)) };
    else child = { ...base, w: size.w, h: size.h, color: p.color, sw: p.sw, fill: p.fill, dashed: p.dashed, fontSize: p.fontSize };
    const ast = styles().arrow;
    board.elements.push({ id: uid(), type: 'arrow', x1: 0, y1: 0, x2: 0, y2: 0, sb: p.id, eb: child.id, color: ast.color, sw: ast.sw, dashed: false, head: true });
    addEl(child);
    startEdit(child);
  }

  function startEdit(el, cell) {
    if (editing) endEdit();
    if (!byId(el.id)) return;
    editing = { id: el.id, cell: cell || [0, 0] };
    selection.clear(); selection.add(el.id);
    const n = nodes.get(el.id); n.classList.add('editing');
    if (el.type === 'table') setupTableEdit(el, n);
    else {
      el._dirty = true; updateNode(el, n);
      const d = ['rect', 'ellipse', 'diamond'].includes(el.type) ? n.querySelector('.s-label') : n.firstChild;
      d.classList.add('editable');
      d.dataset.ph = el.type === 'note' ? 'Escreve aqui…' : el.type === 'text' ? 'Texto' : '';
      d.innerHTML = clean(el.html);
      d.contentEditable = 'true';
      d.focus({ preventScroll: true });
      const r = document.createRange(); r.selectNodeContents(d); r.collapse(false);
      const s = getSelection(); s.removeAllRanges(); s.addRange(r);
      d.oninput = () => { el.html = d.innerHTML; measureEl(el); renderArrows(); renderOverlay(); };
      d.onpaste = ev => { ev.preventDefault(); document.execCommand('insertText', false, ev.clipboardData.getData('text/plain')); };
    }
    onSelectionChange();
  }
  function endEdit() {
    if (!editing) return;
    const el = byId(editing.id), n = nodes.get(editing.id);
    editing = null;
    if (!el || !n) return;
    n.classList.remove('editing');
    if (el.type === 'table') {
      const d = n.firstChild; const td = d.querySelector('td.focus');
      if (td) el.cells[+td.dataset.r][+td.dataset.c] = cellText(td);
      d.onfocusin = d.onfocusout = d.oninput = d.onkeydown = null;
    } else {
      const d = ['rect', 'ellipse', 'diamond'].includes(el.type) ? n.querySelector('.s-label') : n.firstChild;
      el.html = clean(d.innerHTML).replace(/^(<br>)+$/, '');
      d.contentEditable = 'false'; d.oninput = d.onpaste = null; d.classList.remove('editable');
      if (el.type === 'text' && !textOf(el.html).trim()) { if (document.activeElement === d) d.blur(); removeIds(new Set([el.id]), false); commit(); onSelectionChange(); return; }
    }
    if (n.contains(document.activeElement)) document.activeElement.blur();
    getSelection()?.removeAllRanges();
    el._dirty = true; renderEl(el); measureEl(el); renderArrows();
    commit(); onSelectionChange();
  }
  const cellText = td => td.innerText.replace(/\n$/, '');
  function setupTableEdit(el, n) {
    const d = n.firstChild;
    d.innerHTML = tableHTML(el);
    for (const td of $$('td', d)) { try { td.contentEditable = 'plaintext-only'; } catch { td.contentEditable = 'true'; } }
    const pos = td => [+td.dataset.r, +td.dataset.c];
    d.onfocusin = ev => {
      const td = ev.target.closest('td'); if (!td) return;
      const [r, c] = pos(td); editing.cell = [r, c];
      td.classList.add('focus'); td.classList.remove('num', 'err');
      td.textContent = el.cells[r][c];
      const rg = document.createRange(); rg.selectNodeContents(td); const s = getSelection(); s.removeAllRanges(); s.addRange(rg);
      const ref = $('#cellRef'); if (ref) ref.textContent = colName(c) + (r + 1);
      measureEl(el); renderOverlay();
    };
    d.onfocusout = ev => {
      const td = ev.target.closest('td'); if (!td || !td.classList.contains('focus')) return;
      const [r, c] = pos(td); el.cells[r][c] = cellText(td); td.classList.remove('focus');
      refreshTableDisplay(el, d); measureEl(el); renderArrows(); renderOverlay();
    };
    d.oninput = ev => {
      const td = ev.target.closest('td'); if (!td) return;
      const [r, c] = pos(td); el.cells[r][c] = cellText(td);
      refreshTableDisplay(el, d, td); measureEl(el); renderArrows(); renderOverlay();
    };
    d.onkeydown = ev => {
      const td = ev.target.closest('td'); if (!td) return;
      const [r, c] = pos(td); const rows = el.cells.length, cols = el.cells[0].length;
      if (ev.key === 'Tab') {
        ev.preventDefault();
        let nr = r, nc = c + (ev.shiftKey ? -1 : 1);
        if (nc >= cols) { nc = 0; nr++; } if (nc < 0) { nc = cols - 1; nr--; }
        if (nr < 0) return;
        if (nr >= rows) { tableOp('row+', [r, c]); }
        focusCell(el, nr, nc);
      } else if (ev.key === 'Enter' && !ev.shiftKey) {
        ev.preventDefault();
        if (r + 1 >= rows) tableOp('row+', [r, c]);
        focusCell(el, r + 1, c);
      } else if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); endEdit(); }
      else if ((ev.key === 'ArrowUp' || ev.key === 'ArrowDown') && !ev.shiftKey) {
        const nr = r + (ev.key === 'ArrowUp' ? -1 : 1);
        if (nr >= 0 && nr < rows) { ev.preventDefault(); focusCell(el, nr, c); }
      }
    };
    focusCell(el, ...editing.cell);
  }
  function focusCell(el, r, c) {
    const n = nodes.get(el.id); if (!n) return;
    const td = n.querySelector(`td[data-r="${r}"][data-c="${c}"]`) || n.querySelector('td');
    td?.focus({ preventScroll: true });
  }
  function refreshTableDisplay(el, d, skip) {
    const vals = evalTable(el);
    for (const td of $$('td', d)) {
      if (td === skip || td.classList.contains('focus')) continue;
      const v = vals[+td.dataset.r][+td.dataset.c];
      if (td.textContent !== v.text) td.textContent = v.text;
      td.classList.toggle('num', !!v.num && !(el.header && td.dataset.r === '0'));
      td.classList.toggle('err', !!v.err);
    }
  }
  function tableOp(op, at) {
    const el = byId([...selection][0]); if (!el || el.type !== 'table') return;
    const n = nodes.get(el.id); const ed = editing?.id === el.id;
    if (ed) { const td = n.querySelector('td.focus'); if (td) { el.cells[+td.dataset.r][+td.dataset.c] = cellText(td); td.classList.remove('focus'); } }
    const rows = el.cells.length, cols = el.cells[0].length;
    const [r, c] = at || (ed ? editing.cell : [rows - 1, cols - 1]);
    let fr = r, fc = c;
    if (op === 'row+') { el.cells.splice(r + 1, 0, Array(cols).fill('')); fr = r + 1; }
    else if (op === 'col+') { el.cells.forEach(row => row.splice(c + 1, 0, '')); fc = c + 1; }
    else if (op === 'row-' && rows > 1) { el.cells.splice(r, 1); fr = Math.min(r, rows - 2); }
    else if (op === 'col-' && cols > 1) { el.cells.forEach(row => row.splice(c, 1)); fc = Math.min(c, cols - 2); }
    else if (op === 'header') el.header = !el.header;
    if (ed) { editing.cell = [fr, fc]; if (!at) setupTableEdit(el, n); else { const d = n.firstChild; d.innerHTML = tableHTML(el); for (const td of $$('td', d)) { try { td.contentEditable = 'plaintext-only'; } catch { td.contentEditable = 'true'; } } } }
    else { el._dirty = true; renderEl(el); }
    measureEl(el); renderArrows(); renderOverlay();
    if (!ed) commit(); else updateContextBar();
  }

  /* ---------------- imagens e arquivos ---------------- */
  const readURL = f => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(f); });
  const loadImg = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
  async function addImageFile(file, at) {
    try {
      let src = await readURL(file); const img = await loadImg(src);
      let w = img.naturalWidth || 400, h = img.naturalHeight || 300;
      const MAX = 2400;
      if (Math.max(w, h) > MAX || file.size > 1.8e6) {
        const k = Math.min(1, MAX / Math.max(w, h)); const cv = document.createElement('canvas');
        cv.width = Math.round(w * k); cv.height = Math.round(h * k); cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
        src = cv.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.9);
      }
      const aid = uid(); board.assets[aid] = src;
      const z = board.cam.z, maxW = Math.min(560, innerWidth * 0.5) / z;
      if (w > maxW) { h *= maxW / w; w = maxW; }
      const c = at || viewCenter();
      addEl({ type: 'image', asset: aid, x: r2(c[0] - w / 2), y: r2(c[1] - h / 2), w: r2(w), h: r2(h) });
      commit();
    } catch { toast('Não consegui abrir essa imagem.'); }
  }
  async function importSheet(file, at) {
    const text = await file.text();
    const cells = parseDelimited(text);
    if (!cells.length) return toast('Arquivo vazio.');
    createTable(at || viewCenter(), cells);
    toast(`Planilha importada: ${cells.length} linhas × ${cells[0].length} colunas.`);
  }

  /* ---------------- ponteiro: caneta, mouse e toque ---------------- */
  const btnState = new Map();
  function onPtr(e) {
    if (e.target.closest?.('.editing')) return;
    if (e.pointerType === 'touch') return onTouch(e);
    if (e.pointerType === 'pen') lastPenTime = performance.now();
    pointerWorld = toWorld(e);
    const prev = btnState.get(e.pointerId) || 0;
    const end = e.type === 'pointerup' || e.type === 'pointercancel';
    const b = end ? 0 : e.buttons;
    if (end) btnState.delete(e.pointerId); else btnState.set(e.pointerId, b);
    if (e.type === 'pointerdown') {
      e.preventDefault();
      try { svg.setPointerCapture(e.pointerId); } catch {}
      if (editing) endEdit();
      closePopovers();
    }
    const tipEraser = e.pointerType === 'pen' && ((b & 32) || e.button === 5);
    const contact = !!(b & 33), was = !!(prev & 33);
    for (const [bit, name] of [[2, 'barrel'], [4, 'middle']]) {
      const now = !!(b & bit), before = !!(prev & bit);
      if (now && !before) auxPress(name, e);
      else if (!now && before) auxRelease(name, e);
    }
    if (contact && !was && !gesture) startGesture(e, tipEraser ? 'eraser' : null);
    else if (gesture && (contact || gesture.aux)) moveGesture(e);
    if (!contact && was && gesture && !gesture.aux) endGesture(e);
    hover(e);
    if (end && e.pointerType === 'pen') hideRing();
  }
  function auxPress(name, e) {
    const act = S()[name === 'barrel' ? 'barrel' : 'middle'];
    penTestReport(name);
    if (act === 'erase-hold' || act === 'pan-hold') {
      const t = act === 'erase-hold' ? 'eraser' : 'hand';
      heldOverride = { name, t };
      if (!gesture && (e.pointerType !== 'pen' || e.pressure > 0)) startGesture(e, t, name);
      updateCursor(); hover(e);
    } else if (act === 'toggle-select') setTool(tool === 'select' ? lastDraw : 'select');
    else if (act === 'toggle-eraser') setTool(tool === 'eraser' ? lastDraw : 'eraser');
    else if (act === 'undo') undo();
  }
  function auxRelease(name, e) {
    if (heldOverride?.name === name) { heldOverride = null; updateCursor(); }
    if (gesture?.aux === name) endGesture(e);
  }
  const touches = new Map(); let pinch = null;
  function onTouch(e) {
    if (e.type === 'pointerdown' && performance.now() - lastPenTime < 700) return;
    const pt = [e.clientX, e.clientY];
    if (e.type === 'pointerdown') {
      e.preventDefault();
      try { svg.setPointerCapture(e.pointerId); } catch {}
      touches.set(e.pointerId, pt);
      if (editing) endEdit();
      closePopovers();
      if (touches.size === 2) {
        if (gesture) {
          if (gesture.kind === 'stroke') removeIds(new Set([gesture.id]), false);
          gesture = null; svg.classList.remove('panning');
        }
        const [a, b] = [...touches.values()];
        pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]) || 1, m: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], cam: { ...board.cam } };
      } else if (touches.size === 1) startGesture(e, S().penOnly ? 'hand' : null);
    } else if (e.type === 'pointermove') {
      if (!touches.has(e.pointerId)) return;
      touches.set(e.pointerId, pt);
      if (pinch && touches.size >= 2) {
        const [a, b] = [...touches.values()];
        const d = Math.hypot(a[0] - b[0], a[1] - b[1]), m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        const c0 = pinch.cam, z = clamp(c0.z * d / pinch.d, 0.08, 8);
        const wx = (pinch.m[0] - c0.x) / c0.z, wy = (pinch.m[1] - c0.y) / c0.z;
        Object.assign(board.cam, { z, x: m[0] - wx * z, y: m[1] - wy * z }); applyCam();
      } else if (gesture) moveGesture(e);
    } else {
      if (!touches.has(e.pointerId)) return;
      touches.delete(e.pointerId);
      if (pinch && touches.size < 2) { pinch = null; scheduleSave(); }
      if (!touches.size && gesture) endGesture(e);
    }
  }

  function effectiveTool() { return heldOverride?.t || (spaceDown ? 'hand' : tool); }
  function startGesture(e, forced, aux) {
    const p = toWorld(e);
    const t = forced || effectiveTool();
    gesture = { tool: t, aux, start: p, last: p, sx: e.clientX, sy: e.clientY, kind: 'noop' };
    switch (t) {
      case 'hand': gesture.kind = 'pan'; gesture.cam = { ...board.cam }; svg.classList.add('panning'); break;
      case 'pen': case 'hl': beginStroke(e, p, t); break;
      case 'eraser': gesture.kind = 'erase'; gesture.erased = 0; eraseAt(p, p); break;
      case 'select': beginSelect(e, p); break;
      case 'rect': case 'ellipse': case 'diamond': {
        const st = styles().shape;
        const el = { id: uid(), type: t, x: p[0], y: p[1], w: 0, h: 0, color: st.color, sw: st.sw, fill: st.fill, dashed: st.dashed, fontSize: st.fontSize, html: '' };
        board.elements.push(el); renderAll(); gesture.kind = 'shape'; gesture.id = el.id; break;
      }
      case 'arrow': case 'line': {
        const st = styles().arrow, s = bindableAt(p);
        const el = { id: uid(), type: 'arrow', x1: p[0], y1: p[1], x2: p[0], y2: p[1], sb: s?.id || null, eb: null, color: st.color, sw: st.sw, dashed: st.dashed, head: t === 'arrow' };
        board.elements.push(el); renderAll(); gesture.kind = 'newarrow'; gesture.id = el.id; break;
      }
      case 'text': {
        const hit = hitTest(p, 4 / board.cam.z, el => el.type === 'text' || el.type === 'note' || ['rect', 'ellipse', 'diamond'].includes(el.type));
        gesture = null;
        if (hit) startEdit(hit); else createText(p);
        setTool('select', true);
        return;
      }
      case 'note': gesture = null; createNote(p); setTool('select', true); return;
      case 'table': gesture = null; createTable(p); setTool('select', true); return;
    }
    renderOverlay();
  }
  function moveGesture(e) {
    const g = gesture; if (!g) return;
    const p = toWorld(e);
    switch (g.kind) {
      case 'pan': board.cam.x = g.cam.x + (e.clientX - g.sx); board.cam.y = g.cam.y + (e.clientY - g.sy); applyCam(); break;
      case 'stroke': addStrokePoints(e); break;
      case 'erase': eraseAt(g.last, p); break;
      case 'move': doMove(p); break;
      case 'resize': doResize(p, e); break;
      case 'endpoint': {
        const el = byId(g.id); const t = bindableAt(p, el.id);
        if (g.which === 'p1') { el.x1 = p[0]; el.y1 = p[1]; el.sb = t?.id || null; } else { el.x2 = p[0]; el.y2 = p[1]; el.eb = t?.id || null; }
        if (t && (g.which === 'p1' ? el.eb : el.sb) === t.id) { if (g.which === 'p1') el.sb = null; else el.eb = null; }
        g.bind = (g.which === 'p1' ? el.sb : el.eb) || null;
        renderEl(el); renderOverlay(); break;
      }
      case 'marquee': g.cur = p; renderOverlay(); break;
      case 'shape': {
        const el = byId(g.id); let w = p[0] - g.start[0], h = p[1] - g.start[1];
        if (e.shiftKey) { const m = Math.max(Math.abs(w), Math.abs(h)); w = Math.sign(w || 1) * m; h = Math.sign(h || 1) * m; }
        el.x = r2(Math.min(g.start[0], g.start[0] + w)); el.y = r2(Math.min(g.start[1], g.start[1] + h)); el.w = r2(Math.abs(w)); el.h = r2(Math.abs(h));
        el._dirty = true; renderEl(el); renderArrows(); break;
      }
      case 'newarrow': {
        const el = byId(g.id); let q = p;
        if (e.shiftKey) { const a = Math.atan2(p[1] - g.start[1], p[0] - g.start[0]), st = Math.PI / 12, d = Math.hypot(p[0] - g.start[0], p[1] - g.start[1]); const k = Math.round(a / st) * st; q = [g.start[0] + Math.cos(k) * d, g.start[1] + Math.sin(k) * d]; }
        el.x2 = q[0]; el.y2 = q[1];
        const t = bindableAt(p, el.sb); el.eb = t?.id || null; g.bind = el.eb;
        renderEl(el); renderOverlay(); break;
      }
    }
    g.last = p;
  }
  function endGesture(e) {
    const g = gesture; if (!g) return;
    gesture = null;
    switch (g.kind) {
      case 'pan': svg.classList.remove('panning'); scheduleSave(); break;
      case 'stroke': {
        const el = g.el; const q = toWorld(e); const last = el.pts[el.pts.length - 1];
        if (e.type === 'pointerup' && Math.hypot(q[0] - last[0], q[1] - last[1]) * board.cam.z > 1) { el.pts.push([r2(q[0]), r2(q[1]), last[2]]); el._bb = null; el._dirty = true; renderEl(el); }
        commit(); break;
      }
      case 'erase': if (g.erased) commit(); break;
      case 'move': if (g.moved) commit(); break;
      case 'resize': case 'endpoint': commit(); break;
      case 'marquee': {
        if (g.cur) {
          const a = g.start, b = g.cur, box = { x: Math.min(a[0], b[0]), y: Math.min(a[1], b[1]), w: Math.abs(a[0] - b[0]), h: Math.abs(a[1] - b[1]) };
          for (const el of board.elements) { const eb = bb(el); if (eb.x >= box.x && eb.y >= box.y && eb.x + eb.w <= box.x + box.w && eb.y + eb.h <= box.y + box.h) selection.add(el.id); }
        }
        break;
      }
      case 'shape': {
        const el = byId(g.id);
        if (el.w * board.cam.z < 6 && el.h * board.cam.z < 6) { el.w = el.type === 'ellipse' ? 150 : 170; el.h = 100; el.x = r2(g.start[0] - el.w / 2); el.y = r2(g.start[1] - el.h / 2); el._dirty = true; renderEl(el); }
        selection.clear(); selection.add(el.id); commit(); setTool('select', true); break;
      }
      case 'newarrow': {
        const el = byId(g.id); const [a, b] = arrowPts(el);
        if (Math.hypot(a[0] - b[0], a[1] - b[1]) * board.cam.z < 8 || (el.sb && el.sb === el.eb)) removeIds(new Set([el.id]), false);
        else { selection.clear(); selection.add(el.id); commit(); }
        setTool('select', true); break;
      }
    }
    renderOverlay(); onSelectionChange();
  }

  function beginStroke(e, p, t) {
    const st = t === 'hl' ? styles().hl : styles().pen;
    const el = { id: uid(), type: 'stroke', hl: t === 'hl', color: st.color, size: st.size, opacity: st.opacity ?? 1, pr: e.pointerType === 'pen' && S().pressure && t !== 'hl', pts: [[r2(p[0]), r2(p[1]), pres(e)]] };
    board.elements.push(el);
    layer.append(renderEl(el));
    gesture.kind = 'stroke'; gesture.id = el.id; gesture.el = el;
  }
  const pres = e => (e.pointerType === 'pen' && S().pressure ? (e.pressure > 0 ? e.pressure : 0.5) : 0.5);
  function addStrokePoints(e) {
    const el = gesture.el, z = board.cam.z;
    let evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
    if (!evs.length) evs = [e];
    const k = 1 - clamp(S().smoothing, 0, 0.9) * 0.85;
    for (const ev of evs) {
      const q = toWorld(ev), last = el.pts[el.pts.length - 1];
      const nx = last[0] + (q[0] - last[0]) * k, ny = last[1] + (q[1] - last[1]) * k;
      if (Math.hypot(nx - last[0], ny - last[1]) * z < 0.7) continue;
      el.pts.push([r2(nx), r2(ny), r2(last[2] * 0.35 + pres(ev) * 0.65)]);
    }
    el._bb = null; el._dirty = true; renderEl(el);
  }
  function eraseAt(a, b) {
    const r = styles().eraser.size / 2 / board.cam.z;
    const steps = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / Math.max(r, 0.5)));
    const rm = new Set();
    for (let i = 0; i <= steps; i++) {
      const p = [a[0] + (b[0] - a[0]) * i / steps, a[1] + (b[1] - a[1]) * i / steps];
      for (const el of board.elements) if (!rm.has(el.id) && (el.type === 'stroke' || el.type === 'arrow') && hitEl(el, p, r)) rm.add(el.id);
    }
    if (rm.size) { removeIds(rm, false); gesture.erased += rm.size; }
  }
  function beginSelect(e, p) {
    const z = board.cam.z, now = performance.now();
    if (selection.size === 1) {
      const el = byId([...selection][0]);
      if (el) for (const h of handlesFor(el)) if (Math.hypot(p[0] - h.x, p[1] - h.y) < 11 / z) {
        if (el.type === 'arrow') Object.assign(gesture, { kind: 'endpoint', id: el.id, which: h.h });
        else Object.assign(gesture, { kind: 'resize', id: el.id, h: h.h, orig: clone(el), ob: { ...bb(el) } });
        return;
      }
    }
    const hit = hitTest(p, 6 / z);
    if (hit) {
      if (lastClick && lastClick.id === hit.id && now - lastClick.t < 420 && editable(hit)) {
        lastClick = null; gesture.kind = 'noop';
        let cell;
        if (hit.type === 'table') { const td = document.elementsFromPoint(e.clientX, e.clientY).find(x => x.tagName === 'TD' && nodes.get(hit.id)?.contains(x)); if (td) cell = [+td.dataset.r, +td.dataset.c]; }
        startEdit(hit, cell); return;
      }
      lastClick = { id: hit.id, t: now };
      if (e.shiftKey) { if (selection.has(hit.id)) selection.delete(hit.id); else selection.add(hit.id); }
      else if (!selection.has(hit.id)) { selection.clear(); selection.add(hit.id); }
      gesture.kind = 'move'; gesture.moved = false;
      gesture.orig = new Map([...selection].map(id => [id, clone(byId(id))]));
    } else {
      if (lastClick && lastClick.id === null && now - lastClick.t < 420 && Math.hypot(p[0] - lastClick.p[0], p[1] - lastClick.p[1]) * z < 8) {
        lastClick = null; gesture = null; createText(p); return;
      }
      lastClick = { id: null, t: now, p };
      if (!e.shiftKey) selection.clear();
      gesture.kind = 'marquee'; gesture.cur = null;
    }
    onSelectionChange();
  }
  function doMove(p) {
    const g = gesture, z = board.cam.z;
    const dx = p[0] - g.start[0], dy = p[1] - g.start[1];
    if (!g.moved && Math.hypot(dx, dy) * z < 3) return;
    if (!g.moved) {
      g.moved = true;
      for (const id of selection) {
        const el = byId(id);
        if (el?.type === 'arrow') {
          const [a, b] = arrowPts(el); const o = g.orig.get(id);
          Object.assign(o, { x1: a[0], y1: a[1], x2: b[0], y2: b[1] });
          if (el.sb && !selection.has(el.sb)) el.sb = null;
          if (el.eb && !selection.has(el.eb)) el.eb = null;
        }
      }
      $('#ctxbar').hidden = true;
    }
    for (const [id, o] of g.orig) { const el = byId(id); if (el) { translate(el, o, dx, dy); renderEl(el); } }
    renderArrows(); renderOverlay();
  }
  function doResize(p, e) {
    const g = gesture, el = byId(g.id), o = g.orig, ob = g.ob, h = g.h;
    const ax = h.includes('w') ? ob.x + ob.w : ob.x, ay = h.includes('n') ? ob.y + ob.h : ob.y;
    let w = p[0] - ax, hh = p[1] - ay;
    const keep = el.type === 'text' || ((el.type === 'image' || el.type === 'stroke') !== !!e.shiftKey);
    if (keep && ob.w > 0 && ob.h > 0) {
      const ratio = ob.w / ob.h;
      if (Math.abs(w) / ratio > Math.abs(hh)) hh = Math.sign(hh || 1) * Math.abs(w) / ratio; else w = Math.sign(w || 1) * Math.abs(hh) * ratio;
    }
    const min = 8 / board.cam.z;
    if (Math.abs(w) < min) w = Math.sign(w || 1) * min; if (Math.abs(hh) < min) hh = Math.sign(hh || 1) * min;
    const box = { x: Math.min(ax, ax + w), y: Math.min(ay, ay + hh), w: Math.abs(w), h: Math.abs(hh) };
    if (el.type === 'stroke') {
      const sx = box.w / ob.w, sy = box.h / ob.h;
      el.pts = o.pts.map(q => [r2(box.x + (q[0] - ob.x) * sx), r2(box.y + (q[1] - ob.y) * sy), q[2]]); el._bb = null;
    } else if (el.type === 'text') {
      const k = box.w / ob.w; el.fontSize = r2(clamp(o.fontSize * k, 6, 600)); el.x = r2(box.x); el.y = r2(box.y);
      if (!o.autoW) el.w = r2(o.w * k);
    } else if (el.type === 'note') { Object.assign(el, { x: r2(box.x), y: r2(box.y), w: r2(Math.max(box.w, 80)), minH: r2(Math.max(box.h, 40)) }); }
    else Object.assign(el, { x: r2(box.x), y: r2(box.y), w: r2(box.w), h: r2(box.h) });
    el._dirty = true; renderEl(el); measureEl(el); renderArrows(); renderOverlay();
  }

  const ring = $('#ring');
  function hover(e) {
    const t = effectiveTool();
    if (!['pen', 'hl', 'eraser'].includes(t) || e.pointerType === 'touch') return hideRing();
    const z = board.cam.z;
    const size = t === 'eraser' ? styles().eraser.size : t === 'hl' ? styles().hl.size * z : Math.max(styles().pen.size * z * 0.8, 3);
    ring.hidden = false; ring.classList.toggle('erase', t === 'eraser');
    ring.style.width = ring.style.height = Math.max(size, 4) + 'px';
    ring.style.left = e.clientX + 'px'; ring.style.top = e.clientY + 'px';
  }
  const hideRing = () => { ring.hidden = true; };

  /* ---------------- interface ---------------- */
  const TOOLS = [
    ['select', 'Selecionar', 'V'], ['hand', 'Mover quadro', 'H'], '|',
    ['pen', 'Caneta', 'P'], ['hl', 'Marca-texto', 'M'], ['eraser', 'Borracha', 'E'], '|',
    ['rect', 'Retângulo', 'R'], ['ellipse', 'Elipse', 'O'], ['diamond', 'Losango', 'D'], ['arrow', 'Seta', 'A'], ['line', 'Linha', 'L'], '|',
    ['text', 'Texto', 'T'], ['note', 'Nota / mapa mental', 'N'], ['table', 'Tabela', 'G'], ['image', 'Imagem', 'I'],
  ];
  function buildToolbar() {
    const tb = $('#toolbar');
    tb.innerHTML = '<span class="tool-drop" aria-hidden="true"></span>' + TOOLS.map(t => t === '|' ? '<span class="tsep"></span>' :
      `<button class="tbtn" type="button" data-tool="${t[0]}" title="${t[1]} (${t[2]})" aria-label="${t[1]}">${icon(t[0])}<span class="kbd">${t[2]}</span></button>`).join('');
    tb.addEventListener('click', e => { const b = e.target.closest('[data-tool]'); if (b) setTool(b.dataset.tool); });
  }
  function moveDrop() {
    const b = $(`#toolbar [data-tool="${tool}"]`), d = $('#toolbar .tool-drop');
    if (!b || !d) return;
    d.style.transform = `translateX(${b.offsetLeft}px)`;
  }
  function setTool(t, silent) {
    if (t === 'image') { $('#fileImage').click(); return; }
    if (editing && !silent) endEdit();
    tool = t;
    if (t === 'pen' || t === 'hl') lastDraw = t;
    if (t !== 'select' && !silent) selection.clear();
    $$('#toolbar .tbtn').forEach(b => b.classList.toggle('on', b.dataset.tool === t));
    moveDrop(); updateCursor(); onSelectionChange();
  }
  function updateCursor() { svg.dataset.cursor = effectiveTool(); if (!['pen', 'hl', 'eraser'].includes(effectiveTool())) hideRing(); }

  function onSelectionChange() { renderStylebar(); updateContextBar(); renderOverlay(); }

  const kindOf = el => !el ? null : el.type === 'stroke' ? (el.hl ? 'hl' : 'pen') : el.type === 'arrow' ? 'arrow' : ['rect', 'ellipse', 'diamond'].includes(el.type) ? 'shape' : ['text', 'note', 'table'].includes(el.type) ? el.type : null;
  const toolKind = t => ({ pen: 'pen', hl: 'hl', eraser: 'eraser', rect: 'shape', ellipse: 'shape', diamond: 'shape', arrow: 'arrow', line: 'arrow', text: 'text', note: 'note', table: 'table' }[t] || null);
  const FONT_SIZES = { text: [[16, 'P'], [22, 'M'], [32, 'G'], [48, 'GG']], note: [[14, 'P'], [17, 'M'], [22, 'G'], [30, 'GG']], shape: [[14, 'P'], [18, 'M'], [24, 'G'], [34, 'GG']] };
  function styleContext() {
    if (selection.size) {
      const els = [...selection].map(byId).filter(Boolean);
      const k = kindOf(els[0]);
      if (!k || els.some(e => kindOf(e) !== k)) return null;
      return { kind: k, src: els[0], els };
    }
    const k = toolKind(effectiveTool());
    return k ? { kind: k, src: styles()[k], els: [] } : null;
  }
  function renderStylebar() {
    const bar = $('#stylebar'), ctx = styleContext();
    if (!ctx || (gesture && gesture.kind !== 'noop')) { bar.hidden = !!(!ctx); if (!ctx) return; if (gesture) return; }
    const { kind, src } = ctx; let h = '';
    const v = (k, d) => src[k] ?? styles()[kind]?.[k] ?? d;
    const range = (prop, label, min, max, step, val, fmt = x => x) => `<div><div class="sb-label">${label}<span>${fmt(val)}</span></div><input type="range" data-prop="${prop}" min="${min}" max="${max}" step="${step}" value="${val}" style="--fill:${((val - min) / (max - min)) * 100}%"></div>`;
    const seg = (prop, label, opts, cur) => `<div><div class="sb-label">${label}</div><div class="seg">${opts.map(([val, lab]) => `<button type="button" data-prop="${prop}" data-val="${esc(JSON.stringify(val))}" class="${JSON.stringify(val) === JSON.stringify(cur) ? 'on' : ''}" title="${esc(typeof lab === 'string' && !lab.startsWith('<') ? lab : '')}">${lab}</button>`).join('')}</div></div>`;
    if (kind !== 'eraser') {
      const pal = kind === 'note' ? NOTE_COLORS : PALETTE, cur = v('color', 'ink');
      h += `<div><div class="sb-label">Cor</div><div class="swatches">${pal.slice(0, 9).map(c => `<button type="button" class="sw${c === cur ? ' on' : ''}" data-prop="color" data-val="${esc(JSON.stringify(c))}" style="--c:${col(c)}" title="${c === 'ink' ? 'Tinta (acompanha o tema)' : c}"></button>`).join('')}<label class="sw custom${pal.includes(cur) ? '' : ' on'}" title="Outra cor"><input type="color" data-prop="color" value="${/^#/.test(cur) ? cur : '#2f6bff'}"></label></div></div>`;
    }
    if (kind === 'pen') { h += range('size', 'Espessura', 1, 40, 1, v('size', 4)); h += range('opacity', 'Opacidade', 0.1, 1, 0.05, v('opacity', 1), x => Math.round(x * 100) + '%'); }
    if (kind === 'hl') h += range('size', 'Espessura', 6, 70, 1, v('size', 22));
    if (kind === 'eraser') h += range('size', 'Tamanho da borracha', 6, 90, 1, v('size', 22));
    if (kind === 'shape' || kind === 'arrow') h += range('sw', 'Contorno', 1, 12, 0.5, v('sw', 2));
    if (kind === 'shape') h += seg('fill', 'Preenchimento', [['none', 'Vazio'], ['soft', 'Suave'], ['solid', 'Sólido']], v('fill', 'none'));
    if (kind === 'shape' || kind === 'arrow') h += seg('dashed', 'Traço', [[false, '<svg viewBox="0 0 24 24"><path d="M4 12h16"/></svg>'], [true, '<svg viewBox="0 0 24 24"><path d="M4 12h3M10.5 12h3M17 12h3"/></svg>']], !!v('dashed', false));
    if (kind === 'arrow') h += seg('head', 'Ponta', [[true, '<svg viewBox="0 0 24 24"><path d="M4 12h15M14 7l5 5-5 5"/></svg>'], [false, '<svg viewBox="0 0 24 24"><path d="M4 12h16"/></svg>']], v('head', true) !== false);
    if (FONT_SIZES[kind]) {
      const opts = FONT_SIZES[kind], cur = v('fontSize', opts[1][0]);
      const has = opts.some(o => o[0] === cur);
      h += seg('fontSize', 'Tamanho do texto', opts, has ? cur : null);
    }
    if (kind === 'pen' && ctx.els.length === 0) h += `<div class="sb-label" style="margin:0;text-transform:none;letter-spacing:0;font-weight:500">${S().pressure ? 'Pressão da caneta ligada' : 'Pressão desligada'}</div>`;
    bar.innerHTML = h; bar.hidden = false;
  }
  function setProp(prop, val, live) {
    const ctx = styleContext(); if (!ctx) return;
    const { kind, els } = ctx;
    if (styles()[kind]) styles()[kind][prop] = val;
    for (const el of els) {
      if (prop === 'fontSize' && el.type === 'table') continue;
      el[prop] = val; el._dirty = true; el._bb = null; renderEl(el); measureEl(el);
    }
    renderArrows(); renderOverlay(); saveMeta();
    if (els.length && !live) commit();
    if (!live) renderStylebar();
  }
  function bindStylebar() {
    const bar = $('#stylebar');
    bar.addEventListener('pointerdown', e => { if (editing && !e.target.closest('input')) e.preventDefault(); });
    bar.addEventListener('click', e => { const b = e.target.closest('[data-val]'); if (b) setProp(b.dataset.prop, JSON.parse(b.dataset.val)); });
    bar.addEventListener('input', e => {
      const i = e.target; if (!i.dataset.prop) return;
      const val = i.type === 'range' ? +i.value : i.value;
      if (i.type === 'range') { i.style.setProperty('--fill', ((val - i.min) / (i.max - i.min)) * 100 + '%'); const s = i.previousElementSibling?.querySelector('span'); if (s) s.textContent = i.dataset.prop === 'opacity' ? Math.round(val * 100) + '%' : val; }
      setProp(i.dataset.prop, val, true);
    });
    bar.addEventListener('change', e => { const i = e.target; if (!i.dataset.prop) return; setProp(i.dataset.prop, i.type === 'range' ? +i.value : i.value); });
  }

  function updateContextBar() {
    const bar = $('#ctxbar');
    const one = selection.size === 1 ? byId([...selection][0]) : null;
    if (!selection.size || (editing && one?.type !== 'table') || (gesture && gesture.kind !== 'noop' && gesture.kind !== 'marquee')) { bar.hidden = true; return; }
    let h = '';
    if (one?.type === 'table') {
      h += `<span class="cell-ref" id="cellRef" title="Célula atual">${editing ? colName(editing.cell[1]) + (editing.cell[0] + 1) : '—'}</span>`;
      h += `<button data-act="row+" title="Adicionar linha">${icon('rowAdd')}</button><button data-act="col+" title="Adicionar coluna">${icon('colAdd')}</button><button data-act="row-" title="Remover linha">${icon('rowDel')}</button><button data-act="col-" title="Remover coluna">${icon('colDel')}</button><button data-act="header" class="${one.header ? 'on' : ''}" title="Primeira linha como cabeçalho">${icon('header')}</button><span class="csep"></span>`;
    }
    if (isNode(one) && !editing) h += `<button data-act="child" title="Criar ramificação (Tab)">${icon('branch')}<span>Ramificar</span></button>`;
    if (editable(one) && !editing) h += `<button data-act="edit" title="Editar (Enter ou duplo clique)">${icon('edit')}</button>`;
    if (!editing) h += `<button data-act="dup" title="Duplicar (Ctrl+D)">${icon('dup')}</button><button data-act="front" title="Trazer para frente (Ctrl+])">${icon('front')}</button><button data-act="back" title="Enviar para trás (Ctrl+[)">${icon('back')}</button><button data-act="del" class="danger" title="Excluir (Delete)">${icon('trash')}</button>`;
    bar.innerHTML = h; bar.hidden = !h; positionContextBar();
  }
  function positionContextBar() {
    const bar = $('#ctxbar'); if (bar.hidden || !selection.size) return;
    const els = [...selection].map(byId).filter(Boolean); if (!els.length) return;
    const b = unionBox(els.map(bb)), c = board.cam;
    const sx = (b.x + b.w / 2) * c.z + c.x, top = b.y * c.z + c.y, bottom = (b.y + b.h) * c.z + c.y;
    const w = bar.offsetWidth, h = bar.offsetHeight;
    let y = top - h - 16; if (y < 70) y = bottom + 16; if (y > innerHeight - h - 80) y = Math.max(70, top + 12);
    const x = clamp(sx - w / 2, 8, innerWidth - w - 8);
    bar.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
  }
  function bindContextBar() {
    const bar = $('#ctxbar');
    bar.addEventListener('pointerdown', e => e.preventDefault());
    bar.addEventListener('click', e => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      const a = b.dataset.act, one = byId([...selection][0]);
      if (a === 'child' && one) addChild(one, false);
      else if (a === 'edit' && one) startEdit(one);
      else if (a === 'dup') duplicate();
      else if (a === 'front') reorder(true);
      else if (a === 'back') reorder(false);
      else if (a === 'del') removeIds(new Set(selection));
      else if (/^(row|col)[+-]$|^header$/.test(a)) tableOp(a);
    });
  }

  /* ---------------- abas (quadros) ---------------- */
  const newBoard = id => ({ id, elements: [], assets: {}, cam: { x: Math.round(innerWidth / 2), y: Math.round(innerHeight / 2), z: 1 } });
  function renderTabs() {
    const wrap = $('#tabs');
    wrap.innerHTML = meta.boards.map(b => `<div class="tab${b.id === meta.active ? ' on' : ''}" role="tab" aria-selected="${b.id === meta.active}" data-id="${b.id}" draggable="true" title="Clique duplo para renomear"><span class="tab-name">${esc(b.name)}</span><button class="tab-x" type="button" data-close="${b.id}" aria-label="Excluir quadro ${esc(b.name)}">×</button></div>`).join('');
    wrap.querySelector('.tab.on')?.scrollIntoView({ inline: 'nearest', block: 'nearest' });
    document.title = (meta.boards.find(b => b.id === meta.active)?.name || 'Quadro') + ' · Quadro';
  }
  async function switchBoard(id) {
    if (editing) endEdit();
    if (board && saveTimer) await flushSave();
    let b = await DB.get('board:' + id);
    if (!b) b = newBoard(id);
    b.assets ||= {}; b.elements ||= []; b.cam ||= newBoard(id).cam;
    const used = new Set(b.elements.filter(e => e.type === 'image').map(e => e.asset));
    for (const k of Object.keys(b.assets)) if (!used.has(k)) delete b.assets[k];
    board = b; meta.active = id;
    hist = getHist(id); if (hist.last === null) hist.last = snap();
    selection.clear(); nodes.clear(); layer.replaceChildren();
    renderAll(); applyCam(); renderTabs(); onSelectionChange(); updateHistButtons(); saveMeta();
  }
  async function addBoard() {
    const id = uid();
    let n = meta.boards.length + 1; const names = new Set(meta.boards.map(b => b.name));
    while (names.has('Quadro ' + n)) n++;
    meta.boards.push({ id, name: 'Quadro ' + n });
    await DB.set('board:' + id, newBoard(id));
    await switchBoard(id);
    setTimeout(() => renameTab(id), 50);
  }
  async function deleteBoard(id) {
    const info = meta.boards.find(b => b.id === id); if (!info) return;
    const data = id === board.id ? board : await DB.get('board:' + id);
    if (data?.elements?.length && !confirm(`Excluir “${info.name}”? Tudo o que está nesse quadro será apagado.`)) return;
    const idx = meta.boards.indexOf(info);
    meta.boards.splice(idx, 1); histories.delete(id);
    await DB.del('board:' + id);
    if (!meta.boards.length) { const nid = uid(); meta.boards.push({ id: nid, name: 'Quadro 1' }); }
    if (meta.active === id || !meta.boards.some(b => b.id === meta.active)) { board = null; await switchBoard(meta.boards[Math.min(idx, meta.boards.length - 1)].id); }
    else renderTabs();
    saveMeta();
  }
  function renameTab(id) {
    const tab = $(`.tab[data-id="${id}"]`); if (!tab) return;
    const info = meta.boards.find(b => b.id === id);
    const name = tab.querySelector('.tab-name');
    const inp = document.createElement('input'); inp.value = info.name; inp.maxLength = 60; inp.setAttribute('aria-label', 'Nome do quadro');
    name.replaceWith(inp); inp.focus(); inp.select();
    const done = ok => { if (ok && inp.value.trim()) info.name = inp.value.trim(); saveMeta(); renderTabs(); };
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); inp.blur(); } if (e.key === 'Escape') { inp.dataset.cancel = 1; inp.blur(); } e.stopPropagation(); });
    inp.addEventListener('blur', () => done(!inp.dataset.cancel), { once: true });
  }
  function bindTabs() {
    const wrap = $('#tabs');
    wrap.addEventListener('click', e => {
      const x = e.target.closest('[data-close]'); if (x) { e.stopPropagation(); deleteBoard(x.dataset.close); return; }
      const t = e.target.closest('.tab'); if (t && t.dataset.id !== meta.active && !e.target.closest('input')) switchBoard(t.dataset.id);
    });
    wrap.addEventListener('dblclick', e => { const t = e.target.closest('.tab'); if (t && !e.target.closest('[data-close]')) renameTab(t.dataset.id); });
    let dragId = null;
    wrap.addEventListener('dragstart', e => { const t = e.target.closest('.tab'); if (!t) return; dragId = t.dataset.id; e.dataTransfer.setData('text/x-quadro-tab', dragId); e.dataTransfer.effectAllowed = 'move'; });
    wrap.addEventListener('dragover', e => { if (!dragId) return; e.preventDefault(); $$('.tab', wrap).forEach(t => t.classList.remove('drag-over')); e.target.closest('.tab')?.classList.add('drag-over'); });
    wrap.addEventListener('drop', e => {
      if (!dragId) return; e.preventDefault(); e.stopPropagation();
      const t = e.target.closest('.tab'); if (t && t.dataset.id !== dragId) {
        const from = meta.boards.findIndex(b => b.id === dragId), item = meta.boards.splice(from, 1)[0];
        meta.boards.splice(meta.boards.findIndex(b => b.id === t.dataset.id), 0, item); saveMeta();
      }
      dragId = null; renderTabs();
    });
    wrap.addEventListener('dragend', () => { dragId = null; $$('.tab', wrap).forEach(t => t.classList.remove('drag-over')); });
    $('#addTab').addEventListener('click', addBoard);
  }

  /* ---------------- tema (igual ao FURGQuestões) ---------------- */
  let activeTransition = null;
  const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const systemTheme = () => (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const themePref = () => { try { return localStorage.getItem('quadro-theme'); } catch { return null; } };
  function syncTheme() {
    const dark = root.dataset.theme === 'dark';
    const t = $('#themeToggle'); t.style.setProperty('--rest', dark ? 0 : 1);
    t.setAttribute('aria-label', dark ? 'Ativar modo claro' : 'Ativar modo escuro'); t.setAttribute('aria-pressed', String(dark));
    t.title = (dark ? 'Modo escuro' : 'Modo claro') + (themePref() ? '' : ' · automático');
    $('meta[name="theme-color"]').setAttribute('content', dark ? '#0b0e14' : '#eef1f6');
    const sel = $('#setTheme'); if (sel) sel.value = themePref() || 'auto';
  }
  function reveal(source, apply) {
    if (activeTransition) { activeTransition.skipTransition(); activeTransition = null; root.classList.remove('theme-revealing'); }
    if (!source || reducedMotion() || !document.startViewTransition || document.visibilityState !== 'visible') return false;
    const anchor = source.querySelector?.('.tt-knob') || source, rect = anchor.getBoundingClientRect();
    const W = root.clientWidth, H = root.clientHeight;
    const x = Math.round(clamp(rect.left + rect.width / 2, 0, W)), y = Math.round(clamp(rect.top + rect.height / 2, 0, H));
    root.style.setProperty('--reveal-origin', x + 'px ' + y + 'px');
    root.style.setProperty('--reveal-radius', Math.ceil(Math.hypot(Math.max(x, W - x), Math.max(y, H - y))) + 'px');
    root.classList.add('theme-revealing');
    let tr;
    try { tr = document.startViewTransition(() => { if (activeTransition === tr) apply(); }); }
    catch { root.classList.remove('theme-revealing'); return false; }
    activeTransition = tr;
    const fin = () => { if (activeTransition !== tr) return; activeTransition = null; root.classList.remove('theme-revealing'); };
    tr.finished.then(fin, fin);
    return true;
  }
  function applyTheme(t, source) {
    if (t === root.dataset.theme) return syncTheme();
    const go = () => { root.dataset.theme = t; syncTheme(); };
    if (!reveal(source, go)) go();
  }
  function setTheme(t, source) {
    try { if (t === 'auto') localStorage.removeItem('quadro-theme'); else localStorage.setItem('quadro-theme', t); } catch {}
    applyTheme(t === 'auto' ? systemTheme() : t, source);
  }
  function bindTheme() {
    const t = $('#themeToggle');
    let drag = null, suppress = false;
    const endDrag = () => { t.style.removeProperty('--drag'); delete t.dataset.dragging; drag = null; };
    t.addEventListener('pointerdown', e => {
      if (!e.isPrimary || e.button !== 0) return;
      suppress = false;
      const start = root.dataset.theme === 'dark' ? 0 : 1;
      drag = { id: e.pointerId, x: e.clientX, start, width: Math.max(1, t.getBoundingClientRect().width - 36), pos: start, moved: false };
      t.setPointerCapture(e.pointerId);
    });
    t.addEventListener('pointermove', e => {
      if (drag?.id !== e.pointerId) return;
      const dx = e.clientX - drag.x; if (!drag.moved && Math.abs(dx) < 5) return;
      drag.moved = true; drag.pos = clamp(drag.start + dx / drag.width, 0, 1);
      t.dataset.dragging = ''; t.style.setProperty('--drag', drag.pos.toFixed(3));
    });
    t.addEventListener('pointerup', e => {
      if (drag?.id !== e.pointerId) return;
      const { moved, pos } = drag; endDrag();
      if (!moved) return;
      suppress = true;
      const next = pos < 0.5 ? 'dark' : 'light';
      if (next !== root.dataset.theme) setTheme(next, t);
    });
    for (const type of ['pointercancel', 'lostpointercapture']) t.addEventListener(type, e => { if (drag?.id === e.pointerId) endDrag(); });
    t.addEventListener('click', e => {
      if (suppress) { suppress = false; e.preventDefault(); return; }
      setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', t);
    });
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => { if (!themePref()) applyTheme(e.matches ? 'dark' : 'light', t); });
    syncTheme();
  }

  /* ---------------- menu, configurações, atalhos ---------------- */
  function closePopovers(except) {
    for (const id of ['menu', 'settings', 'shortcuts']) if (id !== except) $('#' + id).hidden = true;
    $('#menuBtn').setAttribute('aria-expanded', String(except === 'menu'));
    $('#settingsBtn').setAttribute('aria-expanded', String(except === 'settings'));
  }
  function togglePop(id) { const el = $('#' + id); const open = el.hidden; closePopovers(open ? id : null); el.hidden = !open; }
  function buildMenu() {
    const m = $('#menu');
    const item = (act, ic, label, extra = '', cls = '') => `<button class="mi ${cls}" role="menuitem" data-act="${act}">${icon(ic)}<span>${label}</span>${extra}</button>`;
    m.innerHTML = item('new', 'plus', 'Novo quadro') + item('image', 'image', 'Inserir imagem…', '<small>I</small>') + item('sheet', 'sheet', 'Importar planilha (CSV)…') +
      '<div class="msep"></div>' + item('png', 'download', 'Exportar como PNG') + item('svg', 'download', 'Exportar como SVG') +
      '<div class="msep"></div>' + item('backup', 'download', 'Fazer backup de todos os quadros') + item('restore', 'upload', 'Restaurar backup…') +
      '<div class="msep"></div>' + item('keys', 'keyboard', 'Atalhos', '<small>?</small>') + item('clear', 'broom', 'Limpar este quadro', '', 'danger');
    m.addEventListener('click', e => {
      const b = e.target.closest('[data-act]'); if (!b) return; closePopovers();
      ({ new: addBoard, image: () => $('#fileImage').click(), sheet: () => $('#fileSheet').click(), png: exportPNG, svg: exportSVG, backup: exportBackup, restore: () => $('#fileBackup').click(), keys: () => togglePop('shortcuts'), clear: clearBoard })[b.dataset.act]?.();
    });
    $('#menuBtn').addEventListener('click', e => { e.stopPropagation(); togglePop('menu'); });
  }
  function buildSettings() {
    const p = $('#settings'), s = S();
    const opts = (list, cur) => list.map(([v, l]) => `<option value="${v}"${v === cur ? ' selected' : ''}>${l}</option>`).join('');
    const sw = (id, on) => `<span class="switch"><input type="checkbox" id="${id}"${on ? ' checked' : ''}><span></span></span>`;
    p.innerHTML = `<button class="ibtn panel-close" data-close aria-label="Fechar">${icon('close')}</button>
      <h2>Configurações</h2><p class="sub">Tudo fica salvo só neste navegador.</p>
      <h3>Mesa digitalizadora</h3>
      <div class="row"><label for="setBarrel">Botão lateral<small>Botão de baixo, o mais perto da ponta</small></label><select id="setBarrel">${opts(PEN_ACTIONS, s.barrel)}</select></div>
      <div class="row"><label for="setMiddle">Segundo botão<small>Também vale para o botão do meio do mouse</small></label><select id="setMiddle">${opts(PEN_ACTIONS, s.middle)}</select></div>
      <div class="row"><label for="setPenOnly">Só a caneta desenha<small>Com o dedo, o quadro só se move</small></label>${sw('setPenOnly', s.penOnly)}</div>
      <div class="row"><label for="setPressure">Sensibilidade à pressão</label>${sw('setPressure', s.pressure)}</div>
      <div class="row"><label for="setSmooth">Suavização do traço</label><input id="setSmooth" type="range" min="0" max="0.9" step="0.05" value="${s.smoothing}" style="max-width:150px;--fill:${s.smoothing / 0.9 * 100}%"></div>
      <div class="pen-test" id="penTest"><div><strong>Teste da caneta</strong>Encosta a caneta aqui e aperta os botões dela.<div id="penTestOut" style="margin-top:6px"></div></div></div>
      <h3>Quadro</h3>
      <div class="row"><label for="setBg">Fundo</label><select id="setBg">${opts([['dots', 'Pontos'], ['grid', 'Quadriculado'], ['lines', 'Pautado'], ['none', 'Liso']], s.bg)}</select></div>
      <div class="row"><label for="setWheel">Rodinha do mouse<small>Ctrl + rodinha sempre dá zoom</small></label><select id="setWheel">${opts([['pan', 'Mover o quadro'], ['zoom', 'Dar zoom']], s.wheel)}</select></div>
      <h3>Atalhos de teclado</h3>
      <div id="keyList"></div>
      <div class="row" style="justify-content:flex-start"><button class="outline" id="keyReset" type="button">Restaurar atalhos padrão</button></div>
      <h3>Aparência</h3>
      <div class="row"><label for="setTheme">Tema<small>Automático segue o tema do sistema</small></label><select id="setTheme">${opts([['auto', 'Automático'], ['light', 'Claro'], ['dark', 'Escuro']], themePref() || 'auto')}</select></div>
      <div class="row"><label for="setRefract">Refração do vidro<small>Efeito líquido nas barras (Chrome e Edge)</small></label>${sw('setRefract', s.refraction)}</div>`;
    p.addEventListener('click', e => {
      if (e.target.closest('[data-close]')) return closePopovers();
      const rm = e.target.closest('[data-rm]');
      if (rm) { K()[rm.dataset.rm] = K()[rm.dataset.rm].filter(x => x !== rm.dataset.c); return saveKeys(); }
      const add = e.target.closest('[data-add]');
      if (add) return startRecord(add.dataset.add);
      if (e.target.closest('#keyReset')) { meta.settings.keys = mergeKeys(null); saveKeys(); toast('Atalhos restaurados.'); }
    });
    renderKeyList();
    p.addEventListener('change', e => {
      const id = e.target.id, s = S();
      if (id === 'setBarrel') s.barrel = e.target.value;
      else if (id === 'setMiddle') s.middle = e.target.value;
      else if (id === 'setPenOnly') s.penOnly = e.target.checked;
      else if (id === 'setPressure') { s.pressure = e.target.checked; renderStylebar(); }
      else if (id === 'setSmooth') s.smoothing = +e.target.value;
      else if (id === 'setBg') s.bg = e.target.value;
      else if (id === 'setWheel') s.wheel = e.target.value;
      else if (id === 'setTheme') return setTheme(e.target.value, $('#themeToggle'));
      else if (id === 'setRefract') s.refraction = e.target.checked;
      applySettings(); saveMeta();
    });
    p.addEventListener('input', e => { if (e.target.id === 'setSmooth') e.target.style.setProperty('--fill', (e.target.value / 0.9) * 100 + '%'); });
    const pt = $('#penTest');
    const report = e => {
      const names = []; const b = e.buttons;
      if (b & 1) names.push('ponta'); if (b & 2) names.push('botão lateral'); if (b & 4) names.push('segundo botão'); if (b & 32) names.push('borracha');
      const kind = { pen: 'Caneta', mouse: 'Mouse', touch: 'Toque' }[e.pointerType] || e.pointerType;
      $('#penTestOut').innerHTML = `<b>${kind}</b> · pressão ${Math.round((e.pressure || 0) * 100)}%<br>${names.length ? names.join(' + ') : 'nenhum botão'}`;
      pt.classList.toggle('active', b !== 0);
    };
    for (const t of ['pointerdown', 'pointermove', 'pointerup']) pt.addEventListener(t, report);
    pt.addEventListener('contextmenu', e => e.preventDefault());
    $('#settingsBtn').addEventListener('click', e => { e.stopPropagation(); togglePop('settings'); });
  }
  function penTestReport(name) {
    const out = $('#penTestOut'); if (out && !$('#settings').hidden) out.dataset.last = name;
  }
  function buildShortcuts() {
    const rows = KEY_ACTIONS.map(([a, label]) => `<div><span>${label}</span><kbd>${K()[a].map(c => esc(fmtCombo(c))).join(' · ') || '—'}</kbd></div>`).join('');
    $('#shortcuts').innerHTML = `<button class="ibtn panel-close" data-close aria-label="Fechar">${icon('close')}</button><h2>Atalhos</h2>
      <p class="sub">Muda em Configurações → Atalhos de teclado (aceita mais de uma combinação por ação). Fixos: segurar Espaço move o quadro, Delete apaga, Enter edita, Esc sai e ? abre esta lista. Na tabela, Tab e Enter andam entre células. Fórmulas começam com “=”.</p>
      <div class="keys">${rows}</div>`;
  }
  function applySettings() {
    const s = S();
    root.dataset.bg = s.bg;
    root.dataset.refract = s.refraction ? 'on' : 'off';
  }
  async function clearBoard() {
    if (!board.elements.length) return;
    if (!confirm('Limpar tudo deste quadro? Dá para desfazer com Ctrl+Z.')) return;
    if (editing) endEdit();
    board.elements = []; selection.clear(); renderAll(); commit(); onSelectionChange();
  }

  /* ---------------- exportar ---------------- */
  function download(blob, name) {
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = name; document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
  const boardName = () => (meta.boards.find(b => b.id === board.id)?.name || 'quadro').replace(/[\\/:*?"<>|]+/g, '-');
  function buildSVG() {
    if (editing) endEdit();
    const list = selection.size ? board.elements.filter(e => selection.has(e.id)) : board.elements;
    if (!list.length) { toast('O quadro está vazio.'); return null; }
    const b = unionBox(list.map(bb)), pad = 32;
    const x = Math.floor(b.x - pad), y = Math.floor(b.y - pad), w = Math.ceil(b.w + pad * 2), h = Math.ceil(b.h + pad * 2);
    const cs = getComputedStyle(root);
    const vars = ['--font', '--ink', '--paper', '--line', '--note-base', '--muted', '--danger'].map(v => `${v}:${cs.getPropertyValue(v).trim()}`).join(';');
    let css = '';
    for (const sh of document.styleSheets) {
      let rules; try { rules = sh.cssRules; } catch { continue; }
      for (const r of rules) if (r.selectorText && /\.(fo-inner|t-text|t-note|t-table|s-label|el-stroke)|foreignObject/.test(r.selectorText) && !/editing|editable|focus/.test(r.selectorText)) css += r.cssText.replace(/\[data-theme="dark"\]\s*/g, root.dataset.theme === 'dark' ? '' : '.nunca ') + '\n';
    }
    const ids = new Set(list.map(e => e.id));
    const g = svgEl('g');
    for (const el of board.elements) if (ids.has(el.id)) { const n = nodes.get(el.id); if (n) g.append(n.cloneNode(true)); }
    const inner = new XMLSerializer().serializeToString(g);
    const paper = cs.getPropertyValue('--paper').trim();
    return { w, h, text: `<svg xmlns="${NS}" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="${x} ${y} ${w} ${h}" style="${vars}"><style>${css}</style><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${paper}"/>${inner}</svg>` };
  }
  function exportSVG() { const s = buildSVG(); if (s) download(new Blob([s.text], { type: 'image/svg+xml' }), boardName() + '.svg'); }
  async function exportPNG() {
    if (editing) endEdit();
    const list = selection.size ? board.elements.filter(e => selection.has(e.id)) : board.elements;
    if (!list.length) return toast('O quadro está vazio.');
    try {
      const bx = unionBox(list.map(bb)), pad = 32;
      const x = Math.floor(bx.x - pad), y = Math.floor(bx.y - pad), w = Math.ceil(bx.w + pad * 2), h = Math.ceil(bx.h + pad * 2);
      const k = clamp(2, 0.05, 8000 / Math.max(w, h));
      const cv = document.createElement('canvas'); cv.width = Math.round(w * k); cv.height = Math.round(h * k);
      const ctx = cv.getContext('2d'), cs = getComputedStyle(root), dark = root.dataset.theme === 'dark';
      ctx.fillStyle = cs.getPropertyValue('--paper').trim(); ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.setTransform(k, 0, 0, k, -x * k, -y * k);
      const ink = cs.getPropertyValue('--ink').trim(), C = c => (c === 'ink' ? ink : c), cam = board.cam;
      const W = r => ({ x: (r.left - cam.x) / cam.z, y: (r.top - cam.y) / cam.z, w: r.width / cam.z, h: r.height / cam.z, b: (r.bottom - cam.y) / cam.z });
      const filled = c => c && c !== 'transparent' && !/^rgba\(.*,\s*0\)$/.test(c);
      const box = (node, clipOnly) => {
        const st = getComputedStyle(node), r = W(node.getBoundingClientRect()), rad = parseFloat(st.borderTopLeftRadius) || 0;
        ctx.beginPath(); ctx.roundRect(r.x, r.y, r.w, r.h, rad);
        if (clipOnly) return;
        if (filled(st.backgroundColor)) { ctx.fillStyle = st.backgroundColor; ctx.fill(); }
        const bw = parseFloat(st.borderTopWidth) || 0;
        if (bw > 0 && filled(st.borderTopColor)) { ctx.beginPath(); ctx.roundRect(r.x + bw / 2, r.y + bw / 2, r.w - bw, r.h - bw, Math.max(0, rad - bw / 2)); ctx.strokeStyle = st.borderTopColor; ctx.lineWidth = bw; ctx.stroke(); }
      };
      const text = container => {
        const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT), range = document.createRange();
        for (let t; (t = walker.nextNode());) {
          const st = getComputedStyle(t.parentElement);
          ctx.font = `${st.fontStyle} ${st.fontWeight} ${st.fontSize} ${st.fontFamily}`; ctx.fillStyle = st.color; ctx.textBaseline = 'alphabetic';
          const under = /underline/.test(st.textDecorationLine), strike = /line-through/.test(st.textDecorationLine);
          const draw = (word, rect) => {
            const r = W(rect), m = ctx.measureText(word), base = r.b - (m.fontBoundingBoxDescent || r.h * 0.22);
            ctx.fillText(word, r.x, base);
            if (under || strike) { ctx.fillRect(r.x, under ? base + 2 : base - r.h * 0.28, m.width, Math.max(1, parseFloat(st.fontSize) / 14)); }
          };
          const re = /\S+/g; let mt;
          while ((mt = re.exec(t.data))) {
            range.setStart(t, mt.index); range.setEnd(t, mt.index + mt[0].length);
            const rects = range.getClientRects();
            if (rects.length === 1) draw(mt[0], rects[0]);
            else for (let i = 0; i < mt[0].length; i++) { range.setStart(t, mt.index + i); range.setEnd(t, mt.index + i + 1); const r = range.getClientRects()[0]; if (r) draw(mt[0][i], r); }
          }
        }
      };
      for (const el of list) {
        const n = nodes.get(el.id); if (!n) continue;
        ctx.save();
        if (el.type === 'stroke') {
          const p = new Path2D(n.getAttribute('d'));
          if (el.hl) { ctx.globalAlpha = 0.4; ctx.globalCompositeOperation = dark ? 'screen' : 'multiply'; ctx.strokeStyle = C(el.color); ctx.lineWidth = el.size; ctx.lineCap = ctx.lineJoin = 'round'; ctx.stroke(p); }
          else { ctx.globalAlpha = el.opacity ?? 1; ctx.fillStyle = C(el.color); ctx.fill(p); }
        } else if (el.type === 'arrow') {
          const [line, hd] = n.children, sw = el.sw || 2;
          ctx.strokeStyle = ctx.fillStyle = C(el.color); ctx.lineWidth = sw; ctx.lineCap = ctx.lineJoin = 'round';
          if (el.dashed) ctx.setLineDash([sw * 3, sw * 2.6]);
          ctx.stroke(new Path2D(line.getAttribute('d'))); ctx.setLineDash([]);
          const hdD = hd.getAttribute('d'); if (hdD) { const p = new Path2D(hdD); ctx.lineWidth = sw * 0.7; ctx.fill(p); ctx.stroke(p); }
        } else if (['rect', 'ellipse', 'diamond'].includes(el.type)) {
          const sw = el.sw || 2; ctx.beginPath();
          if (el.type === 'rect') ctx.roundRect(el.x, el.y, el.w, el.h, Math.min(14, el.w / 4, el.h / 4));
          else if (el.type === 'ellipse') ctx.ellipse(el.x + el.w / 2, el.y + el.h / 2, el.w / 2, el.h / 2, 0, 0, Math.PI * 2);
          else { ctx.moveTo(el.x + el.w / 2, el.y); ctx.lineTo(el.x + el.w, el.y + el.h / 2); ctx.lineTo(el.x + el.w / 2, el.y + el.h); ctx.lineTo(el.x, el.y + el.h / 2); ctx.closePath(); }
          if (el.fill !== 'none') { ctx.globalAlpha = el.fill === 'solid' ? 1 : 0.16; ctx.fillStyle = C(el.color); ctx.fill(); ctx.globalAlpha = 1; }
          ctx.strokeStyle = C(el.color); ctx.lineWidth = sw; ctx.lineJoin = 'round'; if (el.dashed) ctx.setLineDash([sw * 3, sw * 2.6]); ctx.stroke(); ctx.setLineDash([]);
          text(n.querySelector('.s-label'));
        } else if (el.type === 'image') {
          const img = await loadImg(board.assets[el.asset]); ctx.drawImage(img, el.x, el.y, el.w, el.h);
        } else {
          const d = n.firstChild;
          if (el.type === 'table') {
            const tb = d.querySelector('table'); box(tb); box(tb, true); ctx.clip();
            for (const td of $$('td', tb)) {
              const st = getComputedStyle(td), r = W(td.getBoundingClientRect());
              if (filled(st.backgroundColor)) { ctx.fillStyle = st.backgroundColor; ctx.fillRect(r.x, r.y, r.w, r.h); }
              ctx.fillStyle = st.borderRightColor;
              if (parseFloat(st.borderRightWidth) > 0) ctx.fillRect(r.x + r.w - 1, r.y, 1, r.h);
              if (parseFloat(st.borderBottomWidth) > 0) ctx.fillRect(r.x, r.y + r.h - 1, r.w, 1);
            }
            box(tb);
          } else box(d);
          text(d);
        }
        ctx.restore();
      }
      const blob = await new Promise((res, rej) => cv.toBlob(bl => (bl ? res(bl) : rej(Error('vazio'))), 'image/png'));
      download(blob, boardName() + '.png');
    } catch (e) { console.warn(e); toast('Não consegui gerar o PNG. Baixei em SVG.'); exportSVG(); }
  }
  async function exportBackup() {
    if (editing) endEdit();
    await flushSave();
    const data = { app: 'quadro-infinito', version: 1, date: new Date().toISOString(), boards: [] };
    for (const b of meta.boards) { const d = await DB.get('board:' + b.id); data.boards.push({ name: b.name, ...(d || newBoard(b.id)) }); }
    download(new Blob([JSON.stringify(data)], { type: 'application/json' }), `quadro-backup-${new Date().toISOString().slice(0, 10)}.json`);
    toast('Backup baixado.');
  }
  async function importBackup(file) {
    try {
      const data = JSON.parse(await file.text());
      if (data.app !== 'quadro-infinito' || !Array.isArray(data.boards)) throw Error('formato');
      let first = null;
      for (const b of data.boards) {
        if (!Array.isArray(b.elements)) continue;
        const id = uid(); first ||= id;
        const names = new Set(meta.boards.map(x => x.name));
        let name = String(b.name || 'Quadro').slice(0, 60); if (names.has(name)) name += ' (backup)';
        meta.boards.push({ id, name });
        await DB.set('board:' + id, { id, elements: b.elements.filter(e => e && typeof e === 'object' && e.id && e.type), assets: b.assets && typeof b.assets === 'object' ? b.assets : {}, cam: b.cam || newBoard(id).cam });
      }
      if (!first) throw Error('vazio');
      await DB.set('meta', clone(meta));
      await switchBoard(first);
      toast('Backup restaurado como novas abas.');
    } catch { toast('Esse arquivo não é um backup do Quadro.'); }
  }

  let toastTimer = null;
  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 3200); }

  /* ---------------- teclado, colar, arrastar ---------------- */
  /* ---------------- atalhos configuráveis ---------------- */
  const KEY_ACTIONS = [
    ['undo', 'Desfazer', ['Ctrl+z']], ['redo', 'Refazer', ['Ctrl+Shift+z', 'Ctrl+y']],
    ['duplicate', 'Duplicar', ['Ctrl+d']], ['selectAll', 'Selecionar tudo', ['Ctrl+a']],
    ['bringFront', 'Trazer para frente', ['Ctrl+]']], ['sendBack', 'Enviar para trás', ['Ctrl+[']],
    ['zoomIn', 'Aumentar zoom', ['Ctrl+=', 'Ctrl++']], ['zoomOut', 'Diminuir zoom', ['Ctrl+-']],
    ['zoomReset', 'Zoom 100%', ['Ctrl+0']], ['fitAll', 'Enquadrar tudo', ['Shift+1']],
    ['child', 'Ramificar (mapa mental)', ['Tab', 'Ctrl+Enter']], ['sibling', 'Ramo irmão', ['Shift+Tab']],
    ['toolSelect', 'Ferramenta: selecionar', ['v']], ['toolHand', 'Ferramenta: mover quadro', ['h']],
    ['toolPen', 'Ferramenta: caneta', ['p']], ['toolHl', 'Ferramenta: marca-texto', ['m']],
    ['toolEraser', 'Ferramenta: borracha', ['e']], ['toolRect', 'Ferramenta: retângulo', ['r']],
    ['toolEllipse', 'Ferramenta: elipse', ['o']], ['toolDiamond', 'Ferramenta: losango', ['d']],
    ['toolArrow', 'Ferramenta: seta', ['a']], ['toolLine', 'Ferramenta: linha', ['l']],
    ['toolText', 'Ferramenta: texto', ['t']], ['toolNote', 'Ferramenta: nota', ['n']],
    ['toolTable', 'Ferramenta: tabela', ['g']], ['toolImage', 'Inserir imagem', ['i']],
  ];
  const KEY_LABEL = Object.fromEntries(KEY_ACTIONS.map(([a, l]) => [a, l]));
  const TOOL_OF = { toolSelect: 'select', toolHand: 'hand', toolPen: 'pen', toolHl: 'hl', toolEraser: 'eraser', toolRect: 'rect', toolEllipse: 'ellipse', toolDiamond: 'diamond', toolArrow: 'arrow', toolLine: 'line', toolText: 'text', toolNote: 'note', toolTable: 'table', toolImage: 'image' };
  const K = () => meta.settings.keys;
  let keyMapCache = null;
  const keyMap = () => {
    if (!keyMapCache) { keyMapCache = new Map(); for (const [a] of KEY_ACTIONS) for (const c of K()[a] || []) keyMapCache.set(c, a); }
    return keyMapCache;
  };
  function mergeKeys(saved) {
    const out = {}, seen = new Set();
    for (const [a, , d] of KEY_ACTIONS) {
      const s = saved?.[a];
      const list = Array.isArray(s) && s.every(x => typeof x === 'string' && x.length <= 40) ? s : d;
      out[a] = [...new Set(list)].filter(c => !seen.has(c) && seen.add(c));
    }
    return out;
  }
  // Monta o nome de uma combinação a partir do evento: "Ctrl+Shift+z", "Tab", "Space"...
  function comboOf(e) {
    const k = e.key;
    if (['Control', 'Shift', 'Alt', 'Meta', 'AltGraph'].includes(k)) return null;
    let key = k.length === 1 ? k.toLowerCase() : k;
    if (k === ' ') key = 'Space';
    if (e.shiftKey && /^Digit\d$/.test(e.code)) key = e.code.slice(5);
    const shiftable = key.length > 1 || /^[a-z0-9]$/.test(key);
    const m = [];
    if (e.ctrlKey || e.metaKey) m.push('Ctrl');
    if (e.altKey) m.push('Alt');
    if (e.shiftKey && shiftable) m.push('Shift');
    return [...m, key].join('+');
  }
  const fmtCombo = c => c.replace('Space', 'Espaço').replace(/(^|\+)([a-z])$/, (m, p, l) => p + l.toUpperCase());
  function saveKeys() { keyMapCache = null; clearTimeout(metaTimer); DB.set('meta', clone(meta)).catch(() => {}); renderKeyList(); buildShortcuts(); }
  function runKey(act, e) {
    const one = selection.size === 1 ? byId([...selection][0]) : null;
    const cx = innerWidth / 2, cy = innerHeight / 2;
    switch (act) {
      case 'undo': undo(); break;
      case 'redo': redo(); break;
      case 'duplicate': duplicate(); break;
      case 'selectAll': setTool('select'); board.elements.forEach(el => selection.add(el.id)); onSelectionChange(); break;
      case 'bringFront': reorder(true); break;
      case 'sendBack': reorder(false); break;
      case 'zoomIn': zoomAt(1.2, cx, cy); break;
      case 'zoomOut': zoomAt(1 / 1.2, cx, cy); break;
      case 'zoomReset': zoomAt(1 / board.cam.z, cx, cy); break;
      case 'fitAll': fitAll(); break;
      case 'child': if (isNode(one)) addChild(one, false); break;
      case 'sibling': if (isNode(one)) addChild(one, true); break;
      default: if (TOOL_OF[act] && !e.repeat) setTool(TOOL_OF[act]);
    }
  }
  let recording = null;
  function renderKeyList() {
    const list = $('#keyList'); if (!list) return;
    list.innerHTML = KEY_ACTIONS.map(([a, label]) => `<div class="krow"><span class="klabel">${label}</span><span class="kcombos">${K()[a].map(c => `<span class="kchip"><kbd>${esc(fmtCombo(c))}</kbd><button type="button" class="kx" data-rm="${a}" data-c="${esc(c)}" aria-label="Remover ${esc(fmtCombo(c))}">×</button></span>`).join('')}<button type="button" class="kadd" data-add="${a}">${recording === a ? 'Pressione uma tecla…' : '+ adicionar'}</button></span></div>`).join('');
  }
  function startRecord(a) {
    if (recording) return;
    recording = a; renderKeyList();
    const stop = () => { removeEventListener('keydown', onKey, true); recording = null; renderKeyList(); };
    const onKey = e => {
      e.preventDefault(); e.stopImmediatePropagation(); e.stopPropagation();
      if (e.key === 'Escape' && !e.ctrlKey && !e.altKey && !e.shiftKey) { stop(); return; }
      const c = comboOf(e); if (!c) return;
      const keys = K();
      for (const [b] of KEY_ACTIONS) keys[b] = keys[b].filter(x => x !== c);
      keys[a] = [...keys[a], c];
      stop(); saveKeys();
      toast(`${fmtCombo(c)} → ${KEY_LABEL[a]}`);
    };
    addEventListener('keydown', onKey, true);
  }

  function bindKeys() {
    addEventListener('keydown', e => {
      const typing = isTyping(e.target);
      const combo = comboOf(e);
      const act = combo ? keyMap().get(combo) : undefined;
      if (typing) {
        if (editing && e.target.closest?.('#layer')) {
          const el = byId(editing.id);
          if (el && el.type !== 'table') {
            if (e.key === 'Escape') { e.preventDefault(); endEdit(); }
            else if (act === 'child' || act === 'sibling') { e.preventDefault(); endEdit(); if (byId(el.id)) addChild(el, act === 'sibling'); }
          }
        }
        return;
      }
      if (act) {
        const one = selection.size === 1 ? byId([...selection][0]) : null;
        if ((act === 'child' || act === 'sibling') && !isNode(one)) return;
        e.preventDefault(); runKey(act, e); return;
      }
      if (e.altKey) return;
      if (e.key === ' ') { e.preventDefault(); if (!spaceDown) { spaceDown = true; updateCursor(); } return; }
      if (e.key === 'Delete' || e.key === 'Backspace') { if (selection.size) { e.preventDefault(); removeIds(new Set(selection)); } return; }
      if (e.key === 'Escape') { if (!$('#menu').hidden || !$('#settings').hidden || !$('#shortcuts').hidden) closePopovers(); else { selection.clear(); onSelectionChange(); } return; }
      const one = selection.size === 1 ? byId([...selection][0]) : null;
      if (e.key === 'Enter' && editable(one)) { e.preventDefault(); startEdit(one, one.type === 'table' ? [0, 0] : null); return; }
      if (e.key === '?') { togglePop('shortcuts'); return; }
      if (e.key.startsWith('Arrow') && selection.size) {
        e.preventDefault(); const d = e.shiftKey ? 10 : 1;
        const dx = e.key === 'ArrowLeft' ? -d : e.key === 'ArrowRight' ? d : 0, dy = e.key === 'ArrowUp' ? -d : e.key === 'ArrowDown' ? d : 0;
        for (const id of selection) { const el = byId(id); if (el) { translate(el, clone(el), dx, dy); renderEl(el); } }
        renderArrows(); renderOverlay(); commit(); return;
      }
    });
    addEventListener('keyup', e => { if (e.key === ' ') { spaceDown = false; updateCursor(); } });
    addEventListener('blur', () => { spaceDown = false; heldOverride = null; updateCursor(); });
  }
  function bindClipboard() {
    document.addEventListener('copy', e => {
      if (isTyping(e.target) || !selection.size) return;
      e.preventDefault();
      const els = clone(board.elements.filter(x => selection.has(x.id)));
      const assets = {}; for (const el of els) if (el.type === 'image') assets[el.asset] = board.assets[el.asset];
      e.clipboardData.setData('text/plain', CLIP + JSON.stringify({ els, assets }));
    });
    document.addEventListener('cut', e => {
      if (isTyping(e.target) || !selection.size) return;
      e.preventDefault();
      const els = clone(board.elements.filter(x => selection.has(x.id)));
      const assets = {}; for (const el of els) if (el.type === 'image') assets[el.asset] = board.assets[el.asset];
      e.clipboardData.setData('text/plain', CLIP + JSON.stringify({ els, assets }));
      removeIds(new Set(selection));
    });
    document.addEventListener('paste', e => {
      if (isTyping(e.target)) return;
      const dt = e.clipboardData; if (!dt) return;
      const at = pointerWorld && inView(pointerWorld) ? pointerWorld : viewCenter();
      const files = [...dt.files].filter(f => f.type.startsWith('image/'));
      if (files.length) { e.preventDefault(); files.forEach((f, i) => addImageFile(f, [at[0] + i * 30, at[1] + i * 30])); return; }
      const text = dt.getData('text/plain'); if (!text) return;
      e.preventDefault();
      if (text.startsWith(CLIP)) { try { pasteElements(JSON.parse(text.slice(CLIP.length))); } catch {} return; }
      if (text.includes('\t')) { createTable(at, parseDelimited(text)); toast('Colado como tabela.'); return; }
      setTool('select'); createText(at, textToHtml(text.slice(0, 20000)));
    });
    addEventListener('dragover', e => { if (e.dataTransfer?.types?.includes('Files')) e.preventDefault(); });
    addEventListener('drop', e => {
      if (!e.dataTransfer?.files?.length) return;
      e.preventDefault();
      const at = toWorld(e);
      [...e.dataTransfer.files].forEach((f, i) => {
        const p = [at[0] + i * 30, at[1] + i * 30];
        if (f.type.startsWith('image/')) addImageFile(f, p);
        else if (/\.(csv|tsv|txt)$/i.test(f.name)) importSheet(f, p);
        else if (/\.json$/i.test(f.name)) importBackup(f);
      });
    });
    $('#fileImage').addEventListener('change', e => { const c = viewCenter(); [...e.target.files].forEach((f, i) => addImageFile(f, [c[0] + i * 30, c[1] + i * 30])); e.target.value = ''; });
    $('#fileSheet').addEventListener('change', e => { const f = e.target.files[0]; if (f) importSheet(f); e.target.value = ''; });
    $('#fileBackup').addEventListener('change', e => { const f = e.target.files[0]; if (f) importBackup(f); e.target.value = ''; });
  }
  function bindBoard() {
    for (const t of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel']) svg.addEventListener(t, onPtr);
    svg.addEventListener('pointerleave', e => { if (e.pointerType !== 'touch') hideRing(); });
    svg.addEventListener('contextmenu', e => e.preventDefault());
    svg.addEventListener('dblclick', e => e.preventDefault());
    svg.addEventListener('wheel', e => {
      e.preventDefault();
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? innerHeight : 1;
      const dx = e.deltaX * unit, dy = e.deltaY * unit;
      const zoom = e.ctrlKey || e.metaKey || (S().wheel === 'zoom' && !e.shiftKey);
      if (zoom) zoomAt(Math.exp(-dy * (Math.abs(dy) < 50 ? 0.01 : 0.0018)), e.clientX, e.clientY);
      else { board.cam.x -= e.shiftKey && !dx ? dy : dx; board.cam.y -= e.shiftKey && !dx ? 0 : dy; applyCam(); }
      scheduleSave();
    }, { passive: false });
    $('#undoBtn').addEventListener('click', undo);
    $('#redoBtn').addEventListener('click', redo);
    $('#zoomIn').addEventListener('click', () => zoomAt(1.2, innerWidth / 2, innerHeight / 2));
    $('#zoomOut').addEventListener('click', () => zoomAt(1 / 1.2, innerWidth / 2, innerHeight / 2));
    $('#zoomLabel').addEventListener('click', () => zoomAt(1 / board.cam.z, innerWidth / 2, innerHeight / 2));
    $('#zoomFit').addEventListener('click', fitAll);
    document.addEventListener('pointerdown', e => { if (!e.target.closest('.pop, .panel, #menuBtn, #settingsBtn, #board')) closePopovers(); });
    addEventListener('resize', () => { moveDrop(); positionContextBar(); });
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flushSave(); });
    addEventListener('pagehide', () => flushSave());
  }

  /* ---------------- primeiro uso ---------------- */
  function seedWelcome() {
    const ids = { a: uid(), b: uid(), c: uid(), d: uid(), t: uid() };
    const ink = 'ink';
    board.elements.push(
      { id: uid(), type: 'text', x: -330, y: -250, w: 10, h: 10, autoW: true, color: ink, fontSize: 40, html: '<b>Teu quadro infinito</b>' },
      { id: uid(), type: 'text', x: -328, y: -192, w: 10, h: 10, autoW: true, color: ink, fontSize: 17, html: 'Desenha com a caneta, escreve, monta mapas mentais e tabelas.<br>Botão lateral da caneta = borracha (dá pra mudar nas configurações ⚙).' },
      { id: ids.a, type: 'note', x: -330, y: -90, w: 210, h: 100, minH: 100, color: '#0090ff', fontSize: 18, html: '<b>Ideia central</b><br>Seleciona e aperta Tab' },
      { id: ids.b, type: 'note', x: -10, y: -150, w: 190, h: 80, minH: 80, color: '#30a46c', fontSize: 16, html: 'Ramo 1' },
      { id: ids.c, type: 'note', x: -10, y: -30, w: 190, h: 80, minH: 80, color: '#f5b301', fontSize: 16, html: 'Ramo 2 — clique duplo para editar' },
      { id: uid(), type: 'arrow', x1: 0, y1: 0, x2: 0, y2: 0, sb: ids.a, eb: ids.b, color: ink, sw: 2, head: true },
      { id: uid(), type: 'arrow', x1: 0, y1: 0, x2: 0, y2: 0, sb: ids.a, eb: ids.c, color: ink, sw: 2, head: true },
      { id: ids.t, type: 'table', x: 260, y: -150, w: 10, h: 10, header: true, color: '#6e56cf', cells: [['Matéria', 'Horas'], ['Cálculo', '6'], ['Física', '4'], ['Inglês', '3'], ['Total', '=SOMA(B2:B4)']] },
    );
  }

  /* ---------------- início ---------------- */
  async function init() {
    buildToolbar(); bindStylebar(); bindContextBar(); bindTabs(); bindTheme(); bindKeys(); bindClipboard(); bindBoard();
    try { await DB.open(); } catch { DB.mem = new Map(); }
    let m = null; try { m = await DB.get('meta'); } catch {}
    let first = false;
    if (!m || !Array.isArray(m.boards) || !m.boards.length) { const id = uid(); m = { boards: [{ id, name: 'Quadro 1' }], active: id }; first = true; }
    m.settings = { ...DEFAULT_SETTINGS, ...(m.settings || {}) };
    m.styles = Object.fromEntries(Object.entries(DEFAULT_STYLES).map(([k, v]) => [k, { ...v, ...(m.styles?.[k] || {}) }]));
    if (!m.boards.some(b => b.id === m.active)) m.active = m.boards[0].id;
    m.settings.keys = mergeKeys(m.settings.keys);
    meta = m;
    buildMenu(); buildSettings(); buildShortcuts(); applySettings();
    $('#shortcuts').addEventListener('click', e => { if (e.target.closest('[data-close]')) closePopovers(); });
    await switchBoard(meta.active);
    if (first) { seedWelcome(); renderAll(); hist.last = snap(); fitAll(); await flushSave(); }
    setTool('pen');
    requestAnimationFrame(moveDrop);
    if (document.fonts?.ready) document.fonts.ready.then(() => { board.elements.forEach(measureEl); renderArrows(); renderOverlay(); moveDrop(); });
    globalThis.__quadro = { get board() { return board; }, get meta() { return meta; }, setTool, selection, fitAll, flushSave, evalTable };
  }
  init();
})();
