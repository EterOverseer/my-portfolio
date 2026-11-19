/* ══════════════════════════════════════════════════════════════
   SWARM-REBUILD  v2  —  Cinematic Build Intro
   ──────────────────────────────────────────────────────────────
   แต่ละ cursor มี queue ของตัวเอง  ทำงานต่อเนื่องทีละ task
   ไม่ยิงพร้อมกันหมด → เห็นทุก stroke ช้าๆ ชัดเจน
   ══════════════════════════════════════════════════════════════ */

const SWARM_COLORS = [
  '#38b6ff', '#00ff88', '#ff6b6b', '#ffd93d',
  '#c77dff', '#ff9f43', '#48dbfb', '#ff6bcb',
];

/* ─── ปรับ timing ให้ช้าลง ดู cinematic ─── */
const T = {
  moveSpeed     : 680,   // ms ต่อ move (cursor เดินทาง)
  hoverPause    : 180,   // ms หยุดก่อนวาด
  boxDraw       : 900,   // ms วาด rectangle
  circleDraw    : 1100,  // ms วาด circle
  lineDraw      : 600,   // ms วาด line
  typeSpeed     : 55,    // ms ต่อตัวอักษร
  chipDraw      : 400,   // ms วาด chip
  spawnGap      : 400,   // ms ระหว่าง cursor แต่ละตัว spawn
  holdEnd       : 1400,  // ms freeze ก่อน reveal
  revealFade    : 900,   // ms fade-out
};

/* ════════════════════════════════════════════
   UTILS
════════════════════════════════════════════ */
const ease = p => p < 0.5 ? 4*p*p*p : 1 - Math.pow(-2*p+2,3)/2;

function animate(duration, onTick) {
  return new Promise(resolve => {
    const start = performance.now();
    function frame(now) {
      const p = Math.min((now - start) / duration, 1);
      onTick(ease(p), p);
      if (p < 1) requestAnimationFrame(frame);
      else resolve();
    }
    requestAnimationFrame(frame);
  });
}

function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

/* ════════════════════════════════════════════
   CURSOR CLASS  —  มี queue ของตัวเอง
════════════════════════════════════════════ */
class SwarmCursor {
  constructor(color, name, overlay) {
    this.color   = color;
    this.name    = name;
    this.x       = 0;
    this.y       = 0;
    this._queue  = [];
    this._running = false;

    this.el = document.createElement('div');
    this.el.className = 'swarm-cursor';
    this.el.innerHTML = `
      <svg width="22" height="22" viewBox="0 0 20 20">
        <path d="M3 1 L17 9 L10.5 10.5 L8.5 18 Z"
              fill="${color}" stroke="#000" stroke-width="0.8" stroke-opacity="0.4"/>
      </svg>
      <span class="swarm-cursor-label" style="background:${color}">${name}</span>
    `;
    this.el.style.position = 'absolute';
    this.el.style.pointerEvents = 'none';
    this.el.style.zIndex = '30';
    this.el.style.willChange = 'left, top';
    overlay.appendChild(this.el);
  }

  /* วาง cursor ที่ตำแหน่งเริ่มต้น (ขอบจอ) */
  placeAtEdge() {
    const W = window.innerWidth, H = window.innerHeight;
    const edge = Math.floor(Math.random() * 4);
    if (edge === 0) { this.x = Math.random()*W; this.y = -30; }
    else if (edge === 1) { this.x = W+30; this.y = Math.random()*H; }
    else if (edge === 2) { this.x = Math.random()*W; this.y = H+30; }
    else { this.x = -30; this.y = Math.random()*H; }
    this._setPos(this.x, this.y);
  }

  _setPos(x, y) {
    this.el.style.left = x + 'px';
    this.el.style.top  = y + 'px';
  }

  /* เพิ่ม task เข้า queue */
  enqueue(task) {
    this._queue.push(task);
    if (!this._running) this._drain();
  }

  async _drain() {
    this._running = true;
    while (this._queue.length) {
      const task = this._queue.shift();
      await this._run(task);
    }
    this._running = false;
  }

  /* เดินทางไปยัง (tx, ty) */
  async moveTo(tx, ty) {
    const sx = this.x, sy = this.y;
    // ระยะทาง → ปรับ duration ตามระยะ ให้ความเร็วคงที่
    const dist = Math.hypot(tx-sx, ty-sy);
    const dur  = Math.max(400, Math.min(T.moveSpeed, dist * 1.2));
    await animate(dur, (e) => {
      this.x = sx + (tx-sx)*e;
      this.y = sy + (ty-sy)*e;
      this._setPos(this.x, this.y);
    });
  }

  async _run(task) {
    // คำนวณ target ที่ cursor ต้องไปยืน
    let tx, ty;
    switch (task.type) {
      case 'box':    tx = task.x + 8;         ty = task.y + 8;         break;
      case 'circle': tx = task.cx - task.r;   ty = task.cy - task.r;   break;
      case 'text':   tx = task.x;             ty = task.y - 12;        break;
      case 'line':   tx = task.x1;            ty = task.y1 - 10;       break;
      case 'chip':   tx = task.x;             ty = task.y - 8;         break;
      default:       tx = task.x||0;          ty = task.y||0;
    }

    await this.moveTo(tx, ty);
    await wait(T.hoverPause);

    // เรียก draw method จาก canvas ref ที่ task พกมา
    await task.draw();

    await wait(80);
  }
}

/* ════════════════════════════════════════════
   CANVAS DRAWING HELPERS
════════════════════════════════════════════ */
class SwarmCanvas {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    // เก็บ drawn items เพื่อ redraw ไม่ทับกัน
    this._items = [];
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width  = window.innerWidth  * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.canvas.style.width  = window.innerWidth  + 'px';
    this.canvas.style.height = window.innerHeight + 'px';
    this.ctx = this.canvas.getContext('2d');
    this.ctx.scale(dpr, dpr);
  }

  /* วาด box ค่อยๆ ขยายจากซ้ายไปขวา */
  drawBox(color, x, y, w, h, label) {
    return animate(T.boxDraw, (e) => {
      const ctx = this.ctx;
      // วาด fill ทับตัวเอง
      ctx.clearRect(x-1, y-1, w+2, h+2);
      ctx.fillStyle = color + '14';
      ctx.fillRect(x, y, w*e, h);

      // dashed border ที่กำลังวาด
      ctx.strokeStyle = color + 'cc';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 3]);
      // top edge
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w*e, y); ctx.stroke();
      // right edge (ขึ้นอยู่กับ progress)
      if (e > 0.3) {
        ctx.beginPath(); ctx.moveTo(x+w*e, y); ctx.lineTo(x+w*e, y+h*(e-0.3)/0.7); ctx.stroke();
      }
      // bottom edge
      if (e > 0.6) {
        ctx.beginPath(); ctx.moveTo(x+w*e, y+h); ctx.lineTo(x + w*(1-e)*0.5, y+h); ctx.stroke();
      }
      // left edge
      if (e > 0.85) {
        ctx.beginPath(); ctx.moveTo(x, y+h); ctx.lineTo(x, y+h*(1-e)*8); ctx.stroke();
      }
      ctx.setLineDash([]);

      // label
      if (e > 0.65 && label) {
        ctx.font = 'bold 10px "Fira Code", monospace';
        ctx.fillStyle = color + 'bb';
        ctx.fillText(label, x + 7, y + 15);
      }
    });
  }

  /* วาด circle stroke ตามเข็ม */
  drawCircle(color, cx, cy, r) {
    return animate(T.circleDraw, (e) => {
      const ctx = this.ctx;
      // wipe area
      ctx.clearRect(cx-r-4, cy-r-4, (r+4)*2, (r+4)*2);
      // fill
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI*2);
      ctx.fillStyle = color + '0e';
      ctx.fill();
      // stroke arc
      ctx.beginPath();
      ctx.arc(cx, cy, r, -Math.PI/2, -Math.PI/2 + Math.PI*2*e);
      ctx.strokeStyle = color + 'dd';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
      // center cross
      if (e > 0.5) {
        ctx.strokeStyle = color + '55';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(cx-12, cy); ctx.lineTo(cx+12, cy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, cy-12); ctx.lineTo(cx, cy+12); ctx.stroke();
      }
    });
  }

  /* พิมพ์ข้อความทีละตัว */
  async drawText(color, x, y, text) {
    const ctx = this.ctx;
    ctx.font = '500 13px "Plus Jakarta Sans", sans-serif';
    for (let i = 0; i < text.length; i++) {
      ctx.fillStyle = color + 'ee';
      ctx.fillText(text[i], x + i * 8.5, y);
      await wait(T.typeSpeed);
    }
  }

  /* วาดเส้นยาวจากซ้ายไปขวา */
  drawLine(color, x1, y1, x2, y2) {
    return animate(T.lineDraw, (e) => {
      const ctx = this.ctx;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x1 + (x2-x1)*e, y1);
      ctx.strokeStyle = color + '99';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([]);
      ctx.stroke();
      // dot ที่ปลาย
      ctx.beginPath();
      ctx.arc(x1 + (x2-x1)*e, y1, 3, 0, Math.PI*2);
      ctx.fillStyle = color;
      ctx.fill();
    });
  }

  /* วาด chip (rounded rect + text) */
  async drawChip(color, x, y, text) {
    const ctx = this.ctx;
    ctx.font = '500 11px "Fira Code", monospace';
    const tw = ctx.measureText(text).width;
    const pad = 10, h = 26, r = 13;
    const w = tw + pad * 2;

    await animate(T.chipDraw, (e) => {
      ctx.clearRect(x-1, y-1, w+2, h+2);
      // rounded rect fill
      ctx.fillStyle = color + '1a';
      this._roundRect(ctx, x, y, w*e, h, r);
      ctx.fill();
      // border
      ctx.strokeStyle = color + 'aa';
      ctx.lineWidth = 1.2;
      this._roundRect(ctx, x, y, w*e, h, r);
      ctx.stroke();
    });

    // พิมพ์ข้อความหลัง chip วาดเสร็จ
    ctx.fillStyle = color;
    ctx.fillText(text, x + pad, y + 17);
  }

  _roundRect(ctx, x, y, w, h, r) {
    r = Math.min(r, w/2, h/2);
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+w-r, y);
    ctx.quadraticCurveTo(x+w, y,   x+w,   y+r);
    ctx.lineTo(x+w, y+h-r);
    ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    ctx.lineTo(x+r, y+h);
    ctx.quadraticCurveTo(x, y+h,   x,     y+h-r);
    ctx.lineTo(x, y+r);
    ctx.quadraticCurveTo(x, y,     x+r,   y);
    ctx.closePath();
  }
}

/* ════════════════════════════════════════════
   INTRO ORCHESTRATOR
════════════════════════════════════════════ */
class SwarmIntro {
  constructor() {
    this.overlay = null;
    this.sc      = null;   // SwarmCanvas
    this.agents  = [];     // SwarmCursor[]
    this.done    = false;
  }

  mount() {
    document.body.style.overflow = 'hidden';

    this.overlay = document.createElement('div');
    this.overlay.id = 'swarm-overlay';
    this.overlay.innerHTML = `
      <canvas id="swarm-canvas"></canvas>
      <div id="swarm-hint">
        <span class="swarm-dot"></span>
        <span>agents are building your portfolio…</span>
      </div>
      <button id="swarm-skip">skip ↗</button>
    `;
    document.body.appendChild(this.overlay);

    // canvas
    const canvas = document.getElementById('swarm-canvas');
    this.sc = new SwarmCanvas(canvas);
    this.sc.resize();
    window.addEventListener('resize', () => this.sc.resize());

    document.getElementById('swarm-skip')
      .addEventListener('click', () => this.finish(true));
  }

  /* ── สร้าง agent และสั่ง task ── */
  async run() {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const isMobile = W < 768;
    const sc = this.sc;

    /* Spawn 4 cursors ทีละตัว */
    const agentDefs = [
      { color: SWARM_COLORS[0], name: 'aria'  },
      { color: SWARM_COLORS[1], name: 'bob'   },
      { color: SWARM_COLORS[2], name: 'cleo'  },
      { color: SWARM_COLORS[3], name: 'dev'   },
    ];

    for (const def of agentDefs) {
      const agent = new SwarmCursor(def.color, def.name, this.overlay);
      agent.placeAtEdge();
      this.agents.push(agent);
      await wait(T.spawnGap);
    }

    /* ── กำหนด task แต่ละชิ้น และมอบให้ agent ไหน ──
       agent index:  0=aria  1=bob  2=cleo  3=dev
       แบ่งงานไม่ซ้อนกัน  ทำงานพร้อมกันคนละชิ้น
    */
    const tasks = [
      // ── ARIA : วาด nav + heading ──────────────────
      { agent:0, type:'box',
        x:0, y:0, w:W, h:60, label:'navbar',
        draw: () => sc.drawBox(SWARM_COLORS[0], 0, 0, W, 60, 'navbar') },

      { agent:0, type:'text',
        x:28, y:38,
        draw: () => sc.drawText(SWARM_COLORS[0], 28, 38, 'EterOverseer') },

      { agent:0, type:'box',
        x: isMobile?W*0.06:W*0.06, y: isMobile?260:H*0.26,
        w: isMobile?W*0.88:W*0.46, h: isMobile?62:78,
        label:'hero title',
        draw: () => sc.drawBox(SWARM_COLORS[3], isMobile?W*0.06:W*0.06, isMobile?260:H*0.26, isMobile?W*0.88:W*0.46, isMobile?62:78, 'hero title') },

      { agent:0, type:'box',
        x: isMobile?W*0.06:W*0.06, y: isMobile?342:H*0.43,
        w:230, h:34, label:'status',
        draw: () => sc.drawBox(SWARM_COLORS[4], isMobile?W*0.06:W*0.06, isMobile?342:H*0.43, 230, 34, 'status') },

      // ── BOB : วาด avatar + skill chips ───────────
      { agent:1, type:'circle',
        cx: isMobile?W/2:W*0.72, cy: isMobile?170:H*0.47, r: isMobile?72:118,
        draw: () => sc.drawCircle(SWARM_COLORS[1], isMobile?W/2:W*0.72, isMobile?170:H*0.47, isMobile?72:118) },

      ...['Linux·Arch','Arduino','n8n','IoT','GitHub'].map((s, i) => ({
        agent: 1,
        type: 'chip',
        x: isMobile ? W*0.06 + (i%3)*106 : W*0.56 + (i%3)*112,
        y: isMobile ? 540 + Math.floor(i/3)*40 : H*0.65 + Math.floor(i/3)*42,
        draw: () => sc.drawChip(
          SWARM_COLORS[(i+2)%SWARM_COLORS.length],
          isMobile ? W*0.06 + (i%3)*106 : W*0.56 + (i%3)*112,
          isMobile ? 540 + Math.floor(i/3)*40 : H*0.65 + Math.floor(i/3)*42,
          s
        ),
      })),

      // ── CLEO : วาด description lines ─────────────
      ...[0,1,2].map(i => ({
        agent: 2,
        type: 'line',
        x1: isMobile?W*0.06:W*0.06,
        y1: (isMobile?400:H*0.54) + i*26,
        x2: (isMobile?W*0.94:W*0.06+W*0.44) - (i===2?W*0.08:0),
        draw: () => sc.drawLine(
          SWARM_COLORS[5],
          isMobile?W*0.06:W*0.06,
          (isMobile?400:H*0.54) + i*26,
          (isMobile?W*0.94:W*0.06+W*0.44) - (i===2?W*0.08:0),
          (isMobile?400:H*0.54) + i*26,
        ),
      })),

      // ── DEV : วาด contact buttons ─────────────────
      ...['GH','FB','LINE','TEL','✉'].map((lbl, i) => ({
        agent: 3,
        type: 'box',
        x: (isMobile?W*0.06:W*0.06) + i*98,
        y: isMobile?480:H*0.69,
        w:88, h:38,
        draw: () => sc.drawBox(
          SWARM_COLORS[i%SWARM_COLORS.length],
          (isMobile?W*0.06:W*0.06) + i*98,
          isMobile?480:H*0.69,
          88, 38, lbl
        ),
      })),

      // ── ARIA (ต่อ) : nav text ──────────────────────
      { agent:0, type:'text',
        x: W-220, y:38,
        draw: () => sc.drawText(SWARM_COLORS[2], W-220, 38, 'Home  Works  About') },

      // ── BOB (ต่อ) : bottom bar ─────────────────────
      { agent:1, type:'box',
        x:0, y:H-5, w:W, h:5, label:'',
        draw: () => sc.drawBox(SWARM_COLORS[6], 0, H-5, W, 5, '') },
    ];

    /* ── แจก task ให้ agent ตาม .agent index ──
       Agent แต่ละตัวทำ task ของตัวเองเป็น queue ต่อเนื่อง
       แต่ agent ต่างตัวทำงานพร้อมกันได้  → ดูเหมือนหลายคนทำงานพร้อมกัน
    */
    const perAgent = this.agents.map(() => []);
    tasks.forEach(task => perAgent[task.agent].push(task));

    // สั่ง agent แต่ละตัวเริ่มต้น queue ของตัวเอง
    const agentDone = this.agents.map((agent, ai) =>
      this._runAgentQueue(agent, perAgent[ai])
    );

    await Promise.all(agentDone);
    await wait(T.holdEnd);
    this.finish(false);
  }

  async _runAgentQueue(agent, tasks) {
    for (const task of tasks) {
      await agent.moveTo(
        this._targetX(task),
        this._targetY(task)
      );
      await wait(T.hoverPause);
      await task.draw();
      await wait(60);
    }
  }

  _targetX(task) {
    switch (task.type) {
      case 'box':    return task.x + 8;
      case 'circle': return task.cx - task.r - 20;
      case 'text':   return task.x;
      case 'line':   return task.x1;
      case 'chip':   return task.x;
      default:       return task.x || 0;
    }
  }
  _targetY(task) {
    switch (task.type) {
      case 'box':    return task.y + 8;
      case 'circle': return task.cy - task.r - 10;
      case 'text':   return (task.y || 0) - 12;
      case 'line':   return task.y1 - 12;
      case 'chip':   return task.y - 10;
      default:       return task.y || 0;
    }
  }

  finish(instant) {
    if (this.done) return;
    this.done = true;

    const overlay = this.overlay;
    const dur = instant ? 0.18 : T.revealFade/1000;
    overlay.style.transition = `opacity ${dur}s cubic-bezier(.4,0,.2,1)`;
    overlay.style.opacity = '0';

    setTimeout(() => {
      overlay.remove();
      document.body.style.overflow = '';
      document.querySelectorAll('.reveal').forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight)
          el.classList.add('visible');
      });
      SwarmScroll.init();
    }, (instant ? 0.18 : T.revealFade/1000) * 1000 + 50);
  }
}

/* ════════════════════════════════════════════
   SCROLL REVEAL  —  cursor ลากขอบ element
════════════════════════════════════════════ */
const SwarmScroll = {
  pool: [],

  init() {
    for (let i = 0; i < 3; i++) {
      const el = document.createElement('div');
      el.className = 'swarm-scroll-cursor';
      el.style.cssText = 'position:fixed;pointer-events:none;z-index:5000;opacity:0;transition:opacity 0.25s;';
      el.innerHTML = `<svg width="16" height="16" viewBox="0 0 20 20">
        <path d="M3 1 L17 9 L10.5 10.5 L8.5 18 Z"
              fill="${SWARM_COLORS[i*2]}" stroke="#000" stroke-width="0.6" stroke-opacity="0.3"/>
      </svg>`;
      document.body.appendChild(el);
      this.pool.push({ el, color: SWARM_COLORS[i*2], busy: false });
    }

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          this._sweep(e.target);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.25 });

    document.querySelectorAll(
      '.work-card,.stat-card,.fs-card,.about-section,.info-item,.profile-card,.section-title,.section-eyebrow'
    ).forEach(el => obs.observe(el));
  },

  _sweep(el) {
    const c = this.pool.find(p => !p.busy);
    if (!c) return;
    c.busy = true;

    const rect = el.getBoundingClientRect();
    const startX = rect.left;
    const endX   = rect.right - 16;
    const topY   = rect.top;

    // เริ่มจากซ้ายบน
    c.el.style.left    = startX + 'px';
    c.el.style.top     = topY   + 'px';
    c.el.style.opacity = '1';

    // glow border บน element
    el.style.transition = 'outline 0.3s, box-shadow 0.3s';
    el.style.outline    = `1.5px solid ${c.color}66`;
    el.style.boxShadow  = `0 0 0 3px ${c.color}18, 0 8px 28px ${c.color}28`;

    // sweep cursor ลากยาวตามขอบบน
    const duration = Math.max(500, (endX - startX) * 0.9);
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const ex = ease(p);
      c.el.style.left = (startX + (endX - startX) * ex) + 'px';
      if (p < 1) { requestAnimationFrame(tick); return; }
      // เสร็จ → fade out + เอา glow ออก
      setTimeout(() => {
        c.el.style.opacity = '0';
        el.style.outline   = '';
        el.style.boxShadow = '';
        c.busy = false;
      }, 350);
    };
    requestAnimationFrame(tick);
  },
};

/* ════════════════════════════════════════════
   START
════════════════════════════════════════════ */
(function () {
  const intro = new SwarmIntro();
  intro.mount();
  intro.run();
}());
