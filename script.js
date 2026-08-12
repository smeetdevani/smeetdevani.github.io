// LOADER
window.addEventListener('load', function() {
  setTimeout(function() {
    var loader = document.getElementById('loader');
    if(loader) loader.classList.add('done');
  }, 1500);
});

// CUSTOM CURSOR
var cursorDot = document.getElementById('cursorDot');
var cursorRing = document.getElementById('cursorRing');
var mouseX = 0, mouseY = 0, dotX = 0, dotY = 0, ringX = 0, ringY = 0;

document.addEventListener('mousemove', function(e) {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function animateCursor() {
  dotX += (mouseX - dotX) * 0.9;
  dotY += (mouseY - dotY) * 0.9;
  ringX += (mouseX - ringX) * 0.15;
  ringY += (mouseY - ringY) * 0.15;
  if(cursorDot) cursorDot.style.transform = 'translate(' + dotX + 'px, ' + dotY + 'px) translate(-50%, -50%)';
  if(cursorRing) cursorRing.style.transform = 'translate(' + ringX + 'px, ' + ringY + 'px) translate(-50%, -50%)';
  requestAnimationFrame(animateCursor);
}
animateCursor();

document.querySelectorAll('[data-cursor]').forEach(function(el) {
  var type = el.dataset.cursor;
  el.addEventListener('mouseenter', function() {
    if(cursorRing) cursorRing.classList.add(type);
    if(cursorDot) cursorDot.classList.add(type);
  });
  el.addEventListener('mouseleave', function() {
    if(cursorRing) cursorRing.classList.remove(type);
    if(cursorDot) cursorDot.classList.remove(type);
  });
});

document.addEventListener('mouseleave', function() {
  if(cursorDot) cursorDot.style.opacity = 0;
  if(cursorRing) cursorRing.style.opacity = 0;
});
document.addEventListener('mouseenter', function() {
  if(cursorDot) cursorDot.style.opacity = 1;
  if(cursorRing) cursorRing.style.opacity = 1;
});

// MAGNETIC BUTTONS
document.querySelectorAll('.magnetic').forEach(function(btn) {
  btn.addEventListener('mousemove', function(e) {
    var rect = btn.getBoundingClientRect();
    var x = e.clientX - rect.left - rect.width / 2;
    var y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = 'translate(' + (x * 0.25) + 'px, ' + (y * 0.35) + 'px)';
  });
  btn.addEventListener('mouseleave', function() {
    btn.style.transform = '';
  });
});

// SCROLL REVEAL
var revealObserver = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if(entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -80px 0px' });

document.querySelectorAll('.reveal').forEach(function(el) {
  revealObserver.observe(el);
});

// NAV HIDE ON SCROLL
var lastScrollY = 0;
var nav = document.getElementById('nav');
window.addEventListener('scroll', function() {
  var y = window.scrollY;
  if(nav) {
    if(y > 200 && y > lastScrollY) nav.classList.add('hidden');
    else nav.classList.remove('hidden');
  }
  lastScrollY = y;
}, { passive: true });

// COUNTER ANIMATION
var counterObserver = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if(entry.isIntersecting) {
      var el = entry.target;
      var target = parseInt(el.dataset.target);
      var duration = 1800;
      var start = performance.now();
      function tick(now) {
        var progress = Math.min((now - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(target * eased);
        if(progress < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      }
      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.counter-num').forEach(function(el) {
  counterObserver.observe(el);
});

// COVERFLOW
var coverflows = {
  videos: { el: document.getElementById('videosCoverflow'), current: 0, counterId: 'videoCurrent', totalId: 'videoTotal' },
  graphics: { el: document.getElementById('graphicsCoverflow'), current: 0, counterId: 'graphicsCurrent', totalId: 'graphicsTotal' }
};

function positionCoverflow(name) {
  var cf = coverflows[name];
  if(!cf || !cf.el) return;
  var cards = cf.el.querySelectorAll('.cf-card');
  var total = cards.length;
  var counterEl = document.getElementById(cf.counterId);
  var totalEl = document.getElementById(cf.totalId);
  if(counterEl) counterEl.textContent = cf.current + 1;
  if(totalEl) totalEl.textContent = total;
  
  var isWide = name === 'graphics';
  var spread = isWide ? 340 : 240;

  cards.forEach(function(card, i) {
    var offset = i - cf.current;
    var abs = Math.abs(offset);
    var isActive = offset === 0;
    var translateX = offset * spread;
    var translateZ = -abs * 220;
    var rotateY = offset * -22;
    var scale = isActive ? 1 : Math.max(0.72, 1 - abs * 0.14);
    var opacity = abs > 3 ? 0 : Math.max(0.35, 1 - abs * 0.22);
    
    card.style.transform = 'translateX(' + translateX + 'px) translateZ(' + translateZ + 'px) rotateY(' + rotateY + 'deg) scale(' + scale + ')';
    card.style.opacity = opacity;
    card.style.filter = isActive ? 'none' : 'blur(' + (abs * 1.2) + 'px)';
    card.style.zIndex = 100 - abs;
    card.classList.toggle('active', isActive);
    
    var iframe = card.querySelector('iframe');
    if(iframe) {
      if(abs <= 2) {
        if(!iframe.src || iframe.src === window.location.href || iframe.src === '') {
          iframe.src = card.dataset.video;
        }
      } else if(abs > 3) {
        iframe.src = '';
      }
    }
  });
}

function cfMove(name, dir) {
  var cf = coverflows[name];
  if(!cf) return;
  var total = cf.el.querySelectorAll('.cf-card').length;
  cf.current = (cf.current + dir + total) % total;
  positionCoverflow(name);
}

Object.keys(coverflows).forEach(function(name) {
  var cf = coverflows[name];
  if(!cf.el) return;
  var cards = cf.el.querySelectorAll('.cf-card');
  cards.forEach(function(card, i) {
    card.addEventListener('click', function() {
      if(i !== cf.current) {
        cf.current = i;
        positionCoverflow(name);
      }
    });
  });
  positionCoverflow(name);
});

// MOUSE WHEEL SCROLL
Object.keys(coverflows).forEach(function(name) {
  var cf = coverflows[name];
  if(!cf.el) return;
  var wrap = cf.el.closest('.cf-wrap');
  if(!wrap) return;
  var wheelTimeout = null;
  var wheelLocked = false;
  wrap.addEventListener('wheel', function(e) {
    var deltaX = Math.abs(e.deltaX);
    var deltaY = Math.abs(e.deltaY);
    var delta = deltaX > deltaY ? e.deltaX : e.deltaY;
    if(Math.abs(delta) < 5) return;
    e.preventDefault();
    if(wheelLocked) return;
    wheelLocked = true;
    cfMove(name, delta > 0 ? 1 : -1);
    clearTimeout(wheelTimeout);
    wheelTimeout = setTimeout(function() { wheelLocked = false; }, 500);
  }, { passive: false });
});

// TOUCH SWIPE
Object.keys(coverflows).forEach(function(name) {
  var cf = coverflows[name];
  if(!cf.el) return;
  var touchStartX = 0;
  var touchStartTime = 0;
  var isSwiping = false;
  cf.el.addEventListener('touchstart', function(e) {
    touchStartX = e.touches[0].clientX;
    touchStartTime = Date.now();
    isSwiping = false;
  }, { passive: true });
  cf.el.addEventListener('touchmove', function(e) {
    if(Math.abs(e.touches[0].clientX - touchStartX) > 10) isSwiping = true;
  }, { passive: true });
  cf.el.addEventListener('touchend', function(e) {
    if(!isSwiping) return;
    var diff = touchStartX - e.changedTouches[0].clientX;
    var velocity = Math.abs(diff) / (Date.now() - touchStartTime);
    if(Math.abs(diff) > 40 || velocity > 0.3) cfMove(name, diff > 0 ? 1 : -1);
  }, { passive: true });
});

// KEYBOARD ARROWS
document.addEventListener('keydown', function(e) {
  if(e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
  var dir = e.key === 'ArrowLeft' ? -1 : 1;
  var closest = null;
  var closestDist = Infinity;
  Object.keys(coverflows).forEach(function(name) {
    var cf = coverflows[name];
    if(!cf.el) return;
    var rect = cf.el.getBoundingClientRect();
    var dist = Math.abs(rect.top + rect.height/2 - window.innerHeight/2);
    if(dist < closestDist) { closestDist = dist; closest = name; }
  });
  if(closest && closestDist < window.innerHeight/2) cfMove(closest, dir);
});

// MUTE TOGGLE
function toggleMute(btn, event) {
  event.stopPropagation();
  var iframe = btn.parentElement.querySelector('iframe');
  var src = iframe.src;
  btn.textContent = btn.textContent === '🔊' ? '🔇' : '🔊';
  iframe.src = '';
  setTimeout(function() { iframe.src = src; }, 50);
}

// FAQ
document.querySelectorAll('.faq-item').forEach(function(item) {
  item.addEventListener('toggle', function() {
    if(item.open) {
      document.querySelectorAll('.faq-item').forEach(function(o) {
        if(o !== item) o.open = false;
      });
    }
  });
});

// CONTACT FORM
var form = document.getElementById('contactForm');
var modal = document.getElementById('successModal');

if(form) {
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var data = Object.fromEntries(new FormData(form));
    var leads = JSON.parse(localStorage.getItem('leads') || '[]');
    leads.push(Object.assign({}, data, { date: new Date().toISOString() }));
    localStorage.setItem('leads', JSON.stringify(leads));
    
    // Send email via FormSubmit - REPLACE with your email
    fetch('https://formsubmit.co/ajax/YOUR_EMAIL@example.com', {
      method: 'POST',
      headers: {'Content-Type':'application/json','Accept':'application/json'},
      body: JSON.stringify(data)
    }).catch(function(err) { console.log('form error:', err); });
    
    if(modal) modal.classList.remove('hidden');
    form.reset();
  });
}

function closeModal() {
  if(modal) modal.classList.add('hidden');
}

if(modal) {
  modal.addEventListener('click', function(e) {
    if(e.target === modal) closeModal();
  });
}

// SMOOTH SCROLL
document.querySelectorAll('a[href^="#"]').forEach(function(link) {
  link.addEventListener('click', function(e) {
    var targetId = link.getAttribute('href');
    if(targetId === '#') return;
    var target = document.querySelector(targetId);
    if(target) {
      e.preventDefault();
      var offset = 80;
      var targetPos = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: targetPos, behavior: 'smooth' });
    }
  });
});
