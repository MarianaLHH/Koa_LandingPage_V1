/**
 * Re-Evolución KOA — Controlador de Interfaz
 * TypeScript · Sin dependencias externas
 *
 * Compilar: npx tsc  (requiere tsconfig.json en la raíz)
 * El archivo compilado main.js ya está incluido y listo para usar.
 */

// ============================================================
// Tipos e interfaces
// ============================================================

interface CounterAnimation {
  element: HTMLElement;
  target: number;
  duration: number;
}

interface AppState {
  menuOpen: boolean;
  activeSection: string;
}

// ============================================================
// Clase principal KOAApp
// ============================================================

class KOAApp {
  private readonly state: AppState = {
    menuOpen: false,
    activeSection: 'inicio',
  };

  private readonly navToggle:  HTMLButtonElement | null;
  private readonly navMenu:    HTMLElement | null;
  private readonly siteHeader: HTMLElement | null;
  private readonly sections:   NodeListOf<HTMLElement>;
  private readonly navLinks:   NodeListOf<HTMLAnchorElement>;

  constructor() {
    this.navToggle  = document.getElementById('navToggle') as HTMLButtonElement | null;
    this.navMenu    = document.getElementById('navMenu');
    this.siteHeader = document.querySelector<HTMLElement>('.site-header');
    this.sections   = document.querySelectorAll<HTMLElement>('section[id], main[id]');
    this.navLinks   = document.querySelectorAll<HTMLAnchorElement>('.nav-link');

    this.initMobileMenu();
    this.initSmoothScroll();
    this.initHeaderScroll();
    this.initActiveSectionTracking();
    this.initCardReveal();
    this.initCounterAnimation();
    this.initVolunteerForm();
  }

  // ----------------------------------------------------------
  // Menú móvil — toggle hamburguesa
  // ----------------------------------------------------------
  private initMobileMenu(): void {
    if (!this.navToggle || !this.navMenu) return;

    this.navToggle.addEventListener('click', () => {
      this.toggleMenu(!this.state.menuOpen);
    });

    // Cerrar al hacer clic en un enlace o CTA
    const closeTargets = this.navMenu.querySelectorAll<HTMLElement>('.nav-link, .nav-cta');
    closeTargets.forEach(el => {
      el.addEventListener('click', () => this.toggleMenu(false));
    });

    // Cerrar con tecla Escape
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape' && this.state.menuOpen) {
        this.toggleMenu(false);
        this.navToggle?.focus();
      }
    });
  }

  private toggleMenu(open: boolean): void {
    this.state.menuOpen = open;
    this.navToggle?.setAttribute('aria-expanded', String(open));
    this.navMenu?.classList.toggle('is-open', open);
    this.navToggle?.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  // ----------------------------------------------------------
  // Scroll suave para enlaces ancla internos
  // ----------------------------------------------------------
  private initSmoothScroll(): void {
    document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e: MouseEvent) => {
        const href = anchor.getAttribute('href');
        if (!href || href === '#') return;

        const target = document.querySelector<HTMLElement>(href);
        if (!target) return;

        e.preventDefault();
        const headerOffset = this.siteHeader?.offsetHeight ?? 68;
        const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;

        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }

  // ----------------------------------------------------------
  // Cabecera: aplica estilos al hacer scroll
  // ----------------------------------------------------------
  private initHeaderScroll(): void {
    const update = (): void => {
      this.siteHeader?.classList.toggle('is-scrolled', window.scrollY > 50);
    };
    window.addEventListener('scroll', update, { passive: true });
    update(); // estado inicial
  }

  // ----------------------------------------------------------
  // Resaltar enlace de navegación según sección visible
  // ----------------------------------------------------------
  private initActiveSectionTracking(): void {
    const observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = (entry.target as HTMLElement).id;
            this.state.activeSection = id;
            this.navLinks.forEach(link => {
              link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
              link.removeAttribute('aria-current');
            });
            const activeLink = document.querySelector<HTMLAnchorElement>(`.nav-link[href="#${id}"]`);
            activeLink?.setAttribute('aria-current', 'page');
          }
        });
      },
      { threshold: 0.35 }
    );

    this.sections.forEach(s => observer.observe(s));
  }

  // ----------------------------------------------------------
  // Animación de entrada para tarjetas (fade + slide-up)
  // ----------------------------------------------------------
  private initCardReveal(): void {
    const cards = document.querySelectorAll<HTMLElement>('.axis-card, .impact-card');
    if (!cards.length) return;

    // Si el navegador no soporta Intersection Observer, mostrar todo
    if (!('IntersectionObserver' in window)) {
      cards.forEach(c => c.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            const card = entry.target as HTMLElement;
            const delay = (i % 3) * 100; // retardo escalonado por columna
            setTimeout(() => card.classList.add('is-visible'), delay);
            observer.unobserve(card);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    cards.forEach(c => observer.observe(c));
  }

  // ----------------------------------------------------------
  // Animación de contadores en el dashboard
  // ----------------------------------------------------------
  private initCounterAnimation(): void {
    const counters = document.querySelectorAll<HTMLElement>('[data-target]');
    if (!counters.length) return;

    const observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;

          const wrapper = entry.target as HTMLElement;
          const target  = parseInt(wrapper.dataset.target ?? '0', 10);
          const display = wrapper.querySelector<HTMLElement>('.counter-value');

          if (display) {
            this.animateCount({ element: display, target, duration: 1600 });
          }
          observer.unobserve(wrapper);
        });
      },
      { threshold: 0.6 }
    );

    counters.forEach(c => observer.observe(c));
  }

  private animateCount({ element, target, duration }: CounterAnimation): void {
    if (target === 0) {
      element.textContent = '0';
      return;
    }

    const startTime = performance.now();

    const tick = (now: number): void => {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cúbico
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = Math.round(target * eased).toLocaleString('es-BO');
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }

  // ----------------------------------------------------------
  // Formulario de voluntariado — validación y feedback
  // ----------------------------------------------------------
  private initVolunteerForm(): void {
    const form     = document.getElementById('volunteerForm') as HTMLFormElement | null;
    const messages = document.getElementById('formMessages');
    if (!form || !messages) return;

    form.addEventListener('submit', (e: SubmitEvent) => {
      e.preventDefault();

      const name  = (form.elements.namedItem('nombre') as HTMLInputElement).value.trim();
      const email = (form.elements.namedItem('email')  as HTMLInputElement).value.trim();
      const terms = (form.elements.namedItem('terminos') as HTMLInputElement).checked;

      // Validación básica en cliente
      const errors: string[] = [];
      if (!name)               errors.push('El nombre es obligatorio.');
      if (!email)              errors.push('El correo electrónico es obligatorio.');
      else if (!this.isValidEmail(email)) errors.push('El correo electrónico no tiene un formato válido.');
      if (!terms)              errors.push('Debes aceptar el Pacto Interno del colectivo.');

      if (errors.length > 0) {
        this.showMessage(messages, errors.join(' '), 'error');
        return;
      }

      // Simulación de envío exitoso
      // TODO: Conectar con tu backend o servicio de formularios (Netlify Forms, Formspree, etc.)
      this.showMessage(
        messages,
        '¡Gracias por querer unirte! Recibimos tu solicitud y nos pondremos en contacto pronto. ¡Bienvenido/a a Re-Evolución KOA!',
        'success'
      );
      form.reset();
    });
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private showMessage(container: HTMLElement, text: string, type: 'success' | 'error'): void {
    container.textContent = text;
    container.className   = `form-messages form-${type}`;
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// ============================================================
// Arranque — esperar al DOM completo
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  new KOAApp();
});
