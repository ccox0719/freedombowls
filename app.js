const Ready = () => {
  const root = document.documentElement;
  const modeToggle = document.getElementById('mode-toggle');
  const modeToggleIcon = modeToggle ? modeToggle.querySelector('.mode-toggle__icon') : null;
  const modeToggleLabel = modeToggle ? modeToggle.querySelector('.sr-only') : null;
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  const navLinks = document.querySelectorAll('.nav a');
  const toast = document.querySelector('.toast');

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const getPreferredTheme = () => {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const updateModeToggle = (theme) => {
    if (!modeToggle) return;
    const next = theme === 'dark' ? 'light' : 'dark';
    modeToggle.setAttribute('aria-label', `Switch to ${next} theme`);
    if (modeToggleLabel) modeToggleLabel.textContent = `Switch to ${next} theme`;
    if (modeToggleIcon) {
      modeToggleIcon.classList.remove('bi-sun-fill', 'bi-moon-stars-fill');
      modeToggleIcon.classList.add(theme === 'dark' ? 'bi-moon-stars-fill' : 'bi-sun-fill');
    }
  };

  const setTheme = (theme) => {
    root.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateModeToggle(theme);
  };

  const initTheme = () => {
    const theme = getPreferredTheme();
    root.setAttribute('data-theme', theme);
    updateModeToggle(theme);
  };

  initTheme();

  if (modeToggle) {
    modeToggle.addEventListener('click', () => {
      const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      setTheme(next);
    });
  }

  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      nav.classList.toggle('show');
      navToggle.classList.toggle('open');
    });

    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('show');
        navToggle.classList.remove('open');
      });
    });
  }

  const animateTargets = document.querySelectorAll('[data-animate]');
  if (animateTargets.length && !prefersReduced) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const rect = entry.target.getBoundingClientRect();
          const ratio = clamp(rect.left / window.innerWidth, 0, 1);
          const delay = 0.08 + ratio * 0.18;
          entry.target.style.setProperty('--animate-delay', `${delay.toFixed(3)}s`);
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.2 }
    );

    animateTargets.forEach((element) => observer.observe(element));
  } else {
    animateTargets.forEach((element) => element.classList.add('is-visible'));
  }

  const parallaxTargets = document.querySelectorAll('[data-parallax]');
  if (parallaxTargets.length && !prefersReduced) {
    let ticking = false;

    const updateParallax = () => {
      parallaxTargets.forEach((element) => {
        const speed = parseFloat(element.dataset.parallax || '-0.12');
        const { top, height } = element.getBoundingClientRect();
        const offset = (window.innerHeight * 0.5 - (top + height / 2)) * speed;
        element.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
      });
      ticking = false;
    };

    const requestTick = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    };

    window.addEventListener('scroll', requestTick, { passive: true });
    window.addEventListener('resize', requestTick);
    requestTick();
  }

  if (toast) {
    const forms = document.querySelectorAll('form[data-toast]');
    forms.forEach((form) => {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const fields = form.querySelectorAll('input, textarea, select');
        const values = Array.from(fields).map((field) => field.value.trim());
        if (values.some((value) => !value)) return;
        form.reset();
        const message = form.dataset.toast || 'Thanks! We will be in touch soon.';
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
          toast.classList.remove('show');
        }, 3200);
      });
    });
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', Ready);
} else {
  Ready();
}
