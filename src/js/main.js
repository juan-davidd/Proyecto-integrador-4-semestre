/* ============================================
   Terra Sky – main.js
   Lógica interactiva de la página principal
   ============================================ */

'use strict';

// ── Aeropuertos disponibles ──────────────────────────────────────────────────
const AIRPORTS = [
  { code: 'BOG', city: 'Bogotá',     name: 'El Dorado',           country: 'Colombia' },
  { code: 'MDE', city: 'Medellín',   name: 'José M. Córdova',     country: 'Colombia' },
  { code: 'CLO', city: 'Cali',       name: 'Alfonso B. Aragón',   country: 'Colombia' },
  { code: 'CTG', city: 'Cartagena',  name: 'Rafael Núñez',        country: 'Colombia' },
  { code: 'MAD', city: 'Madrid',     name: 'Barajas',             country: 'España' },
  { code: 'BCN', city: 'Barcelona',  name: 'El Prat',             country: 'España' },
  { code: 'JFK', city: 'Nueva York', name: 'John F. Kennedy',     country: 'EE. UU.' },
  { code: 'MIA', city: 'Miami',      name: 'Miami International', country: 'EE. UU.' },
];

// ── Estado del formulario ────────────────────────────────────────────────────
const state = {
  tripType:   'ida-vuelta',
  originCode: null,
  destCode:   null,
  passengers: { count: 1 },
  cabinClass: 'Económica',
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function qs(sel, ctx = document) { return ctx.querySelector(sel); }
function qsa(sel, ctx = document) { return [...ctx.querySelectorAll(sel)]; }

// ── Header: menú hamburguesa ─────────────────────────────────────────────────
(function initHamburger() {
  const btn = document.getElementById('hamburgerBtn');
  const nav = document.getElementById('mobileNav');
  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    const open = btn.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
    nav.hidden = !open;
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !nav.hidden) {
      nav.hidden = true;
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', false);
    }
  });
})();

// ── Header: selector de idioma ───────────────────────────────────────────────
(function initLangSelector() {
  const selector  = document.getElementById('langSelector');
  const btn       = document.getElementById('langBtn');
  const dropdown  = document.getElementById('langDropdown');
  const currentEl = document.getElementById('currentLang');
  if (!selector || !btn || !dropdown) return;

  btn.addEventListener('click', e => {
    e.stopPropagation();
    const open = dropdown.classList.toggle('show');
    dropdown.hidden = !open;
    btn.setAttribute('aria-expanded', open);
  });

  dropdown.addEventListener('click', e => {
    const langBtn = e.target.closest('[data-lang]');
    if (!langBtn) return;
    if (currentEl) currentEl.textContent = langBtn.dataset.lang;
    dropdown.classList.remove('show');
    dropdown.hidden = true;
    btn.setAttribute('aria-expanded', false);
  });

  document.addEventListener('click', e => {
    if (!selector.contains(e.target) && !dropdown.hidden) {
      dropdown.classList.remove('show');
      dropdown.hidden = true;
      btn.setAttribute('aria-expanded', false);
    }
  });
})();

// ── Formulario: toggle tipo de viaje ─────────────────────────────────────────
(function initTripToggle() {
  const btns        = qsa('.trip-btn');
  const returnField = document.getElementById('returnDateField');
  if (!btns.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      state.tripType = btn.dataset.trip;
      if (returnField) returnField.hidden = (state.tripType === 'solo-ida');
    });
  });
})();

// ── Formulario: autocomplete aeropuertos ─────────────────────────────────────
function setupAirportInput(inputId, dropdownId, stateKey) {
  const input    = document.getElementById(inputId);
  const dropdown = document.getElementById(dropdownId);
  if (!input || !dropdown) return;

  let focusedIdx = -1;

  function renderOptions(list) {
    dropdown.innerHTML = '';
    focusedIdx = -1;
    if (!list.length) { dropdown.hidden = true; return; }
    list.forEach((ap, i) => {
      const li = document.createElement('li');
      li.setAttribute('role', 'option');
      li.className    = 'airport-option';
      li.dataset.index = i;
      li.innerHTML  = `<span class="airport-code">${ap.code}</span><span class="airport-name">${ap.city} – ${ap.name}</span>`;
      li.addEventListener('mousedown', e => { e.preventDefault(); selectAirport(ap); });
      dropdown.appendChild(li);
    });
    dropdown.hidden = false;
  }

  function selectAirport(ap) {
    input.value     = `${ap.city} (${ap.code}) – ${ap.name}`;
    state[stateKey] = ap.code;
    dropdown.hidden = true;
  }

  function updateFocusClass() {
    qsa('.airport-option', dropdown).forEach((el, i) => el.classList.toggle('focused', i === focusedIdx));
  }

  function filterAirports(q) {
    return AIRPORTS.filter(ap =>
      ap.code.toLowerCase().includes(q) ||
      ap.city.toLowerCase().includes(q) ||
      ap.name.toLowerCase().includes(q)
    );
  }

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    state[stateKey] = null;
    renderOptions(q ? filterAirports(q) : []);
  });

  input.addEventListener('keydown', e => {
    const items = qsa('.airport-option', dropdown);
    if (dropdown.hidden || !items.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      focusedIdx = Math.min(focusedIdx + 1, items.length - 1);
      updateFocusClass();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      focusedIdx = Math.max(focusedIdx - 1, 0);
      updateFocusClass();
    } else if (e.key === 'Enter' && focusedIdx >= 0) {
      e.preventDefault();
      const ap = filterAirports(input.value.trim().toLowerCase())[focusedIdx];
      if (ap) selectAirport(ap);
    } else if (e.key === 'Escape') {
      dropdown.hidden = true;
    }
  });

  input.addEventListener('blur', () => setTimeout(() => { dropdown.hidden = true; }, 150));
}

setupAirportInput('originInput', 'originDropdown', 'originCode');
setupAirportInput('destInput',   'destDropdown',   'destCode');

// ── Formulario: swap origen / destino ────────────────────────────────────────
(function initSwap() {
  const swapBtn = document.getElementById('swapBtn');
  if (!swapBtn) return;
  swapBtn.addEventListener('click', () => {
    const originInput = document.getElementById('originInput');
    const destInput   = document.getElementById('destInput');
    if (!originInput || !destInput) return;
    const tmpVal  = originInput.value;
    const tmpCode = state.originCode;
    originInput.value = destInput.value;
    state.originCode  = state.destCode;
    destInput.value   = tmpVal;
    state.destCode    = tmpCode;
  });
})();

// ── Formulario: panel de pasajeros ────────────────────────────────────────────
(function initPassengers() {
  const trigger = document.getElementById('passengersTrigger');
  const panel   = document.getElementById('passengersPanel');
  const label   = document.getElementById('passengersLabel');
  const okBtn   = document.getElementById('passengersPanelOk');
  if (!trigger || !panel) return;

  function updateLabel() {
    const n = state.passengers.count;
    const pass = n === 1 ? '1 pasajero' : `${n} pasajeros`;
    if (label) label.textContent = `${pass} · ${state.cabinClass}`;
  }

  function renderCounters() {
    const valEl  = document.getElementById('passengersVal');
    if (valEl) valEl.textContent = state.passengers.count;
    const decBtn = qs('[data-type="passengers"][data-action="dec"]');
    if (decBtn) decBtn.disabled = state.passengers.count <= 1;
  }

  trigger.addEventListener('click', e => {
    e.stopPropagation();
    const open = panel.hidden;
    panel.hidden = !open;
    trigger.setAttribute('aria-expanded', !open);
    if (!open) renderCounters();
  });

  panel.addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const { action } = btn.dataset;
    state.passengers.count = action === 'inc'
      ? state.passengers.count + 1
      : Math.max(1, state.passengers.count - 1);
    renderCounters();
    updateLabel();
  });

  const cabinSel = document.getElementById('cabinClass');
  if (cabinSel) {
    cabinSel.addEventListener('change', () => { state.cabinClass = cabinSel.value; updateLabel(); });
  }

  if (okBtn) okBtn.addEventListener('click', () => {
    panel.hidden = true;
    trigger.setAttribute('aria-expanded', false);
  });

  document.addEventListener('click', e => {
    if (!panel.hidden && !panel.contains(e.target) && e.target !== trigger) {
      panel.hidden = true;
      trigger.setAttribute('aria-expanded', false);
    }
  });

  updateLabel();
  renderCounters();
})();

// ── Formulario: validación y búsqueda ────────────────────────────────────────
(function initSearch() {
  const btn       = document.getElementById('searchBtn');
  const errorEl   = document.getElementById('searchError');
  const departInp = document.getElementById('departDate');
  const returnInp = document.getElementById('returnDate');

  function showError(msg) {
    if (!errorEl) return;
    errorEl.textContent = msg;
    errorEl.hidden = false;
  }
  function clearError() {
    if (errorEl) errorEl.hidden = true;
  }

  if (departInp) {
    departInp.addEventListener('change', () => {
      if (returnInp) returnInp.min = departInp.value;
    });
  }

  if (!btn) return;
  btn.addEventListener('click', () => {
    clearError();
    if (!state.originCode)                                     { showError('Selecciona un aeropuerto de origen de la lista.');  return; }
    if (!state.destCode)                                       { showError('Selecciona un aeropuerto de destino de la lista.'); return; }
    if (state.originCode === state.destCode)                   { showError('El origen y el destino no pueden ser iguales.');    return; }
    if (departInp && !departInp.value)                         { showError('Selecciona una fecha de ida.');                     return; }
    if (state.tripType === 'ida-vuelta' && returnInp && !returnInp.value) {
      showError('Selecciona una fecha de vuelta.'); return;
    }

    const params = new URLSearchParams({
      tripType:    state.tripType,
      origen:      state.originCode,
      destino:     state.destCode,
      fechaIda:    departInp?.value   || '',
      fechaVuelta: returnInp?.value   || '',
      clase:       state.cabinClass,
      pasajeros:   state.passengers.count,
    });

    window.location.href = `resultados.html?${params.toString()}`;
  });
})();

// ── DOMContentLoaded: valores por defecto ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const today = new Date().toISOString().split('T')[0];
  const departInp = document.getElementById('departDate');
  const returnInp = document.getElementById('returnDate');
  if (departInp) { departInp.min = today; if (!departInp.value) departInp.value = today; }
  if (returnInp) {
    const d = new Date(); d.setDate(d.getDate() + 7);
    const vuelta = d.toISOString().split('T')[0];
    returnInp.min = today;
    if (!returnInp.value) returnInp.value = vuelta;
  }

  // ── Catálogo comercial unificado ──
  initCatalogo();
});

// ── Catálogo: renderizado y filtrado ─────────────────────────────────────────
function initCatalogo() {
  const grid = document.getElementById('catalogoGrid');
  if (!grid || typeof TSData === 'undefined') return;

  const tabs = qsa('.catalogo-tab');
  let currentFilter = 'oferta';

  function formatCOP(n) {
    try { return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n); }
    catch (e) { return 'COP ' + String(n); }
  }

  function renderCard(item) {
    const href = `resultados.html?origen=${item.origen}&destino=${item.destino}`;
    const badgeClass = item.tipo_badge === 'Internacional' ? 'cat-badge-intl' : 'cat-badge-nacl';
    const tipoLabel = item.tipo === 'oferta' ? 'Oferta' : item.tipo === 'paquete' ? 'Paquete' : 'Destino';
    const colorAttr = item.color ? ` data-color="${item.color}"` : '';

    let badges = `<span class="cat-badge cat-badge-tipo">${tipoLabel}</span>`;
    if (item.tipo_badge) badges += `<span class="cat-badge ${badgeClass}">${item.tipo_badge}</span>`;
    if (item.descuento) badges += `<span class="cat-badge cat-badge-desc">-${item.descuento}%</span>`;

    let stars = '';
    if (item.estrellas) stars = `<div class="cat-stars">${'★'.repeat(item.estrellas)}${'☆'.repeat(5 - item.estrellas)}</div>`;

    let includesHtml = '';
    if (item.incluye && item.incluye.length) {
      includesHtml = '<ul class="cat-includes">' + item.incluye.map(i =>
        `<li><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>${i}</li>`
      ).join('') + '</ul>';
    }

    let pricingHtml = '';
    if (item.precioOriginal) {
      pricingHtml = `<div class="cat-pricing"><span class="cat-price">${formatCOP(item.precio)}</span><span class="cat-original">${formatCOP(item.precioOriginal)}</span></div>`;
    } else {
      pricingHtml = `<div class="cat-pricing"><span class="cat-desde">desde</span><span class="cat-price">${formatCOP(item.precio)}</span></div>`;
    }

    let descHtml = item.descripcion ? `<p class="cat-desc">${item.descripcion}</p>` : '';

    return `<a href="${href}" class="cat-card"${colorAttr}>
      <div class="cat-card-img">
        <img src="${item.imagen}" alt="${item.titulo}" loading="lazy" />
        <div class="cat-overlay"></div>
        <div class="cat-badges">${badges}</div>
        ${stars}
      </div>
      <div class="cat-card-body">
        <h3>${item.titulo}</h3>
        <div class="cat-sub">${item.subtitulo || ''}</div>
        ${descHtml}
        ${includesHtml}
        ${pricingHtml}
      </div>
    </a>`;
  }

  function render(filter) {
    const items = TSData.getCatalogo(filter);
    grid.innerHTML = items.map(renderCard).join('');
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      currentFilter = tab.dataset.filter;
      render(currentFilter);
    });
  });

  render(currentFilter);
}
