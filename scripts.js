/* ══════════════════════════════════════════
   STATE
══════════════════════════════════════════ */
let currentLang = 'en';
let currentPage = 'home';
let workData = [];

/* ══════════════════════════════════════════
   TYPED TEXT
══════════════════════════════════════════ */
const words = ['IOT Developer', 'Vibe Coder', 'Creator'];
let wi = 0, ci = 0, deleting = false;
function typeLoop() {
  const el = document.getElementById('typed-text');
  const word = words[wi];
  if (!deleting) {
    el.textContent = word.substring(0, ci + 1);
    ci++;
    if (ci === word.length) { deleting = true; setTimeout(typeLoop, 1600); return; }
  } else {
    el.textContent = word.substring(0, ci - 1);
    ci--;
    if (ci === 0) { deleting = false; wi = (wi + 1) % words.length; }
  }
  setTimeout(typeLoop, deleting ? 55 : 100);
}
typeLoop();

/* ══════════════════════════════════════════
   WORKS DATA & COUNTER
══════════════════════════════════════════ */
workData = [
  {
    tag: 'IT Support',
    title_en: 'Mahakit Rubber Co., Ltd',
    title_th: 'บริษัท มหากิจรับเบอร์',
    sub_en: 'IT Support',
    sub_th: 'IT Support',
    desc_en: 'Providing IT support and maintaining computer systems, network infrastructure, and related equipment within the organization.',
    desc_th: 'ดูแลระบบคอมพิวเตอร์ เครือข่าย และอุปกรณ์ไอทีภายในองค์กร',
    start: new Date('2025-07-14'),
    end: null,
    ongoing: true,
    salary: null,
    internship: false,
    skills: ['IT Support'],
    url: 'https://mahakitrubberbands.com/'
  },
  {
    tag: 'IT Support / Hardware',
    title_en: 'Sun General',
    title_th: 'ซัน เจนเนอรัล',
    sub_en: 'IT Support / IT Assistant',
    sub_th: 'IT Support / IT Assistant',
    desc_en: 'Responsible for computer maintenance (Fix Condition), printer and scanner management',
    desc_th: 'รับผิดชอบซ่อมบำรุงคอมพิวเตอร์ ดูแลเครื่องพิมพ์และเครื่องสแกน',
    start: new Date('2022-03-01'),
    end: new Date('2022-06-30'),
    ongoing: false,
    salary: '14,000 ฿',
    skills: ['IT Support', 'Computer Repair', 'Etc...'],
    url: 'https://www.sungenn.com/'
  },
  {
    tag: 'Electrical / IoT Install',
    title_en: 'I-Tech Engineering Group',
    title_th: 'ไอเทค เอ็นจิเนียริ่ง กรุ๊ป',
    sub_en: 'Intern — Field Technician',
    sub_th: 'นักศึกษาฝึกงาน — ช่างภาคสนาม',
    desc_en: 'Field installation work covering automated gates, solar cell systems, swimming pool systems, and Access Control systems.',
    desc_th: 'ติดตั้งประตูรั้วอัตโนมัติ, โซล่าเซลล์, ระบบสระน้ำ และระบบ Access Control',
    start: new Date('2023-03-01'),
    end: new Date('2024-02-29'),
    ongoing: false,
    salary: null,
    internship: true,
    skills: ['General Technician'],
    url: 'https://www.facebook.com/autometicgate/?locale=th_TH'
  },
  {
    tag: 'Energy / Industrial IoT',
    title_en: 'Egco-Cogeneration Co., Ltd',
    title_th: 'เอ็กโก-โคเจนเนอเรชั่น จำกัด',
    sub_en: 'Vocational Trainee — Power Plant',
    sub_th: 'นักศึกษาฝึกอาชีพ — โรงไฟฟ้า',
    desc_en: 'On-site training inside the power plant alongside supervisors. Studied production systems, industrial sensor types, and factory-floor operations.',
    desc_th: 'ฝึกงานในโรงไฟฟ้า ศึกษาระบบการผลิตและ Sensor ต่างๆ ในโรงงานร่วมกับหัวหน้างาน',
    start: new Date('2020-05-01'),
    end: new Date('2021-09-30'),
    ongoing: false,
    salary: null,
    internship: true,
    skills: ['Electrical Technician'],
    url: 'https://www.egco.com/en/home'
  }
];

function daysAgo(start, end) {
  const now = end || new Date();
  const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  const years = Math.floor(diff / 365);
  const months = Math.floor((diff % 365) / 30);
  const days = diff % 30;
  let parts = [];
  if (years) parts.push(`${years}y`);
  if (months) parts.push(`${months}mo`);
  if (days || !parts.length) parts.push(`${days}d`);
  return parts.join(' ');
}

function formatDate(d) {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function renderWorks() {
  const grid = document.getElementById('works-grid');
  grid.innerHTML = '';
  workData.forEach((w, i) => {
    const isEn = currentLang === 'en';
    const title = isEn ? w.title_en : w.title_th;
    const sub   = isEn ? w.sub_en   : w.sub_th;
    const desc  = isEn ? w.desc_en  : w.desc_th;
    const endLabel = w.ongoing ? (isEn ? 'Present' : 'ปัจจุบัน') : formatDate(w.end);
    const duration = daysAgo(w.start, w.ongoing ? null : w.end);

    const extBtn = w.url
      ? `<button class="work-ext-btn" onclick="openCompany(${i})" title="Visit website">&#x2197;</button>`
      : '';

    const titleCls = w.url ? 'work-title work-title-link' : 'work-title';
    const titleClick = w.url ? `onclick="openCompany(${i})"` : '';

    const durationBadge = w.ongoing
      ? `<div class="counter-badge">&#x23F1; <span class="counter-num">${duration}</span> ${isEn?'active':'ดำเนินการ'}</div>`
      : `<div class="counter-badge">&#x2713; <span class="counter-num">${duration}</span></div>`;

    grid.innerHTML += `
    <div class="work-card fade-in" style="animation-delay:${i * 0.1}s">
      <div class="work-card-header">
        <div class="work-tag">${w.tag}</div>
        ${extBtn}
      </div>
      <div class="${titleCls}" ${titleClick}>${title}</div>
      <div class="work-sub">${sub}</div>
      <div class="work-desc">${desc}</div>
      <div class="work-chips-row">
        ${w.skills.map(s=>`<span class="chip">${s}</span>`).join('')}
        ${w.internship ? `<span class="chip chip-intern">&#x2736; Intern</span>` : ''}
      </div>
      <div class="work-meta">
        <div class="work-date-row">
          <span class="dot">&#x25CF;</span>
          ${formatDate(w.start)} &rarr; ${endLabel}
        </div>
        ${w.salary ? `<div class="work-date-row"><span class="dot">&#x25CF;</span>${w.salary}</div>` : ''}
        ${durationBadge}
      </div>
    </div>`;
  });
}

/* Company warp — reuses the contact overlay mechanic */
function openCompany(idx) {
  const w = workData[idx];
  if (!w || !w.url) return;

  const isEn = currentLang === 'en';
  const name = isEn ? w.title_en : w.title_th;
  const color = '#38b6ff';

  const logoEl  = document.getElementById('co-logo');
  const nameEl  = document.getElementById('co-name');
  const overlay = document.getElementById('contact-overlay');

  logoEl.innerHTML = '🏢';
  logoEl.style.color = color;
  logoEl.style.borderColor = color + '44';
  logoEl.style.boxShadow = `0 8px 40px ${color}33`;
  nameEl.textContent = name;
  nameEl.style.color = color;
  document.getElementById('co-detail').textContent = w.url.replace(/^https?:\/\//, '');

  const waitEl = overlay.querySelector('.co-waiting');
  waitEl.innerHTML = `Opening <strong>${name}</strong> in <span id="co-countdown" style="font-size:1.4rem;font-weight:800;color:${color};min-width:1.2ch;display:inline-block;text-align:center;">3</span><span class="dots"><span></span><span></span><span></span></span>`;

  history.pushState({ contact: 'company' }, '', '#contact');
  overlay.classList.add('open');

  let count = 3;
  clearInterval(_countdownTimer);
  _countdownTimer = setInterval(() => {
    count--;
    const cdEl = document.getElementById('co-countdown');
    if (cdEl) cdEl.textContent = count;
    if (count <= 0) {
      clearInterval(_countdownTimer);
      window.open(w.url, '_blank');
      setTimeout(closeContactOverlay, 600);
    }
  }, 1000);

  document.addEventListener('keydown', _escClose);
}


function updateWorkStatus() {
  const ongoing = workData.filter(w => w.ongoing);
  const el = document.getElementById('work-status');
  const badge = el ? el.closest('.status-badge') : null;
  if (ongoing.length) {
    const isEn = currentLang === 'en';
    const names = ongoing.map(w => isEn ? w.title_en : w.title_th).join(', ');
    el.textContent = (isEn ? 'Working on: ' : 'กำลังทำ: ') + names;
    if (badge) {
      badge.style.cursor = 'pointer';
      badge.title = 'Visit website';
      badge.onclick = () => { const idx = workData.findIndex(w => w.ongoing); if (idx !== -1) openCompany(idx); };
    }
  } else {
    el.textContent = currentLang === 'en' ? 'Open to new projects' : 'พร้อมรับงานใหม่';
    if (badge) { badge.style.cursor = 'default'; badge.onclick = null; badge.title = ''; }
  }
}

/* ══════════════════════════════════════════
   FREE SOURCE DATA
══════════════════════════════════════════ */
const freeSourceItems = [
  { icon:'⚡', title:'n8n Workflow Templates', desc:'Auto-trigger workflows for home automation and notifications. Drop-in JSON templates.', label:'Download Soon', coming:true },
  { icon:'🔌', title:'Arduino Sensor Library', desc:'Custom wrappers for common IoT sensors (DHT, BMP, PIR). Clean, readable code.', label:'Browse', coming:false },
  { icon:'🐧', title:'Arch Linux Dotfiles', desc:'Personal i3/hyprland config, aliases, and shell scripts for a productive dev environment.', label:'GitHub', coming:false },
  { icon:'🗄', title:'MariaDB Snippets', desc:'Useful SQL snippets for home server setups, user management, and backup scripts.', label:'Download Soon', coming:true },
  { icon:'🏠', title:'CasaOS App Configs', desc:'Docker-compose templates for self-hosted apps on CasaOS. Tested and documented.', label:'Download Soon', coming:true },
  { icon:'📡', title:'MQTT Topic Schema', desc:'Standard topic naming conventions and payload schemas for IoT home automation.', label:'View Docs', coming:false },
];

function renderFreeSource() {
  const grid = document.getElementById('fs-grid');
  grid.innerHTML = '';
  freeSourceItems.forEach((item, i) => {
    grid.innerHTML += `
    <div class="fs-card fade-in" style="animation-delay:${i*0.08}s">
      <div class="fs-icon">${item.icon}</div>
      <div class="fs-title">${item.title}</div>
      <div class="fs-desc">${item.desc}</div>
      <button class="fs-btn">
        ${item.label}
        ${item.coming ? '<span class="coming-badge">Soon</span>' : '▸'}
      </button>
    </div>`;
  });
}

/* ══════════════════════════════════════════
   NAVIGATION
══════════════════════════════════════════ */
function navigate(page) {
  if (page === currentPage) return;

  const overlay = document.getElementById('page-transition');
  overlay.classList.add('active');

  setTimeout(() => {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-links button').forEach(b => b.classList.remove('active'));

    const target = document.getElementById(page === 'freesource' ? 'freesource' : page);
    if (target) target.classList.add('active');

    const navBtn = document.getElementById('nav-' + page);
    if (navBtn) navBtn.classList.add('active');

    currentPage = page;
    window.scrollTo(0, 0);

    if (page === 'works') renderWorks();
    if (page === 'freesource') renderFreeSource();
    updateWorkStatus();

    overlay.classList.remove('active');
  }, 420);
}

/* ══════════════════════════════════════════
   LANGUAGE
══════════════════════════════════════════ */
const translations = {
  en: {
    'home-desc': 'IT Support & IoT developer from Rayong. Electronics grad (GPA 3.81) who codes microcontrollers, builds automation workflows, and fixes computers. 4× IoT competition finalist — always learning, always adapting.',
    'contact-label': 'Contact & Socials',
    'works-eyebrow': 'Work History',
    'works-title': 'Works',
    'about-eyebrow': 'Who I Am',
    'about-title': 'About Me',
    'about-info-label': 'Personal Info',
    'about-tools-label': 'Skills & Tech Stack',
    'about-bio-label': 'Bio',
    'about-bio': 'Electronics grad (GPA 3.81) from วิทยาลัยเทคนิคบ้านค่าย with a strong lean toward Programming & IT. Experienced in IT Support, microcontroller coding (C, Python, MicroPython), PLC data extraction via RS-232, and factory sensor systems. Competed in 4 IoT competitions including Hackatron 2023 & Future Innovation 2024, plus 12 Engineering contests since primary school. Always learning, always adapting. ⚡',
    'key-name': 'Full Name (TH)',
    'key-dob': 'Date of Birth',
    'val-dob': '10 Oct 2003',
    'key-edu': 'Education',
    'val-edu': 'ปวส. Electronics · GPA 3.81',
    'key-school': 'Institute',
    'val-school': 'วิทยาลัยเทคนิคบ้านค่าย',
    'key-focus': 'Focus',
    'val-focus': 'IT Support · IoT · Programming',
    'key-os': 'Preferred OS',
    'key-avail': 'Available',
    'val-avail': 'Within 7 days',
    'free-src-label': 'Free Source',
    'fs-title': 'Free Source',
    'fs-desc': 'Tools, scripts & assets — more coming soon when I upload them!',
  },
  th: {
    'home-desc': 'IT Support & นักพัฒนา IoT จากระยอง จบ ปวส. อิเล็กทรอนิกส์ เกรด 3.81 เขียนโปรแกรม Microcontroller, สร้าง Automation และแก้ปัญหาคอมพิวเตอร์ เข้าแข่ง IoT 4 ครั้ง — พร้อมเรียนรู้ พร้อมปรับตัวเสมอ',
    'contact-label': 'ติดต่อ & โซเชียล',
    'works-eyebrow': 'ประวัติการทำงาน',
    'works-title': 'ประวัติการทำงาน',
    'about-eyebrow': 'ตัวตนของฉัน',
    'about-title': 'เกี่ยวกับฉัน',
    'about-info-label': 'ข้อมูลส่วนตัว',
    'about-tools-label': 'ทักษะและเครื่องมือ',
    'about-bio-label': 'ประวัติ',
    'about-bio': 'จบ ปวส. อิเล็กทรอนิกส์ (เกรด 3.81) จากวิทยาลัยเทคนิคบ้านค่าย ถนัดด้าน Programming & IT เขียนโปรแกรม Microcontroller ด้วย C, Python, MicroPython ดึงข้อมูล PLC ผ่าน RS-232 และมีความรู้ด้าน Factory Sensor เคยแข่ง IoT 4 ครั้ง รวมถึง Hackatron 2023 และ Future Innovation 2024 และแข่ง Eng 12 ครั้งตั้งแต่ประถม พร้อมเรียนรู้และปรับตัวเสมอ ⚡',
    'key-name': 'ชื่อ-นามสกุล',
    'key-dob': 'วันเกิด',
    'val-dob': '10 ตุลาคม 2546',
    'key-edu': 'การศึกษา',
    'val-edu': 'ปวส. อิเล็กทรอนิกส์ · เกรด 3.81',
    'key-school': 'สถานศึกษา',
    'val-school': 'วิทยาลัยเทคนิคบ้านค่าย',
    'key-focus': 'ความถนัด',
    'val-focus': 'IT Support · IoT · Programming',
    'key-os': 'ระบบปฏิบัติการโปรด',
    'key-avail': 'เริ่มงานได้',
    'val-avail': 'ภายใน 7 วัน',
    'free-src-label': 'Free Source',
    'fs-title': 'แหล่งข้อมูลฟรี',
    'fs-desc': 'เครื่องมือ, สคริปต์ & ไฟล์ต่างๆ — จะเพิ่มขึ้นเรื่อยๆ!',
  }
};

function setLang(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;

  document.getElementById('lang-en').classList.toggle('active', lang === 'en');
  document.getElementById('lang-th').classList.toggle('active', lang === 'th');

  const t = translations[lang];
  Object.entries(t).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  });

  // nav buttons (including freesource)
  document.querySelectorAll('.nav-links button').forEach(b => {
    b.textContent = lang === 'th' ? b.dataset.th : b.dataset.en;
  });

  if (currentPage === 'works') renderWorks();
  updateWorkStatus();
}

/* ══════════════════════════════════════════
   THEME
══════════════════════════════════════════ */
let _userOverrideTheme = false; // true = user manually picked, skip auto

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.getElementById('theme-btn').textContent = theme === 'dark' ? '☾ Dark' : '☀ Light';
}

function autoThemeByTime() {
  if (_userOverrideTheme) return;
  const hour = new Date().getHours();
  // 6:00 – 17:59 = light, else dark
  applyTheme(hour >= 6 && hour < 18 ? 'light' : 'dark');
}

function toggleTheme() {
  _userOverrideTheme = true;
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  applyTheme(isDark ? 'light' : 'dark');
}

// Run once on load, then check every minute
autoThemeByTime();
setInterval(autoThemeByTime, 60 * 1000);

/* ══════════════════════════════════════════
   CONTACT OVERLAY
══════════════════════════════════════════ */
const contactData = {
  github: {
    logo: `<svg width="52" height="52" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>`,
    name: 'GitHub', label: 'github', color: '#333', detail: 'github.com/EterOverseer',
    url: 'https://github.com/EterOverseer'
  },
  facebook: {
    logo: `<svg width="52" height="52" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>`,
    name: 'Facebook', label: 'facebook', color: '#1877f2', detail: 'facebook.com/ferm.dra…',
    url: 'https://www.facebook.com/ferm.dra.kxn.si.ri.khxn.ne.khchan'
  },
  line: {
    logo: `<svg width="52" height="52" viewBox="0 0 24 24" fill="currentColor"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg>`,
    name: 'Line', label: 'line', color: '#00b900', detail: 'ID: controllegendleader',
    url: 'https://line.me/ti/p/~controllegendleader'
  },
  tel: {
    logo: `<svg width="52" height="52" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>`,
    name: 'Tel', label: 'tel', color: '#22c55e', detail: '066-132-6968',
    url: 'tel:0661326968'
  },
  email: {
    logo: `<svg width="52" height="52" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/></svg>`,
    name: 'Email', label: 'email', color: '#ea4335', detail: 'fz.eteroverseer@gmail.com',
    url: 'mailto:fz.eteroverseer@gmail.com'
  }
};

let _countdownTimer = null;

function openContact(platform) {
  const data = contactData[platform];
  if (!data) return;

  const logoEl   = document.getElementById('co-logo');
  const nameEl   = document.getElementById('co-name');
  const labelEl  = document.getElementById('co-label');
  const overlay  = document.getElementById('contact-overlay');
  const waitEl   = overlay.querySelector('.co-waiting');

  // Set content
  logoEl.innerHTML = data.logo;
  logoEl.style.color = data.color;
  logoEl.style.borderColor = data.color + '44';
  logoEl.style.boxShadow = `0 8px 40px ${data.color}33`;
  nameEl.textContent = data.name;
  nameEl.style.color = data.color;
  labelEl.textContent = data.label;
  document.getElementById('co-detail').textContent = data.detail || '';

  // Reset countdown UI
  waitEl.innerHTML = `Opening <strong id="co-platform-word">${data.name}</strong> in <span id="co-countdown" style="font-size:1.4rem;font-weight:800;color:${data.color};min-width:1.2ch;display:inline-block;text-align:center;">3</span><span class="dots"><span></span><span></span><span></span></span>`;

  // Push a history state so browser back button works
  history.pushState({ contact: platform }, '', '#contact');

  // Trigger sweep open
  overlay.classList.add('open');

  // Countdown 3 → 2 → 1 → open
  let count = 3;
  clearInterval(_countdownTimer);
  _countdownTimer = setInterval(() => {
    count--;
    const cdEl = document.getElementById('co-countdown');
    if (cdEl) cdEl.textContent = count;
    if (count <= 0) {
      clearInterval(_countdownTimer);
      if (data.url) window.open(data.url, '_blank');
      // Auto-close overlay after redirect
      setTimeout(closeContactOverlay, 600);
    }
  }, 1000);

  // Keyboard close
  document.addEventListener('keydown', _escClose);
}

function closeContactOverlay() {
  clearInterval(_countdownTimer);
  document.getElementById('contact-overlay').classList.remove('open');
  document.removeEventListener('keydown', _escClose);
  // Clean up history state if still on #contact
  if (location.hash === '#contact') history.back();
}

function _escClose(e) {
  if (e.key === 'Escape') closeContactOverlay();
}

// Browser back button → close overlay and return to home
window.addEventListener('popstate', (e) => {
  const overlay = document.getElementById('contact-overlay');
  if (overlay && overlay.classList.contains('open')) {
    clearInterval(_countdownTimer);
    overlay.classList.remove('open');
    document.removeEventListener('keydown', _escClose);
    navigate('home');
  }
});

/* ══════════════════════════════════════════
   INIT
══════════════════════════════════════════ */
updateWorkStatus();