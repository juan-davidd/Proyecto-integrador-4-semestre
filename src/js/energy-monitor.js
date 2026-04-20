/* ============================================================
   Terra Sky – energy-monitor.js
   Monitor de consumo energético real del dispositivo / servidor.
   Métricas: Potencia [W], Energía [J/Wh], Calor disipado [J],
             Corriente [A], Eficiencia η [%], Batería, CPU.
   Atajo: escribe /cmt en cualquier página de la app.
   ============================================================ */
'use strict';

(function () {

  /* ── Detector de secuencia /cmt ──────────────────────────── */
  var TRIGGER = '/cmt';
  var seqBuf  = '';
  var seqTmr  = null;

  document.addEventListener('keydown', function (e) {
    var tag      = (document.activeElement || {}).tagName || '';
    var editable = document.activeElement && document.activeElement.isContentEditable;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) || editable) { seqBuf = ''; return; }
    if (e.key.length === 1) seqBuf += e.key;
    if (!TRIGGER.startsWith(seqBuf)) seqBuf = e.key.length === 1 ? e.key : '';
    if (seqTmr) clearTimeout(seqTmr);
    seqTmr = setTimeout(function () { seqBuf = ''; }, 2000);
    if (seqBuf === TRIGGER) { seqBuf = ''; togglePanel(); }
  });

  /* ── Constantes físicas de referencia ───────────────────── */
  var BAT_CAPACITY_WH = 50;    // Capacidad batería típica laptop [Wh]
  var BAT_ETA         = 0.90;  // Eficiencia química Li-Ion (~90%)
  var CPU_TDP_W       = 15;    // TDP típico laptop [W]
  var V_BUS_DC        = 19.5;  // Tensión bus DC laptop [V]
  var ETA_UTIL        = 0.38;  // Eficiencia útil procesador (~38%)

  /* ── Estado de la sesión ─────────────────────────────────── */
  var sessionStart    = Date.now();
  var battery         = null;
  var cpuLoadEst      = 0;
  var updateInterval  = null;
  var panel           = null;
  var isOpen          = false;
  var energyAccJ      = 0;     // Energía acumulada por integración numérica [J]
  var lastAccTime     = Date.now();
  var lastPowerW      = null;

  /* ── Battery API ─────────────────────────────────────────── */
  if (navigator.getBattery) {
    navigator.getBattery().then(function (bat) {
      battery = bat;
      ['levelchange','chargingchange','dischargingtimechange','chargingtimechange']
        .forEach(function (ev) { bat.addEventListener(ev, function () { if (isOpen) renderMetrics(); }); });
    }).catch(function () { battery = null; });
  }

  /* ── Integración numérica de energía en sesión ───────────── */
  function accumulateEnergy(P_W) {
    if (P_W === null || P_W <= 0) return;
    var now = Date.now();
    var dt_s = (now - lastAccTime) / 1000;
    if (dt_s > 0 && dt_s < 300) energyAccJ += P_W * dt_s;
    lastAccTime = now;
    lastPowerW  = P_W;
  }

  /* ── Benchmark de carga CPU ──────────────────────────────── */
  function estimateCPULoad() {
    var ITER = 1500000;
    var t0   = performance.now();
    var d    = 0;
    for (var i = 1; i < ITER; i++) d += Math.log(i) * Math.sqrt(i);
    var elapsed = performance.now() - t0;
    // referencia empírica: ~10ms sin carga → >90ms en carga alta
    cpuLoadEst = Math.min(99, Math.max(1, Math.round((elapsed / 90) * 100)));
    return d; // evitar que el compilador elimine el bucle
  }

  /* ── Calcular métricas físicas ───────────────────────────── */
  function getPhysics() {
    var t_s = (Date.now() - sessionStart) / 1000;

    /* —— Potencia eléctrica P [W] —— */
    var P_W    = null;
    var P_src  = null;

    if (battery && !battery.charging
        && battery.dischargingTime && isFinite(battery.dischargingTime)
        && battery.dischargingTime > 0) {
      // P = E_restante / t_restante   →   E_rest[Wh] × 3600 / t[s]
      var E_rest_Wh = BAT_CAPACITY_WH * battery.level * BAT_ETA;
      P_W   = (E_rest_Wh * 3600) / battery.dischargingTime;
      P_src = 'Battery API — descarga activa';
    } else {
      // Estimación por benchmark de CPU: P_cpu ≈ TDP × (carga/100), más periféricos
      P_W   = CPU_TDP_W * (cpuLoadEst / 100) * 1.35;
      P_src = 'Estimado · benchmark CPU';
    }

    accumulateEnergy(P_W);

    /* —— Energía en sesión [J] y [Wh] —— */
    var E_J  = energyAccJ;
    var E_Wh = E_J / 3600;

    /* —— Calor disipado (Efecto Joule) [J] —— */
    // Q = P_disipada × t;  P_disip = P × (1 − η_útil)
    var P_disip = P_W !== null ? P_W * (1 - ETA_UTIL) : null;
    var Q_J     = P_disip !== null ? P_disip * t_s : null;

    /* —— Corriente estimada [A] — Ley de Ohm/Potencia —— */
    var I_A = P_W !== null ? P_W / V_BUS_DC : null;
    // Resistencia aparente R = V²/P
    var R_ohm = (P_W !== null && P_W > 0) ? (V_BUS_DC * V_BUS_DC) / P_W : null;

    /* —— Energía libre restante en batería —— */
    var E_bat_Wh = battery ? BAT_CAPACITY_WH * battery.level * BAT_ETA : null;
    var E_bat_J  = E_bat_Wh !== null ? E_bat_Wh * 3600 : null;

    return {
      P_W: P_W, P_src: P_src,
      E_J: E_J, E_Wh: E_Wh,
      Q_J: Q_J, P_disip: P_disip,
      I_A: I_A, R_ohm: R_ohm,
      V_BUS: V_BUS_DC,
      eta_pct: Math.round(ETA_UTIL * 100),
      t_s: t_s,
      cpuLoad: cpuLoadEst,
      P_cpu_W: P_W !== null ? P_W * (cpuLoadEst / 100) : null,
      bat: battery,
      E_bat_Wh: E_bat_Wh, E_bat_J: E_bat_J,
      cores: navigator.hardwareConcurrency || null
    };
  }

  /* ── Helpers de formato ──────────────────────────────────── */
  function fmtW(v)  { return v === null ? '—' : v.toFixed(2) + ' W'; }
  function fmtA(v)  { return v === null ? '—' : v.toFixed(3) + ' A'; }
  function fmtOhm(v){ return v === null ? '—' : v.toFixed(1) + ' Ω'; }
  function fmtJ(v)  {
    if (v === null) return '—';
    if (Math.abs(v) < 1000) return v.toFixed(1) + ' J';
    return (v / 1000).toFixed(3) + ' kJ';
  }
  function fmtWh(v) { return v === null ? '—' : v.toFixed(4) + ' Wh'; }
  function fmtTime(s) {
    if (!s || !isFinite(s) || s <= 0) return '—';
    var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
    return h > 0 ? h + ' h ' + m + ' min' : m + ' min ' + Math.floor(s % 60) + ' s';
  }
  function clr(v, lo, hi) {
    // verde si v < lo, amarillo si < hi, rojo si >= hi
    if (v === null) return '#94a3b8';
    return v < lo ? '#22c55e' : v < hi ? '#f59e0b' : '#ef4444';
  }
  function batClr(pct) {
    return pct > 50 ? '#22c55e' : pct > 20 ? '#f59e0b' : '#ef4444';
  }

  /* ── Tarjeta expandida activa ───────────────────────────── */
  var expandedCardKey = null;
  var cpuTick         = 0;

  /* ── Construir panel (una sola vez) ──────────────────────── */
  function buildPanel() {
    if (panel) return;

    if (!document.getElementById('cmt-styles')) {
      var s = document.createElement('style');
      s.id  = 'cmt-styles';
      s.textContent = [
        '@keyframes cmtFadeIn  {from{opacity:0}to{opacity:1}}',
        '@keyframes cmtSlideUp {from{transform:translateY(14px);opacity:0}to{transform:translateY(0);opacity:1}}',
        /* overlay */
        '#cmt-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);backdrop-filter:blur(6px);',
        '  -webkit-backdrop-filter:blur(6px);z-index:99998;',
        '  display:flex;align-items:center;justify-content:center;animation:cmtFadeIn .18s ease;}',
        /* panel — dark */
        '#cmt-panel{background:#0f172a;color:#f1f5f9;border-radius:1rem;width:min(540px,96vw);',
        '  max-height:92vh;overflow-y:auto;',
        '  box-shadow:0 32px 64px -8px rgba(0,0,0,.75),0 0 0 1px rgba(59,130,246,.18);',
        '  font-family:"Inter",system-ui,-apple-system,sans-serif;font-size:14px;',
        '  border:1px solid #1e293b;animation:cmtSlideUp .22s ease;}',
        '#cmt-panel::-webkit-scrollbar{width:4px}',
        '#cmt-panel::-webkit-scrollbar-track{background:#080d18}',
        '#cmt-panel::-webkit-scrollbar-thumb{background:#334155;border-radius:99px}',
        '#cmt-panel button{cursor:pointer;transition:opacity .15s,background .15s;}',
        '#cmt-panel button:hover{opacity:.82;}',
        /* secciones */
        '.cmt-sec{padding:0 18px 14px;}',
        '.cmt-sec-ttl{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;',
        '  color:#60a5fa;padding:12px 18px 8px;border-top:1px solid #1e293b;',
        '  display:flex;align-items:center;gap:6px;}',
        '.cmt-sec-ttl::before{content:"";display:inline-block;width:3px;height:12px;',
        '  background:#3b82f6;border-radius:2px;flex-shrink:0;}',
        '.cmt-sec-ttl:first-of-type{border-top:none;}',
        '.cmt-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;align-items:start;}',
        /* card */
        '.cmt-card{background:#1e293b;border:1px solid #334155;border-radius:.75rem;',
        '  overflow:hidden;cursor:pointer;transition:border-color .15s,background .15s;}',
        '.cmt-card:hover{border-color:#3b82f6;background:#1a2744;}',
        '.cmt-card.active{border-color:#3b82f6;background:#1a2744;}',
        '.cmt-card.no-expand{cursor:default;}',
        '.cmt-card.no-expand:hover{border-color:#334155;background:#1e293b;}',
        '.cmt-card-head{padding:11px 13px;}',
        '.cmt-lbl{font-size:10px;color:#475569;margin-bottom:4px;',
        '  text-transform:uppercase;letter-spacing:.4px;font-weight:600;}',
        '.cmt-val{font-weight:700;font-size:15px;line-height:1.2;}',
        /* expandir */
        '.cmt-expand{display:none;padding:10px 13px 12px;border-top:1px solid #1e293b;background:#080d18;}',
        '.cmt-expand.open{display:block;}',
        '.cmt-proj-title{font-size:9px;font-weight:700;letter-spacing:.7px;text-transform:uppercase;',
        '  color:#3b82f6;margin-bottom:6px;}',
        '.cmt-proj-row{display:flex;justify-content:space-between;align-items:center;',
        '  padding:4px 0;border-bottom:1px solid #0f172a;font-size:11px;}',
        '.cmt-proj-row:last-child{border-bottom:none;}',
        '.cmt-proj-lbl{color:#475569;}',
        '.cmt-proj-val{color:#e2e8f0;font-weight:600;font-variant-numeric:tabular-nums;}'
      ].join('\n');
      document.head.appendChild(s);
    }

    var wrap = document.createElement('div');
    wrap.id  = 'cmt-overlay';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.setAttribute('aria-label', 'Monitor de consumo energetico');
    wrap.innerHTML = [
      '<div id="cmt-panel">',
      /* Cabecera */
      '<div style="background:linear-gradient(135deg,#0B3D91 0%,#1357C0 100%);padding:14px 18px 12px;display:flex;align-items:center;gap:12px;position:sticky;top:0;z-index:1;border-radius:1rem 1rem 0 0;">',
      '  <div style="width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;flex-shrink:0;">',
      '    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
      '  </div>',
      '  <div style="flex:1;min-width:0;">',
      '    <div style="font-weight:700;font-size:14px;color:#ffffff;letter-spacing:.2px;">Consumo Energetico</div>',
      '    <div id="cmt-sub" style="font-size:10px;color:rgba(255,255,255,.7);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"></div>',
      '  </div>',
      '  <button id="cmt-close" style="background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.25);color:#ffffff;width:27px;height:27px;border-radius:.5rem;font-size:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0;" aria-label="Cerrar">&#x2715;</button>',
      '</div>',
      /* Cuerpo dinámico */
      '<div id="cmt-body"></div>',
      /* Pie — solo reloj de sesión */
      '<div style="padding:8px 18px;background:#080d18;border-top:1px solid #1e293b;text-align:center;position:sticky;bottom:0;border-radius:0 0 1rem 1rem;">',
      '  <span style="font-size:10px;color:#334155;">sesion activa:&nbsp;<span id="cmt-clock" style="color:#475569;font-variant-numeric:tabular-nums;"></span></span>',
      '</div>',
      '</div>'
    ].join('');

    panel = wrap;
    document.body.appendChild(panel);
    panel.querySelector('#cmt-close').addEventListener('click', closePanel);
    /* delegación de clic para expandir tarjetas */
    panel.querySelector('#cmt-body').addEventListener('click', function (e) {
      var c = e.target.closest('.cmt-card');
      if (!c || c.classList.contains('no-expand')) return;
      var exp = c.querySelector('.cmt-expand');
      if (!exp) return;
      var wasOpen = exp.classList.contains('open');
      panel.querySelectorAll('.cmt-expand.open').forEach(function (el) { el.classList.remove('open'); });
      panel.querySelectorAll('.cmt-card.active').forEach(function (el) { el.classList.remove('active'); });
      if (!wasOpen) {
        exp.classList.add('open');
        c.classList.add('active');
        expandedCardKey = c.dataset.key || null;
      } else {
        expandedCardKey = null;
      }
    });
    panel.addEventListener('click', function (e) { if (e.target === panel) closePanel(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen) closePanel();
    });
  }

  /* ── Proyecciones de consumo a partir de potencia [W] ───── */
  function buildPowerProjections(pw_W) {
    var rows = [
      { lbl: 'En 1 segundo', J: pw_W * 1 },
      { lbl: 'En 1 minuto',  J: pw_W * 60 },
      { lbl: 'En 1 hora',    J: pw_W * 3600 },
      { lbl: 'En 1 dia',     J: pw_W * 86400 },
      { lbl: 'En 1 mes',     J: pw_W * 2592000 },
      { lbl: 'En 1 año',     J: pw_W * 31536000 }
    ];
    var html = '<div class="cmt-proj-title">Energia consumida al ritmo actual</div>';
    rows.forEach(function (r) {
      var Wh = r.J / 3600;
      var val;
      if (r.J < 1000)     val = r.J.toFixed(2)   + ' J';
      else if (Wh < 1)    val = (Wh * 1000).toFixed(1) + ' mWh';
      else if (Wh < 1000) val = Wh.toFixed(3)     + ' Wh';
      else                 val = (Wh / 1000).toFixed(4) + ' kWh';
      html += '<div class="cmt-proj-row">'
            + '<span class="cmt-proj-lbl">' + r.lbl + '</span>'
            + '<span class="cmt-proj-val">' + val + '</span>'
            + '</div>';
    });
    return html;
  }

  /* ── Proyección autonomía de batería ─────────────────────── */
  function buildBatteryAutonomy(E_bat_Wh, P_W) {
    var secs = (E_bat_Wh / P_W) * 3600;
    var html = '<div class="cmt-proj-title">Autonomia estimada al consumo actual (' + fmtW(P_W) + ')</div>';
    html += '<div class="cmt-proj-row"><span class="cmt-proj-lbl">Tiempo restante</span>'
          + '<span class="cmt-proj-val">' + fmtTime(secs) + '</span></div>';
    /* Cuánto queda en cada umbral */
    var levels = [75, 50, 25, 10];
    levels.forEach(function (pct) {
      var s = (E_bat_Wh * (pct / 100) / P_W) * 3600;
      html += '<div class="cmt-proj-row">'
            + '<span class="cmt-proj-lbl">Hasta ' + pct + '% carga</span>'
            + '<span class="cmt-proj-val">' + fmtTime(s) + '</span></div>';
    });
    return html;
  }

  /* ── Card HTML ─────────────────────────────────────────────
     expand: null = no expandible | Number = buildPowerProjections(W)
             | String = HTML personalizado                        */
  function card(key, lbl, val, expand, color) {
    var proj = '';
    if (typeof expand === 'number' && expand > 0) proj = buildPowerProjections(expand);
    else if (typeof expand === 'string' && expand) proj = expand;
    var expandable = proj ? '' : 'style="cursor:default;"';
    return [
      '<div class="cmt-card' + (proj ? '' : ' no-expand') + '" data-key="' + key + '" ' + expandable + '>',
      '  <div class="cmt-card-head">',
      '    <div class="cmt-lbl">' + lbl + '</div>',
      '    <div class="cmt-val" style="color:' + (color || '#e2e8f0') + ';">' + val + '</div>',
      '  </div>',
      proj ? '<div class="cmt-expand">' + proj + '</div>' : '',
      '</div>'
    ].join('');
  }

  /* ── Renderizar métricas ─────────────────────────────────── */
  function renderMetrics() {
    if (!panel) return;
    var m    = getPhysics();
    var page = location.pathname.split('/').pop() || 'index.html';

    panel.querySelector('#cmt-sub').textContent =
      page + ' · ' + new Date().toLocaleTimeString('es-CO') + ' · ' + fmtTime(m.t_s);
    panel.querySelector('#cmt-clock').textContent = fmtTime(m.t_s);

    var b = '';

    /* ── 1. Potencia eléctrica ──────────────────────────────
       · Potencia [W]         → proyección de energía (P·t)
       · Corriente [A]        → solo lectura (no proyectable a energía)
       · Resistencia [Ω]      → solo lectura
       · Calor disipado [W]   → proyección de energía disipada
    ────────────────────────────────────────────────────── */
    b += '<div class="cmt-sec-ttl">Potencia electrica instantanea</div>';
    b += '<div class="cmt-sec"><div class="cmt-grid">';
    b += card('potencia-sistema',   'Potencia del sistema',      fmtW(m.P_W),     m.P_W,     clr(m.P_W, 15, 45));
    b += card('corriente-estimada', 'Corriente estimada',        fmtA(m.I_A),     null,      '#0099E6');
    b += card('resistencia',        'Resistencia aparente',      fmtOhm(m.R_ohm), null,      '#7c3aed');
    b += card('potencia-calor',     'Potencia disipada (calor)', fmtW(m.P_disip), m.P_disip, '#FF6A00');
    b += '</div></div>';

    /* ── 2. Energía en sesión ───────────────────────────────
       · Energía J / Wh acumulada → proyección de gasto futuro al ritmo actual
       · Calor acumulado [J]       → proyección de calor futuro al ritmo actual
       · Eficiencia [%]            → solo lectura (no es energía)
    ────────────────────────────────────────────────────── */
    b += '<div class="cmt-sec-ttl">Energia consumida en la sesion</div>';
    b += '<div class="cmt-sec"><div class="cmt-grid">';
    b += card('energia-j',   'Energia acumulada [J]',        fmtJ(m.E_J),         m.P_W,     '#60a5fa');
    b += card('energia-wh',  'Energia acumulada [Wh]',       fmtWh(m.E_Wh),       m.P_W,     '#3b82f6');
    b += card('calor-joule', 'Calor disipado (Efecto Joule)', fmtJ(m.Q_J),        m.P_disip, '#FF6A00');
    b += card('eficiencia',  'Eficiencia energetica η',      m.eta_pct + ' %',    null,      '#16a34a');
    b += '</div></div>';

    /* ── 3. Fuente de alimentación ──────────────────────────
       · Nivel [%]          → solo lectura (porcentaje)
       · Energia restante   → autonomía estimada al consumo actual
    ────────────────────────────────────────────────────── */
    b += '<div class="cmt-sec-ttl">Fuente de alimentacion</div>';
    b += '<div class="cmt-sec"><div class="cmt-grid">';
    if (m.bat && m.bat.level !== undefined) {
      var pct  = Math.round(m.bat.level * 100);
      var cBat = batClr(pct);
      var bSt  = m.bat.charging
        ? 'Cargando — carga completa en ' + fmtTime(m.bat.chargingTime)
        : 'Descargando — autonomia ' + fmtTime(m.bat.dischargingTime);
      /* nivel %: no proyectable como energía */
      b += card('bat-nivel', 'Nivel de bateria', pct + ' %', null, cBat);
      /* energía restante: autonomía estimada al ritmo actual */
      var batExpandHtml = (m.E_bat_Wh !== null && m.P_W > 0)
        ? buildBatteryAutonomy(m.E_bat_Wh, m.P_W)
        : null;
      b += card('bat-restante', 'Energia restante (' + bSt + ')', fmtWh(m.E_bat_Wh) + ' / ' + fmtJ(m.E_bat_J), batExpandHtml, '#0099E6');
    } else {
      b += '<div class="cmt-card no-expand" data-key="alimentacion" style="grid-column:span 2;cursor:default;">';
      b += '<div class="cmt-card-head">';
      b += '<div class="cmt-lbl">Modo de alimentacion</div>';
      b += '<div class="cmt-val" style="color:#475569;">CA — Corriente alterna de red</div>';
      b += '</div></div>';
    }
    b += '</div></div>';

    /* ── 4. Procesador ──────────────────────────────────────
       · Carga [%]      → solo lectura
       · Potencia [W]   → proyección de energía CPU
    ────────────────────────────────────────────────────── */
    b += '<div class="cmt-sec-ttl">Procesador</div>';
    b += '<div class="cmt-sec"><div class="cmt-grid">';
    b += card('cpu-carga',    'Carga CPU estimada',    m.cpuLoad + ' %', null,         clr(m.cpuLoad, 30, 70));
    b += card('cpu-potencia', 'Potencia CPU estimada', fmtW(m.P_cpu_W), m.P_cpu_W,   '#0099E6');
    b += '</div></div>';

    panel.querySelector('#cmt-body').innerHTML = b;

    /* restaurar tarjeta expandida tras re-render */
    if (expandedCardKey) {
      var activeCard = panel.querySelector('[data-key="' + expandedCardKey + '"]');
      if (activeCard) {
        var activeExp = activeCard.querySelector('.cmt-expand');
        if (activeExp) { activeExp.classList.add('open'); activeCard.classList.add('active'); }
      }
    }
  }

  /* ── Abrir / cerrar panel ────────────────────────────────── */
  function openPanel() {
    buildPanel();
    panel.hidden = false;
    isOpen = true;
    document.body.style.overflow = 'hidden';
    lastAccTime = Date.now();
    estimateCPULoad();
    renderMetrics();
    cpuTick = 0;
    updateInterval = setInterval(function () {
      if (!isOpen) return;
      cpuTick++;
      /* Re-estima CPU cada 20 s para no bloquear el hilo principal */
      if (cpuTick % 20 === 0) estimateCPULoad();
      renderMetrics();
    }, 1000);
    panel.querySelector('#cmt-close').focus();
  }

  function closePanel() {
    if (!panel) return;
    panel.hidden = true;
    isOpen = false;
    document.body.style.overflow = '';
    if (updateInterval) { clearInterval(updateInterval); updateInterval = null; }
  }

  function togglePanel() {
    if (!isOpen) openPanel(); else closePanel();
  }

})();
