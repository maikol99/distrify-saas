/* =============================================
   PORTFOLIO JAVASCRIPT
   Maikol Tomás Alegre
   ============================================= */

// ---- NAVBAR SCROLL ----
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

// ---- HAMBURGER MENU ----
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
  document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
});

// Close on link click (mobile)
navLinks.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ---- TYPEWRITER EFFECT ----
const roles = [
  '"Full Stack Developer"',
  '"React Specialist"',
  '"Node.js Engineer"',
  '"Problem Solver"',
  '"Open Source Fan"',
];

let roleIndex = 0;
let charIndex  = 0;
let isDeleting = false;
const typeEl   = document.getElementById('typewriter');

function type() {
  const currentRole = roles[roleIndex];

  if (!isDeleting) {
    typeEl.textContent = currentRole.slice(0, charIndex + 1);
    charIndex++;
    if (charIndex === currentRole.length) {
      isDeleting = true;
      setTimeout(type, 1800);
      return;
    }
  } else {
    typeEl.textContent = currentRole.slice(0, charIndex - 1);
    charIndex--;
    if (charIndex === 0) {
      isDeleting = false;
      roleIndex  = (roleIndex + 1) % roles.length;
    }
  }

  setTimeout(type, isDeleting ? 50 : 80);
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(type, 600);
});

// ---- INTERSECTION OBSERVER — Reveal on scroll ----
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal, .reveal-left').forEach(el => {
  revealObserver.observe(el);
});

// ---- SKILL BARS ANIMATION ----
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.skill-fill').forEach((bar, i) => {
        setTimeout(() => bar.classList.add('animate'), i * 120);
      });
      skillObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.skill-category').forEach(cat => {
  skillObserver.observe(cat);
});

// ---- ADD REVEAL CLASSES TO SECTIONS ----
function addRevealClasses() {
  // About
  document.querySelector('.about-text')?.classList.add('reveal-left');
  document.querySelector('.about-card-wrap')?.classList.add('reveal');

  // Skills
  document.querySelectorAll('.skill-category').forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${i * 0.08}s`;
  });

  // Projects
  document.querySelectorAll('.project-card').forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${i * 0.1}s`;
  });

  // Timeline
  document.querySelectorAll('.timeline-item').forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${i * 0.15}s`;
  });

  // Education
  document.querySelectorAll('.edu-card').forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${i * 0.1}s`;
  });

  // Contact
  document.querySelector('.contact-info')?.classList.add('reveal-left');
  document.querySelector('.contact-form')?.classList.add('reveal');
}

addRevealClasses();

// Re-trigger observer after adding classes
document.querySelectorAll('.reveal, .reveal-left').forEach(el => {
  revealObserver.observe(el);
});

// ---- ACTIVE NAV LINK ----
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-link:not(.nav-cta)');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navItems.forEach(link => {
        link.style.color = '';
        link.style.background = '';
      });
      const activeLink = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
      if (activeLink) {
        activeLink.style.color = 'var(--text-100)';
        activeLink.style.background = 'rgba(99, 102, 241, 0.08)';
      }
    }
  });
}, { threshold: 0.4 });

sections.forEach(section => navObserver.observe(section));

// ---- CONTACT FORM SUBMIT ----
function handleFormSubmit(e) {
  e.preventDefault();
  const btn     = document.getElementById('submitBtn');
  const success = document.getElementById('formSuccess');
  const form    = document.getElementById('contactForm');

  btn.disabled = true;
  btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Enviando...`;
  btn.style.opacity = '0.8';

  // Simulate async send (replace with real Netlify Forms logic)
  setTimeout(() => {
    form.reset();
    btn.disabled = false;
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Enviar mensaje`;
    btn.style.opacity = '';
    success.classList.add('show');
    setTimeout(() => success.classList.remove('show'), 5000);
  }, 1500);
}

// ---- CURSOR PARALLAX (desktop only) ----
if (window.matchMedia('(min-width: 1024px)').matches) {
  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth  - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    const orb1 = document.querySelector('.orb-1');
    const orb2 = document.querySelector('.orb-2');
    if (orb1) orb1.style.transform = `translate(${x * 0.5}px, ${y * 0.5}px)`;
    if (orb2) orb2.style.transform = `translate(${-x * 0.3}px, ${-y * 0.3}px)`;
  }, { passive: true });
}

// ---- SPIN ANIMATION FOR BUTTON LOADING ----
const style = document.createElement('style');
style.textContent = `.spin { animation: spinAnim 0.8s linear infinite; } @keyframes spinAnim { to { transform: rotate(360deg); } }`;
document.head.appendChild(style);

// ---- SMOOTH SCROLL OFFSET (for fixed navbar) ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});
