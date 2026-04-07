'use strict';

(function initAuthUI() {
  const STORAGE_KEY = 'ts_user';
  const user = safeReadUser();
  const currentPage = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const protectedPages = new Set([]);

  if (protectedPages.has(currentPage) && !user) {
    const next = encodeURIComponent(currentPage);
    location.replace('login.html?next=' + next);
    return;
  }

  if (currentPage === 'login.html') return;

  updateHeaderActions(user);

  document.addEventListener('click', function (e) {
    const logoutBtn = e.target.closest('[data-action="logout"]');
    if (!logoutBtn) return;
    e.preventDefault();
    sessionStorage.removeItem(STORAGE_KEY);
    location.href = 'index.html';
  });

  function safeReadUser() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function updateHeaderActions(currentUser) {
    if (!currentUser) return;

    const displayName = String(currentUser.name || currentUser.email || 'Usuario');
    const roleText = String(currentUser.role || 'cliente');
    const headerActions = document.querySelector('.header-actions');
    const mobileBtns = document.querySelector('.mobile-nav-btns');

    // Determinar URL del dashboard según rol
    const dashboardURL = currentUser.role === 'admin' ? 'dashboard-admin.html' : 
                         currentUser.role === 'agente' ? 'dashboard-agente.html' : 
                         'dashboard-cliente.html';

    if (headerActions) {
      headerActions.innerHTML =
        '<a href="' + dashboardURL + '" class="btn btn-outline-white btn-sm" style="cursor:pointer; text-decoration: none;">' +
        'Hola, ' + displayName +
        '</a>' +
        '<a href="#" class="btn btn-white btn-sm" data-action="logout">Cerrar sesión</a>';
    }

    if (mobileBtns) {
      mobileBtns.innerHTML =
        '<a href="' + dashboardURL + '" class="btn btn-outline-white" style="justify-content:center;text-decoration:none;flex:1">' +
        displayName +
        '</a>' +
        '<a href="#" class="btn btn-white" style="justify-content:center;flex:1" data-action="logout">Cerrar sesión</a>';
    }
  }
})();