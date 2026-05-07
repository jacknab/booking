/* Certxa — Main JS */

// ── Accordion ──────────────────────────────────────────────
document.querySelectorAll('.accordion-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const body   = btn.nextElementSibling;
    const isOpen = btn.classList.contains('active');

    document.querySelectorAll('.accordion-btn').forEach(b => {
      b.classList.remove('active');
      if (b.nextElementSibling) b.nextElementSibling.classList.remove('open');
    });

    if (!isOpen) {
      btn.classList.add('active');
      body.classList.add('open');
    }
  });
});

// ── Nav scroll shadow ──────────────────────────────────────
const nav = document.getElementById('main-nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });
}

// ── Reveal on scroll ───────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

// Observe cards that get .reveal added by JS
document.querySelectorAll('.card, .testimonial, .step, .pricing-card').forEach((el, i) => {
  el.classList.add('reveal');
  const siblings = el.parentElement ? Array.from(el.parentElement.children) : [];
  const idx = siblings.indexOf(el);
  if (idx > 0 && idx <= 3) el.classList.add(`reveal-delay-${idx}`);
  revealObserver.observe(el);
});

// Also observe elements that already have .reveal in the HTML (e.g. testi-dark-card, bento-card)
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── Desktop dropdown — hover with grace-period timer ───────
// Switches from pure-CSS :hover (broken by the gap) to JS .open class.
// A 150 ms delay on close means brief mouse movement never snaps it shut.
(function () {
  const isMobile = () => window.innerWidth < 900;
  document.querySelectorAll('.has-dropdown').forEach(item => {
    let closeTimer = null;

    const open = () => {
      if (isMobile()) return;
      clearTimeout(closeTimer);
      // close siblings
      document.querySelectorAll('.has-dropdown').forEach(other => {
        if (other !== item) other.classList.remove('open');
      });
      item.classList.add('open');
    };

    const scheduleClose = () => {
      if (isMobile()) return;
      closeTimer = setTimeout(() => item.classList.remove('open'), 150);
    };

    item.addEventListener('mouseenter', open);
    item.addEventListener('mouseleave', scheduleClose);

    // Re-entering the dropdown (or the bridge) cancels the close timer
    const dropdown = item.querySelector('.dropdown');
    if (dropdown) {
      dropdown.addEventListener('mouseenter', () => clearTimeout(closeTimer));
      dropdown.addEventListener('mouseleave', scheduleClose);
    }
  });

  // Close all when clicking outside
  document.addEventListener('click', e => {
    if (!e.target.closest('.has-dropdown')) {
      document.querySelectorAll('.has-dropdown').forEach(d => d.classList.remove('open'));
    }
  });
})();

// ── Mobile menu ────────────────────────────────────────────
const menuBtn    = document.querySelector('.mobile-menu-btn');
const navLinks   = document.querySelector('.nav-links');
const navActions = document.querySelector('.nav-actions');

if (menuBtn && navLinks) {
  let menuOpen = false;
  menuBtn.addEventListener('click', () => {
    menuOpen = !menuOpen;
    if (menuOpen) {
      navLinks.style.cssText = 'display:flex;flex-direction:column;position:absolute;top:70px;left:0;right:0;background:#fff;padding:16px 28px 24px;box-shadow:0 20px 40px rgba(59,7,100,.12);z-index:999;';
      if (navActions) navActions.style.cssText = 'display:flex;flex-direction:column;position:absolute;top:auto;left:0;right:0;background:#fff;padding:0 28px 24px;z-index:999;';
    } else {
      navLinks.removeAttribute('style');
      if (navActions) navActions.removeAttribute('style');
    }
  });
}

// ── Pricing toggle ─────────────────────────────────────────
const toggleInput = document.getElementById('billing-toggle');
if (toggleInput) {
  const monthlyPrices = document.querySelectorAll('.price-monthly');
  const annualPrices  = document.querySelectorAll('.price-annual');
  const saveBadges    = document.querySelectorAll('.pricing-save');

  function updatePricing(isAnnual) {
    monthlyPrices.forEach(el => el.style.display = isAnnual ? 'none' : 'inline');
    annualPrices.forEach(el  => el.style.display = isAnnual ? 'inline' : 'none');
    saveBadges.forEach(el    => el.style.display = isAnnual ? 'block' : 'none');
  }
  updatePricing(false);
  toggleInput.addEventListener('change', () => updatePricing(toggleInput.checked));
}

// ── Active nav link ────────────────────────────────────────
const currentPath = window.location.pathname;
document.querySelectorAll('.nav-links a, .dropdown a').forEach(link => {
  if (link.getAttribute('href') === currentPath) link.classList.add('active');
});

// ── Subtle card tilt on desktop ────────────────────────────
if (window.matchMedia('(hover: hover) and (min-width: 768px)').matches) {
  document.querySelectorAll('.glass-card, .hero-mockup').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${-y * 3.5}deg) rotateY(${x * 3.5}deg) translateZ(8px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

// ── Animated counters ───────────────────────────────────────
(function () {
  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target   = parseFloat(el.dataset.count);
      const suffix   = el.dataset.suffix  || '';
      const prefix   = el.dataset.prefix  || '';
      const isFloat  = String(target).includes('.');
      const duration = 1600;
      const steps    = 55;
      let   current  = 0;
      const inc      = target / steps;
      const interval = setInterval(() => {
        current += inc;
        if (current >= target) {
          current = target;
          clearInterval(interval);
          el.classList.add('counter-done');
        }
        const val = isFloat
          ? current.toFixed(1)
          : Math.floor(current).toLocaleString();
        el.textContent = prefix + val + suffix;
      }, duration / steps);
      counterObs.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach(el => counterObs.observe(el));
})();

// ── Word-by-word headline entrance ─────────────────────────
(function () {
  document.querySelectorAll('.word-split').forEach(el => {
    // Walk text nodes only; preserve br + em as atomic units
    const result = [];
    let delay = 0.08;
    function processNode(node) {
      if (node.nodeType === 3) { // text
        node.textContent.split(/(\s+)/).forEach(chunk => {
          if (!chunk) return;
          if (/^\s+$/.test(chunk)) { result.push(document.createTextNode(chunk)); return; }
          const span = document.createElement('span');
          span.className = 'word-reveal';
          span.style.animationDelay = delay + 's';
          span.textContent = chunk;
          result.push(span);
          delay += 0.09;
        });
      } else if (node.nodeName === 'EM' || node.nodeName === 'STRONG') {
        const clone = node.cloneNode(true);
        clone.style.display = 'inline-block';
        clone.style.opacity = '0';
        clone.style.transform = 'translateY(22px)';
        clone.style.animation = `wordRise .55s var(--ease-out) ${delay}s forwards`;
        result.push(clone);
        delay += 0.1;
      } else {
        result.push(node.cloneNode(true));
      }
    }
    Array.from(el.childNodes).forEach(processNode);
    el.innerHTML = '';
    result.forEach(n => el.appendChild(n));
  });
})();
