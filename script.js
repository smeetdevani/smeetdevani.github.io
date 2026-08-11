// ============================================
// LOADER
// ============================================
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('done');
  }, 1500);
});

// ============================================
// CUSTOM CURSOR
// ============================================
const cursorDot = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');

let mouseX = 0, mouseY = 0;
let dotX = 0, dotY = 0;
let ringX = 0, ringY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function animateCursor(){
  dotX += (mouseX - dotX) * 0.9;
  dotY += (mouseY - dotY) * 0.9;
  ringX += (mouseX - ringX) * 0.15;
  ringY += (mouseY - ringY) * 0.15;

  cursorDot.style.transform = `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`;
  cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
  requestAnimationFrame(animateCursor);
}
animateCursor();

// Cursor hover states
document.querySelectorAll('[data-cursor]').forEach(el => {
  const type = el.dataset.cursor;
  el.addEventListener('mouseenter', () => {
    cursorRing.classList.add(type);
    cursorDot.classList.add(type);
  });
  el.addEventListener('mouseleave', () => {
    cursorRing.classList.remove(type);
    cursorDot.classList.remove(type);
  });
});

// Hide cursor when leaving window
document.addEventListener('mouseleave', () => {
  cursorDot.style.opacity = 0;
  cursorRing.style.opacity = 0;
});
document.addEventListener('mouseenter', () => {
  cursorDot.style.opacity = 1;
  cursorRing.style.opacity = 1;
});

// ============================================
// MAGNETIC BUTTONS
// ============================================
document.querySelectorAll('.magnetic').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
  });
});

// ============================================
// SCROLL REVEAL
// ============================================
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -80px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ============================================
// NAV HIDE ON SCROLL DOWN
// ============================================
let lastScrollY = 0;
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if(y > 200 && y > lastScrollY){
    nav.classList.add('hidden');
  } else {
    nav.classList.remove('hidden');
  }
  lastScrollY = y;
}, { passive: true });

// ============================================
// COUNTER ANIMATION
// ============================================
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      const el = entry.target;
      const target = parseInt(el.dataset.target);
      const duration = 1800;
      const start = performance.now();

      function tick(now){
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(target * eased);
        if(progress < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      }
      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.counter-num').forEach(el => counterObserver.observe(el));

// ============================================
// 3D COVERFLOW
// ============================================
const coverflows = {
  videos: { el: document.getElementById('videosCoverflow'), current: 0, counterId: 'videoCurrent', totalId: 'videoTotal' },
  graphics: { el: document.getElementById('graphicsCoverflow'), current: 0, counterId: 'graphicsCurrent', totalId: 'graphicsTotal' }
};

function positionCoverflow(name){
  const cf = coverflows[name];
  if(!cf || !cf.el) return;
  const cards = cf.el.querySelectorAll('.cf-card');
  const total = cards.length;

  document.getElementById(cf.counterId).textContent = cf.current + 1;
  document.getElementById(cf.totalId).textContent = total;

  const isWide = name === 'graphics';
  const spread = isWide ? 340 : 240;

  cards.forEach((card, i) => {
    const offset = i - cf.current;
    const abs = Math.abs(offset);
    const isActive = offset === 0;

    const translateX = offset * spread;
    const translateZ = -abs * 220;
    const rotateY = offset * -22;
    const scale = isActive ? 1 : Math.max(0.72, 1 - abs * 0.14);
    const opacity = abs > 3 ? 0 : Math.max(0.35, 1 - abs * 0.22);

    card.style.transform = `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`;
    card.style.opacity = opacity;
    card.style.filter = isActive ? 'none' : `blur(${abs * 1.2}px)`;
    card.style.zIndex = 100 - abs;
    card.classList.toggle('active', isActive);

    // Lazy load iframe
    const iframe = card.querySelector('iframe');
    if(iframe){
      if(abs <= 2){
        if(!iframe.src || iframe.src === window.location.href || iframe.src === ''){
          iframe.src = card.dataset.video;
        }
      } else if(abs > 3){
        iframe.src = '';
      }
    }
  });
}

function cfMove(name, dir){
  const cf = coverflows[name];
  if(!cf) return;
  const total = cf.el.querySelectorAll('.cf-card').length;
  cf.current = (cf.current + dir + total) % total;
  positionCoverflow(name);
}

// Click card to activate
Object.keys(coverflows).forEach(name => {
  const cf = coverflows[name];
  if(!cf.el) return;
  const cards = cf.el.querySelectorAll('.cf-card');
  cards.forEach((card, i) => {
    card.addEventListener('click', () => {
      if(i !== cf.current){
        cf.current = i;
        positionCoverflow(name);
      }
    });
  });
  positionCoverflow(name);
});

// ============================================
// MOUSE WHEEL SCROLL on COVERFLOW
// ============================================
Object.keys(coverflows).forEach(name => {
  const cf = coverflows[name];
  if(!cf.el) return;
  const wrap = cf.el.closest('.cf-wrap');
  if(!wrap) return;

  let wheelTimeout = null;
  let wheelLocked = false;

  wrap.addEventListener('wheel', (e) => {
    const deltaX = Math.abs(e.deltaX);
    const deltaY = Math.abs(e.deltaY);
    const delta = deltaX > deltaY ? e.deltaX : e.deltaY;

    if(Math.abs(delta) < 5) return;
    e.preventDefault();

    if(wheelLocked) return;
    wheelLocked = true;

    const dir = delta > 0 ? 1 : -1;
    cfMove(name, dir);

    clearTimeout(wheelTimeout);
    wheelTimeout = setTimeout(() => {
      wheelLocked = false;
    }, 500);
  }, { passive: false });
});

// ============================================
// TOUCH SWIPE with velocity
// ============================================
Object.keys(coverflows).forEach(name => {
  const cf = coverflows[name];
  if(!cf.el) return;

  let touchStartX = 0;
  let touchStartTime = 0;
  let isSwiping = false;

  cf.el.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartTime = Date.now();
    isSwiping = false;
  }, { passive: true });

  cf.el.addEventListener('touchmove', (e) => {
    const currentX = e.touches[0].clientX;
    if(Math.abs(currentX - touchStartX) > 10) isSwiping = true;
  }, { passive: true });

  cf.el.addEventListener('touchend', (e) => {
    if(!isSwiping) return;
    const endX = e.changedTouches[0].clientX;
    const diff = touchStartX - endX;
    const elapsed = Date.now() - touchStartTime;
    const velocity = Math.abs(diff) / elapsed;

    if(Math.abs(diff) > 40 || velocity > 0.3){
      cfMove(name, diff > 0 ? 1 : -1);
    }
  }, { passive: true });
});

// ============================================
// KEYBOARD ARROWS for coverflow
// ============================================
document.addEventListener('keydown', (e) => {
  if(e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
  const dir = e.key === 'ArrowLeft' ? -1 : 1;

  let closest = null, closestDist = Infinity;
  Object.keys(coverflows).forEach(name => {
    const cf = coverflows[name];
    if(!cf.el) return;
    const rect = cf.el.getBoundingClientRect();
    const dist = Math.abs(rect.top + rect.height/2 - window.innerHeight/2);
    if(dist < closestDist){ closestDist = dist; closest = name; }
  });
  if(closest && closestDist < window.innerHeight/2) cfMove(closest, dir);
});

// ============================================
// MUTE TOGGLE
// ============================================
function toggleMute(btn, event){
  event.stopPropagation();
  const iframe = btn.parentElement.querySelector('iframe');
  const src = iframe.src;
  if(btn.textContent === '🔊'){
    btn.textContent = '🔇';
  } else {
    btn.textContent = '🔊';
  }
  iframe.src = '';
  setTimeout(() => { iframe.src = src; }, 50);
}

// ============================================
// FAQ (close others when one opens)
// ============================================
document.querySelectorAll('.faq-item').forEach(item => {
  item.addEventListener('toggle', () => {
    if(item.open){
      document.querySelectorAll('.faq-item').forEach(o => {
        if(o !== item) o.open = false;
      });
    }
  });
});

// ============================================
// CONTACT FORM
// ============================================
const form = document.getElementById('contactForm');
const modal = document.getElementById('successModal');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form));

  const leads = JSON.parse(localStorage.getItem('leads') || '[]');
  leads.push({...data, date: new Date().toISOString()});
  localStorage.setItem('leads', JSON.stringify(leads));

  // 🔧 REPLACE with your real email
  try {
    await fetch('https://formsubmit.co/ajax/YOUR_EMAIL@example.com', {
      method: 'POST',
      headers: {'Content-Type':'application/json','Accept':'application/json'},
      body: JSON.stringify(data)
    });
  } catch(err) { console.log('optional:', err); }

  modal.classList.remove('hidden');
  form.reset();
});

function closeModal(){ modal.classList.add('hidden'); }
modal.addEventListener('click', (e) => { if(e.target === modal) closeModal(); });

// ============================================
// SMOOTH SCROLL for anchor links
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const targetId = link.getAttribute('href');
    if(targetId === '#') return;
    const target = document.querySelector(targetId);
    if(target){
      e.preventDefault();
      const offset = 80;
      const targetPos = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: targetPos, behavior: 'smooth' });
    }
  });
});
