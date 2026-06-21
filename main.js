/* ============================================================
   THE TREEHOUSE LOUNGE — shared site logic
   ------------------------------------------------------------
   EDIT ME: everything live-feeling on the site (member count,
   next event, occupancy forecast) reads from TREEHOUSE_DATA below.
   Replace this block with a real feed — a GHL custom values pull,
   a Supabase table, or a small Netlify Function — and every page
   that reads from it updates automatically. Nothing below this
   config block needs to change when you wire up a real backend.
   ============================================================ */

const TREEHOUSE_DATA = {
  membersInLounge: 37,
  eventsThisMonth: 12,
  nextEvent: {
    name: "Glow Yoga & Sound Bath",
    // ISO date — set to the real next event start time
    start: new Date(Date.now() + 1000 * 60 * 60 * 2 + 1000 * 60 * 14),
    host: "led by Maren K."
  },
  tonight: [
    { time: "2:00 PM", title: "Open Lounge — Games & Couches" },
    { time: "6:00 PM", title: "Glow Yoga & Sound Bath" },
    { time: "8:30 PM", title: "DAB Bar: PuffPuffPass w/ Cloud9 Extracts" },
    { time: "10:00 PM", title: "Open Mic + Vinyl Night" }
  ],
  promo: "New members: your first Day Pass includes a free rental from the rosin press bar.",
  occupancy: {
    Fri: [["2–5pm","light"],["5–8pm","moderate"],["8pm–12am","busy"]],
    Sat: [["2–5pm","moderate"],["5–8pm","busy"],["8pm–12am","busy"]],
    Sun: [["2–5pm","light"],["5–8pm","moderate"]]
  },
  cities: [
    { name: "Nixa", pct: 100 },
    { name: "Springfield", pct: 86 },
    { name: "Ozark", pct: 54 },
    { name: "Branson", pct: 38 },
    { name: "Republic", pct: 31 },
    { name: "Rogersville", pct: 24 }
  ]
};

/* ---------- mobile nav ---------- */
function initNav(){
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if(!toggle || !links) return;
  toggle.addEventListener('click', () => {
    links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', links.classList.contains('open'));
  });
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));
}

/* ---------- countdown ---------- */
function initCountdown(){
  const el = document.querySelector('[data-countdown]');
  if(!el) return;
  const target = TREEHOUSE_DATA.nextEvent.start;
  const nums = {
    h: el.querySelector('[data-cd-h]'),
    m: el.querySelector('[data-cd-m]'),
    s: el.querySelector('[data-cd-s]')
  };
  function tick(){
    const diff = Math.max(0, target - new Date());
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    if(nums.h) nums.h.textContent = String(h).padStart(2,'0');
    if(nums.m) nums.m.textContent = String(m).padStart(2,'0');
    if(nums.s) nums.s.textContent = String(s).padStart(2,'0');
  }
  tick();
  setInterval(tick, 1000);
}

/* ---------- live-feeling ticker numbers ---------- */
function initTicker(){
  const memberEl = document.querySelector('[data-live-members]');
  const eventsEl = document.querySelector('[data-live-events]');
  if(memberEl) memberEl.textContent = TREEHOUSE_DATA.membersInLounge;
  if(eventsEl) eventsEl.textContent = TREEHOUSE_DATA.eventsThisMonth;
  const nameEl = document.querySelector('[data-next-event-name]');
  if(nameEl) nameEl.textContent = TREEHOUSE_DATA.nextEvent.name;

  // gentle simulated fluctuation so the homepage feels alive on long visits
  if(memberEl){
    setInterval(() => {
      const drift = Math.random() > 0.5 ? 1 : -1;
      let current = parseInt(memberEl.textContent, 10);
      current = Math.max(22, Math.min(54, current + drift));
      memberEl.textContent = current;
    }, 9000);
  }
}

/* ---------- scroll reveal ---------- */
function initReveal(){
  const items = document.querySelectorAll('[data-reveal]');
  if(!items.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); obs.unobserve(e.target); } });
  }, { threshold: .15 });
  items.forEach(i => obs.observe(i));
}

/* ---------- string lights divider (renders the signature SVG) ---------- */
function renderStringLights(container, bulbCount = 14){
  if(!container) return;
  const w = container.clientWidth || 1180;
  const h = 64;
  let bulbs = '';
  for(let i=0;i<bulbCount;i++){
    const x = (w/(bulbCount-1)) * i;
    const sag = Math.sin((i/(bulbCount-1)) * Math.PI) * 26;
    const color = i % 3 === 0 ? '#f014c4' : '#a9ef41';
    bulbs += `<circle class="bulb" cx="${x}" cy="${22+sag}" r="4.2" fill="${color}"/>`;
  }
  let path = `M0,8 `;
  const segs = 24;
  for(let i=1;i<=segs;i++){
    const x = (w/segs)*i;
    const t = i/segs;
    const sag = Math.sin(t * Math.PI) * 26;
    path += `L${x},${8+sag} `;
  }
  container.innerHTML = `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
    <path d="${path}" fill="none" stroke="rgba(244,241,232,.18)" stroke-width="1.5"/>
    ${bulbs}
  </svg>`;
}
function initStringLights(){
  document.querySelectorAll('.string-lights').forEach(el => {
    renderStringLights(el);
    window.addEventListener('resize', () => renderStringLights(el));
  });
}

/* ---------- footer year ---------- */
function initYear(){
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
}

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initCountdown();
  initTicker();
  initReveal();
  initStringLights();
  initYear();
});
