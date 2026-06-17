/**
 * Re-Evolución KOA — Controlador de Interfaz
 * JavaScript compilado (ES2020) — listo para usar sin compilación.
 * Fuente TypeScript en main.ts
 */

"use strict";

class KOAApp {
  constructor() {
    this.state = {
      menuOpen: false,
      activeSection: 'inicio',
    };

    this.navToggle  = document.getElementById('navToggle');
    this.navMenu    = document.getElementById('navMenu');
    this.siteHeader = document.querySelector('.site-header');
    this.sections   = document.querySelectorAll('section[id], main[id]');
    this.navLinks   = document.querySelectorAll('.nav-link');

    this.initMobileMenu();
    this.initSmoothScroll();
    this.initHeaderScroll();
    this.initActiveSectionTracking();
    this.initCardReveal();
    this.initCounterAnimation();
    this.initVolunteerForm();
  }

  // ----------------------------------------------------------
  // Menú móvil
  // ----------------------------------------------------------
  initMobileMenu() {
    if (!this.navToggle || !this.navMenu) return;

    this.navToggle.addEventListener('click', () => {
      this.toggleMenu(!this.state.menuOpen);
    });

    const closeTargets = this.navMenu.querySelectorAll('.nav-link, .nav-cta');
    closeTargets.forEach(el => {
      el.addEventListener('click', () => this.toggleMenu(false));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.state.menuOpen) {
        this.toggleMenu(false);
        this.navToggle?.focus();
      }
    });
  }

  toggleMenu(open) {
    this.state.menuOpen = open;
    this.navToggle?.setAttribute('aria-expanded', String(open));
    this.navMenu?.classList.toggle('is-open', open);
    this.navToggle?.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  // ----------------------------------------------------------
  // Scroll suave para anclas internas
  // ----------------------------------------------------------
  initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (!href || href === '#') return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();
        const headerOffset = this.siteHeader?.offsetHeight ?? 68;
        const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }

  // ----------------------------------------------------------
  // Cabecera con scroll
  // ----------------------------------------------------------
  initHeaderScroll() {
    const update = () => {
      this.siteHeader?.classList.toggle('is-scrolled', window.scrollY > 50);
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  // ----------------------------------------------------------
  // Seguimiento de sección activa
  // ----------------------------------------------------------
  initActiveSectionTracking() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          this.state.activeSection = id;
          this.navLinks.forEach(link => {
            link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
            link.removeAttribute('aria-current');
          });
          const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);
          activeLink?.setAttribute('aria-current', 'page');
        });
      },
      { threshold: 0.35 }
    );

    this.sections.forEach(s => observer.observe(s));
  }

  // ----------------------------------------------------------
  // Animación de entrada para tarjetas
  // ----------------------------------------------------------
  initCardReveal() {
    const cards = document.querySelectorAll('.axis-card, .impact-card');
    if (!cards.length) return;

    if (!('IntersectionObserver' in window)) {
      cards.forEach(c => c.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (!entry.isIntersecting) return;
          const card = entry.target;
          const delay = (i % 3) * 100;
          setTimeout(() => card.classList.add('is-visible'), delay);
          observer.unobserve(card);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    cards.forEach(c => observer.observe(c));
  }

  // ----------------------------------------------------------
  // Animación de contadores
  // ----------------------------------------------------------
  initCounterAnimation() {
    const counters = document.querySelectorAll('[data-target]');
    if (!counters.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const wrapper = entry.target;
          const target  = parseInt(wrapper.dataset.target ?? '0', 10);
          const display = wrapper.querySelector('.counter-value');
          if (display) {
            this.animateCount(display, target, 1600);
          }
          observer.unobserve(wrapper);
        });
      },
      { threshold: 0.6 }
    );

    counters.forEach(c => observer.observe(c));
  }

  animateCount(element, target, duration) {
    if (target === 0) {
      element.textContent = '0';
      return;
    }
    const startTime = performance.now();
    const tick = (now) => {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cúbico
      element.textContent = Math.round(target * eased).toLocaleString('es-BO');
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // ----------------------------------------------------------
  // Formulario de voluntariado
  // ----------------------------------------------------------
  initVolunteerForm() {
    const form     = document.getElementById('volunteerForm');
    const messages = document.getElementById('formMessages');
    if (!form || !messages) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name  = form.elements['nombre'].value.trim();
      const email = form.elements['email'].value.trim();
      const terms = form.elements['terminos'].checked;

      const errors = [];
      if (!name)  errors.push('El nombre es obligatorio.');
      if (!email) errors.push('El correo electrónico es obligatorio.');
      else if (!this.isValidEmail(email)) errors.push('El correo electrónico no tiene un formato válido.');
      if (!terms) errors.push('Debes aceptar el Pacto Interno del colectivo.');

      if (errors.length > 0) {
        this.showMessage(messages, errors.join(' '), 'error');
        return;
      }

      // -------------------------------------------------------
      // TODO: Reemplaza este bloque con tu endpoint real.
      // Opciones sin servidor: Formspree, Netlify Forms,
      // Web3Forms o tu propio backend.
      // -------------------------------------------------------
      this.showMessage(
        messages,
        '¡Gracias por querer unirte! Recibimos tu solicitud y nos pondremos en contacto pronto. ¡Bienvenido/a a Re-Evolución KOA! 💚',
        'success'
      );
      form.reset();
    });
  }

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  showMessage(container, text, type) {
    container.textContent = text;
    container.className   = `form-messages form-${type}`;
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// ============================================================
// Arranque
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  new KOAApp();
});
