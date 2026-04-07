'use strict';

/* Utilidades globales compartidas entre dashboards */
(function(glob){
  function getCurrentUser(redirectIfMissing=true, allowedRoles){
    try{
      const raw = sessionStorage.getItem('ts_user');
      const user = raw ? JSON.parse(raw) : null;
      if(!user && redirectIfMissing){ location.href = 'login.html'; return null; }
      if(user && Array.isArray(allowedRoles) && allowedRoles.length && !allowedRoles.includes(user.role)){
        if(redirectIfMissing){ location.href = 'login.html'; return null; }
      }
      return user;
    }catch(e){ if(redirectIfMissing) location.href='login.html'; return null; }
  }

  function setUserNames(user){
    if(!user) return;
    var name = user.name || (user.email?user.email.split('@')[0]: 'Usuario');
    var first = String(name).split(' ')[0];
    var sb = document.getElementById('sidebarName');
    var sbm = document.getElementById('sidebarNameMobile');
    var tb = document.getElementById('topbarName');
    var welcome = document.getElementById('welcomeTitle');
    if(sb) sb.textContent = name;
    if(sbm) sbm.textContent = name;
    if(tb) tb.textContent = first;
    if(welcome) welcome.textContent = '¡Hola, ' + first + '! 👋';
    var topbarDate = document.getElementById('topbarDate');
    if(topbarDate) topbarDate.textContent = 'Terra Sky · ' + new Date().toLocaleDateString('es-CO', { dateStyle: 'long' });
  }

  function formatCurrencyCOP(n){
    try{ return n.toLocaleString('es-CO') + ' COP'; }catch(e){ return String(n) + ' COP'; }
  }

  function updateStat(elId, value){
    var el = document.getElementById(elId);
    if(el) el.textContent = value;
  }

  function setupSidebarToggle(){
    var overlay = document.getElementById('sidebarOverlay');
    var mobile = document.getElementById('mobileSidebar');
    var toggle = document.getElementById('menuToggle');
    if(toggle && overlay && mobile){
      toggle.addEventListener('click', function(){ overlay.classList.add('open'); mobile.classList.add('open'); });
      overlay.addEventListener('click', function(){ overlay.classList.remove('open'); mobile.classList.remove('open'); });
    }
  }

  function attachLogout(btnId){
    var btn = document.getElementById(btnId);
    if(!btn) return;
    btn.addEventListener('click', function(){ sessionStorage.removeItem('ts_user'); location.href='index.html'; });
  }

  function renderReservations(containerId, reservas, opts){
    var container = document.getElementById(containerId);
    if(!container) return;
    opts = opts || {};
    var link = opts.link || null;
    container.innerHTML = reservas.map(function(r){
      var bc = r.estado==='Confirmada'?'badge-green':r.estado==='Reservada'?'badge-yellow':'badge-red';
      var valor = typeof r.valor === 'number' ? formatCurrencyCOP(r.valor) : (r.valor||'');
      var href = link ? ("onclick=\"location.href='"+link+"'\"") : '';
      return '<div class="reserva-row" '+href+ '><div class="reserva-row-left"><span class="reserva-brand">Terra Sky</span><div><div class="reserva-route">'+(r.vuelo||r.ruta||'')+'</div><div class="reserva-meta">'+(r.codigo||'')+' · '+(r.fecha||'')+'</div></div></div><div class="reserva-row-right"><div class="reserva-price">'+valor+'</div><span class="badge '+bc+'">'+(r.estado||'')+'</span></div></div>';
    }).join('');
  }

  function renderHistorial(containerId, historial){
    var container = document.getElementById(containerId);
    if(!container) return;
    container.innerHTML = historial.map(function(h){
      var stars = h.estrellas? '⭐'.repeat(h.estrellas) : '';
      return '<div class="reserva-row"><div class="reserva-row-left"><span class="reserva-brand">Terra Sky</span><div><div class="reserva-route">'+(h.ruta||'')+'</div><div class="reserva-meta">'+(h.codigo||'')+' · '+(h.fecha||'')+' · '+(h.duracion||'')+'</div></div></div><div class="reserva-row-right"><div style="color:#eab308;font-size:.85rem">'+stars+'</div></div></div>';
    }).join('');
  }

  function renderPendientes(containerId, pendientes, opts){
    var container = document.getElementById(containerId);
    if(!container) return;
    opts = opts || {};
    container.innerHTML = pendientes.map(function(r){
      var valor = typeof r.valor === 'number' ? formatCurrencyCOP(r.valor) : (r.valor||'');
      return '<div class="item-row item-row-pending"><div class="item-row-left"><span class="item-brand">Terra Sky</span><div><div class="item-name">'+(r.cliente||'')+'</div><div class="item-meta">'+(r.codigo||'')+' · '+(r.vuelo||'')+'</div></div></div><div class="item-row-right"><span class="item-price">'+valor+'</span><button class="btn-confirm">Confirmar</button></div></div>';
    }).join('');
    // attach confirm handlers
    container.querySelectorAll('.btn-confirm').forEach(function(b, i){
      b.addEventListener('click', function(ev){
        ev.stopPropagation();
        var res = pendientes[i];
        if(res) res.estado = 'Confirmada';
        // update UI
        renderPendientes(containerId, pendientes, opts);
      });
    });
  }

  function renderFlights(containerId, vuelos){
    var container = document.getElementById(containerId);
    if(!container) return;
    container.innerHTML = vuelos.map(function(v){
      var bc = v.estado==='En vuelo'?'badge-blue':v.estado==='Programado'?'badge-green':'badge-gray';
      return '<div class="item-row item-row-flight"><div class="item-row-left"><span class="item-brand">Terra Sky</span><div><div class="item-name">'+(v.codigo||'')+' · '+(v.ruta||'')+'</div><div class="item-meta">'+(v.hora||'')+' · '+(v.aeronave||'')+'</div></div></div><div class="item-row-right"><span class="badge '+bc+'">'+(v.estado||'')+'</span></div></div>';
    }).join('');
  }

  /* ══════════════════════════════════════════════
     TOAST NOTIFICATIONS
     ══════════════════════════════════════════════ */
  function ensureToastContainer(){
    var c = document.getElementById('ts-toast-container');
    if(c) return c;
    c = document.createElement('div');
    c.id = 'ts-toast-container';
    c.style.cssText = 'position:fixed;top:20px;right:20px;z-index:100000;display:flex;flex-direction:column;gap:10px;pointer-events:none;max-width:380px;width:100%';
    document.body.appendChild(c);
    return c;
  }

  var TOAST_ICONS = {
    success: '<svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M20 6L9 17l-5-5"/></svg>',
    error:   '<svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="#dc2626" stroke-width="2" stroke-linecap="round" d="M18 6L6 18M6 6l12 12"/></svg>',
    warning: '<svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="#d97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.29 3.86l-8.8 15.32A2 2 0 003.23 22h17.54a2 2 0 001.74-2.82l-8.8-15.32a2 2 0 00-3.42 0z"/></svg>',
    info:    '<svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#2563eb" stroke-width="2"/><path stroke="#2563eb" stroke-width="2" stroke-linecap="round" d="M12 16v-4m0-4h.01"/></svg>'
  };
  var TOAST_COLORS = {
    success: { bg:'#f0fdf4', border:'#bbf7d0', text:'#15803d' },
    error:   { bg:'#fef2f2', border:'#fecaca', text:'#dc2626' },
    warning: { bg:'#fffbeb', border:'#fde68a', text:'#92400e' },
    info:    { bg:'#eff6ff', border:'#bfdbfe', text:'#1e40af' }
  };

  function showToast(msg, type, duration){
    type = type || 'success';
    duration = duration || 4000;
    var c = ensureToastContainer();
    var col = TOAST_COLORS[type] || TOAST_COLORS.info;
    var icon = TOAST_ICONS[type] || TOAST_ICONS.info;
    var el = document.createElement('div');
    el.style.cssText = 'pointer-events:auto;display:flex;align-items:center;gap:10px;padding:14px 18px;border-radius:10px;background:'+col.bg+';border:1px solid '+col.border+';color:'+col.text+';font-size:.9rem;font-family:Inter,sans-serif;box-shadow:0 4px 16px rgba(0,0,0,.08);opacity:0;transform:translateX(30px);transition:all .3s ease';
    el.innerHTML = icon + '<span style="flex:1">'+msg+'</span><button style="background:none;border:none;cursor:pointer;color:'+col.text+';font-size:1.2rem;line-height:1;padding:0 0 0 8px" aria-label="Cerrar">&times;</button>';
    el.querySelector('button').addEventListener('click', function(){ removeToast(el); });
    c.appendChild(el);
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ el.style.opacity='1'; el.style.transform='translateX(0)'; }); });
    var timeout = setTimeout(function(){ removeToast(el); }, duration);
    el._timeout = timeout;
  }

  function removeToast(el){
    if(!el || !el.parentNode) return;
    clearTimeout(el._timeout);
    el.style.opacity='0'; el.style.transform='translateX(30px)';
    setTimeout(function(){ if(el.parentNode) el.parentNode.removeChild(el); }, 300);
  }

  /* ══════════════════════════════════════════════
     CONFIRM MODAL
     ══════════════════════════════════════════════ */
  function showConfirmModal(title, message, onConfirm, opts){
    opts = opts || {};
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:100001;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .25s ease';
    var card = document.createElement('div');
    card.style.cssText = 'background:#fff;border-radius:14px;padding:28px 30px 22px;max-width:420px;width:90%;box-shadow:0 8px 32px rgba(0,0,0,.18);font-family:Inter,sans-serif;transform:scale(.92);transition:transform .25s ease';
    var confirmColor = opts.danger ? '#dc2626' : 'var(--col-primary,#0B3D91)';
    card.innerHTML = '<h3 style="margin:0 0 8px;font-size:1.15rem;color:#111">'+title+'</h3><p style="margin:0 0 22px;color:#555;font-size:.92rem;line-height:1.5">'+message+'</p><div style="display:flex;gap:10px;justify-content:flex-end"><button class="ts-modal-cancel" style="padding:10px 22px;border-radius:8px;border:1px solid #d1d5db;background:#fff;color:#555;cursor:pointer;font-size:.9rem;transition:background .2s">Cancelar</button><button class="ts-modal-confirm" style="padding:10px 22px;border-radius:8px;border:none;background:'+confirmColor+';color:#fff;cursor:pointer;font-size:.9rem;transition:background .2s">'+(opts.confirmText||'Confirmar')+'</button></div>';
    overlay.appendChild(card);
    document.body.appendChild(overlay);
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ overlay.style.opacity='1'; card.style.transform='scale(1)'; }); });
    function close(){ overlay.style.opacity='0'; card.style.transform='scale(.92)'; setTimeout(function(){ if(overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 250); }
    card.querySelector('.ts-modal-cancel').addEventListener('click', close);
    overlay.addEventListener('click', function(ev){ if(ev.target===overlay) close(); });
    card.querySelector('.ts-modal-confirm').addEventListener('click', function(){ close(); if(typeof onConfirm==='function') onConfirm(); });
  }

  /* ══════════════════════════════════════════════
     LOADING SKELETON
     ══════════════════════════════════════════════ */
  function showLoading(containerId){
    var el = document.getElementById(containerId);
    if(!el) return;
    el.dataset.prevHtml = el.innerHTML;
    el.innerHTML = '<div style="display:flex;flex-direction:column;gap:14px;padding:12px 0">' +
      [1,2,3].map(function(){ return '<div style="background:linear-gradient(90deg,#e5e7eb 25%,#f3f4f6 50%,#e5e7eb 75%);background-size:200% 100%;animation:ts-shimmer 1.5s infinite;height:56px;border-radius:10px"></div>'; }).join('') +
      '</div>';
    if(!document.getElementById('ts-shimmer-style')){
      var s = document.createElement('style');
      s.id = 'ts-shimmer-style';
      s.textContent = '@keyframes ts-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}';
      document.head.appendChild(s);
    }
  }

  function hideLoading(containerId){
    var el = document.getElementById(containerId);
    if(!el) return;
    if(el.dataset.prevHtml !== undefined){ el.innerHTML = el.dataset.prevHtml; delete el.dataset.prevHtml; }
  }

  /* ══════════════════════════════════════════════
     ANIMATE COUNTER
     ══════════════════════════════════════════════ */
  function animateCounter(elId, target, duration){
    var el = document.getElementById(elId);
    if(!el) return;
    duration = duration || 800;
    var start = 0;
    var startTime = null;
    function tick(ts){
      if(!startTime) startTime = ts;
      var prog = Math.min((ts - startTime)/duration, 1);
      var val = Math.round(prog * target);
      el.textContent = val.toLocaleString('es-CO');
      if(prog < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ══════════════════════════════════════════════
     FORMAT DATE
     ══════════════════════════════════════════════ */
  function formatDate(dateStr){
    try{
      var d = new Date(dateStr);
      return d.toLocaleDateString('es-CO', { day:'numeric', month:'short', year:'numeric' });
    }catch(e){ return dateStr; }
  }

  /* ══════════════════════════════════════════════
     EXPORTS
     ══════════════════════════════════════════════ */
  glob.getCurrentUser = getCurrentUser;
  glob.setUserNames = setUserNames;
  glob.formatCurrencyCOP = formatCurrencyCOP;
  glob.updateStat = updateStat;
  glob.setupSidebarToggle = setupSidebarToggle;
  glob.attachLogout = attachLogout;
  glob.renderReservations = renderReservations;
  glob.renderHistorial = renderHistorial;
  glob.renderPendientes = renderPendientes;
  glob.renderFlights = renderFlights;
  glob.showToast = showToast;
  glob.showConfirmModal = showConfirmModal;
  glob.showLoading = showLoading;
  glob.hideLoading = hideLoading;
  glob.animateCounter = animateCounter;
  glob.formatDate = formatDate;
})(window);
