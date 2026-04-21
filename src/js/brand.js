/* ============================================
   Terra Sky – brand.js
   Valores globales de marca: colores, logo,
   nombre y tagline. Fuente única de verdad.
   Inyecta el logo canónico en todas las páginas.
   ============================================ */

'use strict';

/* ─── Configuración de marca ──────────────────────────────────────────────── */
const BRAND = {

  /* Identidad textual */
  line1:   'TERRA',
  line2:   'SKY',
  tagline: 'AEROLÍNEA',

  /* Paleta — espejo de las CSS custom properties en style.css */
  colors: {
    primary:     '#1D4ED8',
    primaryDark: '#1E40AF',
    cyan:        '#0EA5E9',
    cyanDark:    '#0284C7',
    accent:      '#FF6A00',
    accentDark:  '#CC5400',
    white:       '#ffffff',
    gray50:      '#f8fafc',
    gray100:     '#f1f5f9',
    gray200:     '#e2e8f0',
    gray400:     '#94a3b8',
    gray500:     '#64748b',
    gray600:     '#475569',
    gray700:     '#334155',
    gray800:     '#1e293b',
    gray900:     '#0f172a',
  },

  /* ── SVG canónico: sobre fondo oscuro (header / footer)
        Círculo blanco + avión azul */
  get svgOnDark() {
    const p = this.colors.primary;
    return `<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <circle cx="18" cy="18" r="18" fill="#ffffff"/>
  <path d="M10 22 L18 8 L26 22 L18 19 Z" fill="${p}"/>
  <rect x="12" y="22" width="12" height="2.5" rx="1.25" fill="${p}"/>
</svg>`;
  },

  /* ── SVG canónico: sobre fondo claro (login / cards)
        Círculo azul + avión blanco */
  get svgOnLight() {
    const p = this.colors.primary;
    return `<svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <circle cx="22" cy="22" r="22" fill="${p}"/>
  <path d="M12 27 L22 10 L32 27 L22 23 Z" fill="#ffffff"/>
  <rect x="15" y="27" width="14" height="3" rx="1.5" fill="#ffffff"/>
</svg>`;
  },
};

/* ─── Sincronizar CSS custom properties ──────────────────────────────────── */
(function syncCSSVars() {
  const s = document.documentElement.style;
  const c = BRAND.colors;
  s.setProperty('--col-primary',      c.primary);
  s.setProperty('--col-primary-dark', c.primaryDark);
  s.setProperty('--col-cyan',         c.cyan);
  s.setProperty('--col-cyan-dark',    c.cyanDark);
  s.setProperty('--col-accent',       c.accent);
  s.setProperty('--col-accent-dark',  c.accentDark);
})();

/* ─── Inyección automática del logo en toda página ──────────────────────── */
document.addEventListener('DOMContentLoaded', function injectBrand() {

  /* Helper: reemplaza innerHTML solo si el nodo existe */
  function fill(selector, html) {
    document.querySelectorAll(selector).forEach(function (el) {
      el.innerHTML = html;
    });
  }

  /* ── Header: .logo-icon / .logo-text ── */
  fill('.logo-icon',  BRAND.svgOnDark);
  fill('.logo-text',
    `<span class="logo-brand">${BRAND.line1}</span>` +
    `<span class="logo-sub">${BRAND.line2}</span>`
  );

  /* ── Footer: .footer-logo-icon / .footer-logo-text ── */
  fill('.footer-logo-icon', BRAND.svgOnDark);
  fill('.footer-logo-text',
    `<span class="footer-logo-brand">${BRAND.line1}</span>` +
    `<span class="footer-logo-sub">${BRAND.line2}</span>`
  );

  /* ── Login mobile: .login-logo-icon / .login-logo-text ── */
  fill('.login-logo-icon', BRAND.svgOnLight);
  fill('.login-logo-text',
    `<span class="login-logo-brand">${BRAND.line1}</span>` +
    `<span class="login-logo-sub">${BRAND.line2}</span>`
  );

  /* ── Login brand panel (fondo oscuro): .login-brand-logo-icon / .login-brand-logo-text ── */
  fill('.login-brand-logo-icon', BRAND.svgOnDark);
  fill('.login-brand-logo-text',
    `<span class="login-brand-name">${BRAND.line1}</span>` +
    `<span class="login-brand-sub">${BRAND.line2}</span>`
  );
});

/* Exponer globalmente para uso desde otros scripts */
window.BRAND = BRAND;

/* ─── Modo oscuro ────────────────────────────────────────────── */
(function initDarkMode() {
  var DARK_VARS = {
    '--col-white':    '#0f172a',
    '--col-gray-50':  '#1e293b',
    '--col-gray-100': '#334155',
    '--col-gray-200': '#475569',
    '--col-gray-300': '#64748b',
    '--col-gray-400': '#94a3b8',
    '--col-gray-500': '#94a3b8',
    '--col-gray-600': '#cbd5e1',
    '--col-gray-700': '#e2e8f0',
    '--col-gray-800': '#f1f5f9',
    '--col-gray-900': '#f8fafc',
  };
  var LIGHT_VARS = {
    '--col-white':    '#ffffff',
    '--col-gray-50':  '#f8fafc',
    '--col-gray-100': '#f1f5f9',
    '--col-gray-200': '#e2e8f0',
    '--col-gray-300': '#cbd5e1',
    '--col-gray-400': '#94a3b8',
    '--col-gray-500': '#64748b',
    '--col-gray-600': '#475569',
    '--col-gray-700': '#334155',
    '--col-gray-800': '#1e293b',
    '--col-gray-900': '#0f172a',
  };

  function isDark() { return localStorage.getItem('ts-theme') === 'dark'; }

  function applyThemeVars(dark) {
    var vars = dark ? DARK_VARS : LIGHT_VARS;
    var s = document.documentElement.style;
    Object.keys(vars).forEach(function(k) { s.setProperty(k, vars[k]); });
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }

  function updateToggleIcons(dark) {
    var moon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    var sun  = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
    document.querySelectorAll('.dark-toggle').forEach(function(btn) {
      btn.innerHTML = dark ? sun : moon;
      btn.setAttribute('title', dark ? 'Modo claro' : 'Modo oscuro');
      btn.setAttribute('aria-label', dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
    });
  }

  window.toggleDarkMode = function() {
    var dark = !isDark();
    localStorage.setItem('ts-theme', dark ? 'dark' : 'light');
    applyThemeVars(dark);
    updateToggleIcons(dark);
  };

  /* Aplicar tema guardado inmediatamente (sin flash) */
  if (isDark()) applyThemeVars(true);

  /* Inyectar botón al final de .header-actions */
  document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.header-actions').forEach(function(actions) {
      var btn = document.createElement('button');
      btn.className = 'dark-toggle';
      btn.addEventListener('click', window.toggleDarkMode);
      actions.appendChild(btn);
    });
    updateToggleIcons(isDark());
  });
})();
