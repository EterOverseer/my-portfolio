/* ══════════════════════════════════════════════════════════════
   SWARM-REBUILD  —  Full Cinematic Build Intro
   ─────────────────────────────────────────────────────────────
   Phase A : Intro Screen — blank canvas + cursors build the UI
   Phase B : Scroll Reveal  — cursor highlights each section
   ══════════════════════════════════════════════════════════════ */

/* ─── Cursor palette ─── */
const SWARM_COLORS = [
  '#38b6ff', '#00ff88', '#ff6b6b', '#ffd93d',
  '#c77dff', '#ff9f43', '#48dbfb', '#ff6bcb',
];

/* ─── Timing (ms) ─── */
const TIMING = {
  cursorSpawn   : 320,   // gap between each cursor appearing
  drawDelay     : 500,   // pause after cursor lands before it starts drawing
  boxDuration   : 480,   // how long to draw one box
  textTypeSpeed : 38,    // ms per character when typing
  holdAfterBuild: 900,   // freeze frame before reveal
  revealFade    : 700,   // fade-out of swarm screen
};

/* ═══════════════════════════════════════════════
   PHASE A — Intro Screen
═══════════════════════════════════════════════ */
class SwarmIntro {
  constructor() {
    this.overlay  = null;
    this.canvas   = null;
    this.ctx      = null;
    this.cursors  = [];
    this.tasks    = [];
    this.taskIdx  = 0;
    this.raf      = null;
    this.done     = false;
  }

  /* ── Build the overlay DOM ── */
  mount() {
    // Hide main content while building
    document.body.style.overflow = 'hidden';

    this.overlay = document.createElement('div');
    this.overlay.id = 'swarm-overlay';
    this.overlay.innerHTML = `
      <canvas id="swarm-canvas"></canvas>
      <div id="swarm-hint">
        <span class="swarm-dot"></span>
        <span id="swarm-hint-text">agents are building your portfolio…</span>
      </div>
      <button id="swarm-skip">skip ↗</button>
    `;
    document.body.appendChild(this.overlay);

    // Size canvas
    this.canvas = document.getElementById('swarm-canvas');
    this.ctx    = this.canvas.getContext('2d');
    this._resize();
    window.addEventListener('resize', () => this._resize());

    // Skip button
    document.getElementById('swarm-skip')
      .addEventListener('click', () => this.finish(true));

    return this;
  }

  _resize() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width  = window.innerWidth  * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.canvas.style.width  = window.innerWidth  + 'px';
    this.canvas.style.height = window.innerHeight + 'px';
    if (this.ctx) this.ctx.scale(dpr, dpr);
  }

  /* ── Build the task list from real DOM layout ── */
  _buildTasks() {
    // We describe the layout from scratch (swarm draws on blank canvas)
    const W = window.innerWidth;
    const H = window.innerHeight;
    const isMobile = W < 768;

    this.tasks = [
      // NAV bar
      { type:'box',  color:SWARM_COLORS[0], x:0,        y:0,       w:W,          h:60,          label:'nav',       delay:0  },
      { type:'text', color:SWARM_COLORS[0], x:28,       y:35,      text:'EterOverseer',          delay:200  },
      { type:'text', color:SWARM_COLORS[2], x:W-180,    y:35,      text:'Home  Works  About',    delay:300  },

      // Hero avatar circle
      { type:'circle', color:SWARM_COLORS[1],
        cx: isMobile ? W/2 : W*0.72,
        cy: isMobile ? 160  : H*0.48,
        r:  isMobile ? 70   : 110,
        delay: 180 },

      // Hero heading box
      { type:'box',  color:SWARM_COLORS[3],
        x: isMobile ? W*0.08 : W*0.06,
        y: isMobile ? 260    : H*0.25,
        w: isMobile ? W*0.84 : W*0.48,
        h: isMobile ? 54     : 72,
        label:'title', delay:280 },

      // Status badge
      { type:'box',  color:SWARM_COLORS[4],
        x: isMobile ? W*0.08 : W*0.06,
        y: isMobile ? 330    : H*0.42,
        w: 220, h:32, label:'badge', delay:360 },

      // Description lines
      ...[0,1,2].map((i) => ({
        type:'line', color:SWARM_COLORS[5],
        x1: isMobile ? W*0.08 : W*0.06,
        y1: (isMobile ? 390 : H*0.52) + i*22,
        x2: (isMobile ? W*0.92 : W*0.06 + W*0.44) - (i === 2 ? 60 : 0),
        y2: (isMobile ? 390 : H*0.52) + i*22,
        delay: 420 + i*80,
      })),

      // Contact buttons
      ...[0,1,2,3,4].map((i) => ({
        type:'box', color:SWARM_COLORS[i % SWARM_COLORS.length],
        x: (isMobile ? W*0.08 : W*0.06) + i*96,
        y: isMobile ? 460 : H*0.66,
        w:88, h:36, label:['GH','FB','LINE','TEL','✉'][i],
        delay: 500 + i*60,
      })),

      // Skill chips (right side)
      ...['Linux','Arduino','n8n','IoT','GitHub'].map((s, i) => ({
        type:'chip', color:SWARM_COLORS[(i+2) % SWARM_COLORS.length],
        x: isMobile ? W*0.08 + i%3*100 : W*0.56 + (i%3)*108,
        y: isMobile ? 540 + Math.floor(i/3)*40 : H*0.62 + Math.floor(i/3)*40,
        text: s,
        delay: 580 + i*55,
      })),

      // Footer line
      { type:'box', color:SWARM_COLORS[6],
        x:0, y:H-4, w:W, h:4, label:'', delay:800 },
    ];
  }

  /* ── Spawn one SVG cursor ── */
  _spawnCursor(color, label) {
    const el = document.createElement('div');
    el.className = 'swarm-cursor';
    el.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 20 20">
        <path d="M4 2 L16 10 L10 11 L8 18 Z"
              fill="${color}" stroke="#fff" stroke-width="1.2"/>
      </svg>
      <span class="swarm-cursor-label" style="background:${color}">${label}</span>
    `;
    // Start from random edge
    const edge = Math.floor(Math.random() * 4);
    const W = window.innerWidth, H = window.innerHeight;
    let sx, sy;
    if (edge === 0) { sx = Math.random()*W; sy = -20; }
    else if (edge === 1) { sx = W+20; sy = Math.random()*H; }
    else if (edge === 2) { sx = Math.random()*W; sy = H+20; }
    else { sx = -20; sy = Math.random()*H; }

    el.style.left = sx + 'px';
    el.style.top  = sy + 'px';
    this.overlay.appendChild(el);

    return { el, color, label, x: sx, y: sy, busy: false };
  }

  /* ── Animate cursor from current pos to (tx,ty) ── */
  _moveCursor(cursor, tx, ty, duration) {
    return new Promise(resolve => {
      const sx = cursor.x, sy = cursor.y;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        // ease-in-out cubic
        const e = p < 0.5 ? 4*p*p*p : 1 - Math.pow(-2*p+2,3)/2;
        cursor.x = sx + (tx-sx)*e;
        cursor.y = sy + (ty-sy)*e;
        cursor.el.style.left = cursor.x + 'px';
        cursor.el.style.top  = cursor.y + 'px';
        if (p < 1) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
  }

  /* ── Draw a box on canvas (animated) ── */
  _drawBox(color, x, y, w, h, label, duration) {
    return new Promise(resolve => {
      const ctx = this.ctx;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        ctx.clearRect(x-2, y-2, w+4, h+4);  // minor clear for redraw artifact
        // Fill with low alpha
        ctx.fillStyle = color + '18';
        ctx.fillRect(x, y, w*p, h);
        // Border — draw as 4 segments progressively
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 3]);
        ctx.strokeRect(x, y, w*p, h);
        ctx.setLineDash([]);
        // Label
        if (p > 0.5 && label) {
          ctx.fillStyle = color + 'cc';
          ctx.font = '10px "Fira Code", monospace';
          ctx.fillText(label, x+6, y+14);
        }
        if (p < 1) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
  }

  /* ── Draw a circle ── */
  _drawCircle(color, cx, cy, r, duration) {
    return new Promise(resolve => {
      const ctx = this.ctx;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2 * p);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
        // Slight fill
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = color + '0d';
        ctx.fill();
        if (p < 1) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
  }

  /* ── Type text on canvas ── */
  _typeText(color, x, y, text, speed) {
    return new Promise(resolve => {
      let i = 0;
      const ctx = this.ctx;
      ctx.font = '13px "Plus Jakarta Sans", sans-serif';
      const tick = () => {
        if (i < text.length) {
          ctx.fillStyle = color + 'dd';
          ctx.fillText(text[i], x + i*8, y);
          i++;
          setTimeout(tick, speed);
        } else {
          resolve();
        }
      };
      tick();
    });
  }

  /* ── Draw a horizontal line ── */
  _drawLine(color, x1, y1, x2, y2, duration) {
    return new Promise(resolve => {
      const ctx = this.ctx;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1 + (x2-x1)*p, y1);
        ctx.strokeStyle = color + '88';
        ctx.lineWidth = 2;
        ctx.stroke();
        if (p < 1) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
  }

  /* ── Draw a chip ── */
  _drawChip(color, x, y, text) {
    const ctx = this.ctx;
    const pad = 8, h = 24;
    ctx.font = '11px "Fira Code", monospace';
    const tw = ctx.measureText(text).width;
    const w = tw + pad*2;
    ctx.fillStyle = color + '22';
    // Rounded rect
    const r = 12;
    ctx.beginPath();
    ctx.moveTo(x+r, y); ctx.lineTo(x+w-r, y);
    ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    ctx.lineTo(x+w, y+h-r);
    ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    ctx.lineTo(x+r, y+h); ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    ctx.lineTo(x, y+r); ctx.quadraticCurveTo(x, y, x+r, y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = color + '99'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = color; ctx.fillText(text, x+pad, y+16);
    return Promise.resolve();
  }

  /* ── Dispatch a single task to the next free cursor ── */
  async _executeTask(task) {
    // Pick a free cursor, or the least-busy one
    let cursor = this.cursors.find(c => !c.busy) || this.cursors[this.taskIdx % this.cursors.length];
    cursor.busy = true;

    const pad = 12;
    let tx, ty;

    switch (task.type) {
      case 'box':
        tx = task.x + pad; ty = task.y + pad;
        break;
      case 'circle':
        tx = task.cx - task.r - 20; ty = task.cy;
        break;
      case 'text':
        tx = task.x; ty = task.y - 10;
        break;
      case 'line':
        tx = task.x1; ty = task.y1 - 8;
        break;
      case 'chip':
        tx = task.x; ty = task.y - 8;
        break;
      default:
        tx = task.x || 0; ty = task.y || 0;
    }

    await this._moveCursor(cursor, tx, ty, 420);
    await new Promise(r => setTimeout(r, 120));  // hover pause

    switch (task.type) {
      case 'box':
        await this._drawBox(task.color, task.x, task.y, task.w, task.h, task.label, TIMING.boxDuration);
        break;
      case 'circle':
        await this._drawCircle(task.color, task.cx, task.cy, task.r, TIMING.boxDuration);
        break;
      case 'text':
        await this._typeText(task.color, task.x, task.y, task.text, TIMING.textTypeSpeed);
        break;
      case 'line':
        await this._drawLine(task.color, task.x1, task.y1, task.x2, task.y2, 320);
        break;
      case 'chip':
        await this._drawChip(task.color, task.x, task.y, task.text);
        break;
    }

    cursor.busy = false;
  }

  /* ── Main entry point ── */
  async run() {
    this._buildTasks();

    // Spawn cursors staggered
    const names = ['aria','bob','cleo','dev','eve','finn'];
    for (let i = 0; i < Math.min(6, SWARM_COLORS.length); i++) {
      await new Promise(r => setTimeout(r, TIMING.cursorSpawn));
      const c = this._spawnCursor(SWARM_COLORS[i], names[i]);
      this.cursors.push(c);
    }

    // Fire tasks with their delays
    const promises = this.tasks.map((task, idx) =>
      new Promise(r => setTimeout(() => this._executeTask(task).then(r), task.delay))
    );

    await Promise.all(promises);
    await new Promise(r => setTimeout(r, TIMING.holdAfterBuild));

    this.finish(false);
  }

  /* ── Fade out and reveal real page ── */
  finish(instant) {
    if (this.done) return;
    this.done = true;

    const overlay = this.overlay;
    overlay.style.transition = `opacity ${instant ? 0.2 : TIMING.revealFade/1000}s ease`;
    overlay.style.opacity = '0';

    setTimeout(() => {
      overlay.remove();
      document.body.style.overflow = '';
      // Trigger scroll-reveal for already-visible elements
      document.querySelectorAll('.reveal').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight) el.classList.add('visible');
      });
      // Fire swarm scroll-reveal observers
      SwarmScroll.init();
    }, instant ? 200 : TIMING.revealFade);
  }
}

/* ═══════════════════════════════════════════════
   PHASE B — Scroll Reveal cursor highlights
═══════════════════════════════════════════════ */
const SwarmScroll = {
  cursors: [],
  pool: [],

  init() {
    // Create a small pool of scroll-cursor SVGs
    for (let i = 0; i < 3; i++) {
      const el = document.createElement('div');
      el.className = 'swarm-scroll-cursor';
      el.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 20 20">
          <path d="M4 2 L16 10 L10 11 L8 18 Z"
                fill="${SWARM_COLORS[i*2]}" stroke="#fff" stroke-width="1.2"/>
        </svg>
      `;
      el.style.opacity = '0';
      el.style.position = 'fixed';
      el.style.pointerEvents = 'none';
      el.style.zIndex = '5000';
      el.style.transition = 'opacity 0.3s';
      document.body.appendChild(el);
      this.pool.push({ el, color: SWARM_COLORS[i*2], busy: false });
    }

    // Observe every element that should be reveal-animated
    const targets = document.querySelectorAll(
      '.work-card, .stat-card, .fs-card, .about-section, .info-item, .profile-card, .section-title, .section-eyebrow'
    );

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this._highlight(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    targets.forEach(el => obs.observe(el));
  },

  /* Animate a cursor to an element and "draw" its border */
  _highlight(el) {
    const c = this.pool.find(p => !p.busy);
    if (!c) return;  // all busy, skip gracefully
    c.busy = true;

    const rect = el.getBoundingClientRect();
    const tx = rect.left + 8;
    const ty = rect.top + 8;

    // Position cursor at top-left of element
    c.el.style.left = (tx - 20) + 'px';
    c.el.style.top  = (ty - 20) + 'px';
    c.el.style.opacity = '1';

    // Add a highlight ring to the element
    el.style.transition = 'box-shadow 0.4s ease, outline 0.4s ease';
    el.style.outline = `2px solid ${c.color}88`;
    el.style.boxShadow = `0 0 0 4px ${c.color}22, 0 12px 36px ${c.color}33`;

    // Animate cursor across the top edge
    const startX = tx;
    const endX   = rect.right - 8;
    const duration = 400;
    const start = performance.now();

    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const ex = p < 0.5 ? 4*p*p*p : 1 - Math.pow(-2*p+2,3)/2;
      c.el.style.left = (startX + (endX - startX) * ex) + 'px';
      if (p < 1) requestAnimationFrame(tick);
      else {
        // Fade out cursor, remove outline
        setTimeout(() => {
          c.el.style.opacity = '0';
          el.style.outline = '';
          el.style.boxShadow = '';
          c.busy = false;
        }, 300);
      }
    };
    requestAnimationFrame(tick);
  }
};

/* ═══════════════════════════════════════════════
   BOOTSTRAP
═══════════════════════════════════════════════ */
(function bootstrap() {
  // Skip on mobile narrow screens to avoid performance hit
  // (but still run scroll-reveal)
  const intro = new SwarmIntro();
  intro.mount();
  intro.run();
})();
