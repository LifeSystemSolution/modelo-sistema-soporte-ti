/* Arranque: sesión por rol (?demo=empleado|tecnico|jefe), navegación, tema, atajos */
(function () {
  const LD = (window.LD = window.LD || {});
  LD.vistas = LD.vistas || {};
  const { esc, icon } = { esc: LD.ui.esc, icon: LD.icon };

  const ROLES = {
    empleado: { persona: () => LD.store.db.personas.find(p => p.demo === 'empleado'), etiqueta: 'Empleado', nav: ['asistente', 'mis-tickets', 'mi-equipo'], inicio: 'asistente' },
    tecnico: { persona: () => LD.store.persona('T4'), etiqueta: 'Técnico', nav: ['cola', 'tickets', 'equipos', 'mantenimiento', 'kb'], inicio: 'cola' },
    jefe: { persona: () => LD.store.persona('T1'), etiqueta: 'Jefa de TI', nav: ['tablero', 'tickets', 'reportes', 'equipos', 'mantenimiento', 'kb', 'asistente', 'ajustes'], inicio: 'tablero' }
  };
  LD.ROLES = ROLES;

  function tema(t) {
    if (t) localStorage.setItem('lifedesk-tema', t);
    const v = localStorage.getItem('lifedesk-tema') || 'light';
    document.documentElement.dataset.theme = v;
    const b = document.getElementById('btn-tema');
    if (b) { b.innerHTML = icon(v === 'dark' ? 'sun' : 'moon'); b.setAttribute('aria-label', v === 'dark' ? 'Usar modo claro' : 'Usar modo oscuro'); }
  }

  function rolInicial() {
    const q = new URLSearchParams(location.search).get('demo');
    if (q && ROLES[q]) { sessionStorage.setItem('lifedesk-rol', q); return q; }
    return sessionStorage.getItem('lifedesk-rol');
  }

  function iniciarSesion(rol) {
    const p = ROLES[rol].persona();
    LD.sesion = { rol, personaId: p.id, nombre: p.nombre, cargo: p.cargo, persona: p };
    document.body.dataset.rol = rol;
  }

  function puede(vista) { return LD.sesion && ROLES[LD.sesion.rol].nav.includes(vista); }
  LD.puede = puede;

  function pintarNav() {
    const r = ROLES[LD.sesion.rol];
    const items = r.nav.map(v => {
      const def = LD.vistas[v];
      if (!def) return '';
      const badge = def.badge ? def.badge() : 0;
      return '<a href="#/' + v + '" data-v="' + v + '">' + icon(def.icono) + '<span>' + esc(def.menu || def.titulo) + '</span>' + (badge ? '<em class="num">' + badge + '</em>' : '') + '</a>';
    }).join('');
    document.getElementById('nav').innerHTML = items;
    // barra inferior en celular: hasta 4 + "Más"
    const tb = document.getElementById('tabbar');
    const prim = r.nav.slice(0, 4);
    tb.innerHTML = prim.map(v => { const d = LD.vistas[v]; return '<a href="#/' + v + '" data-v="' + v + '">' + icon(d.icono) + '<span>' + esc(d.corto || d.menu || d.titulo) + '</span></a>'; }).join('') +
      '<button type="button" id="tab-mas">' + icon('menu') + '<span>Más</span></button>';
    document.getElementById('tab-mas').onclick = abrirMas;
    const u = LD.sesion;
    document.getElementById('side-user').innerHTML = LD.ui.avatar(u.nombre) + '<div><b>' + esc(LD.ui.nombreCorto(u.nombre)) + '</b><span>' + esc(u.cargo) + '</span></div>';
    document.getElementById('btn-sim').hidden = u.rol === 'empleado';
  }

  function abrirMas() {
    const r = ROLES[LD.sesion.rol];
    const p = LD.ui.panel('<div class="panel-h"><h2>Menú</h2><button class="btn btn-ghost btn-icon" data-close aria-label="Cerrar">' + icon('x') + '</button></div><div class="panel-c mas-menu">' +
      r.nav.map(v => { const d = LD.vistas[v]; return '<a href="#/' + v + '" data-close>' + icon(d.icono) + esc(d.menu || d.titulo) + '</a>'; }).join('') +
      '<hr><a href="#" data-cambiar data-close>' + icon('swap') + 'Cambiar de rol</a><a href="index.html">' + icon('arrowL') + 'Volver a la presentación</a></div>');
    p.querySelector('[data-cambiar]').onclick = e => { e.preventDefault(); salir(); };
  }

  function ruta() {
    const h = location.hash.replace(/^#\/?/, '');
    const [v, qs] = h.split('?');
    return { vista: v, params: new URLSearchParams(qs || '') };
  }
  LD.ir = (v, params) => { location.hash = '#/' + v + (params ? '?' + new URLSearchParams(params) : ''); };

  function render() {
    if (!LD.sesion) return;
    LD.ui.cerrarPanel();
    let { vista, params } = ruta();
    if (!puede(vista)) { vista = ROLES[LD.sesion.rol].inicio; history.replaceState(null, '', '#/' + vista); }
    const def = LD.vistas[vista];
    document.getElementById('titulo').textContent = def.titulo;
    document.title = def.titulo + ' · LifeDesk';
    document.querySelectorAll('#nav a, #tabbar a').forEach(a => a.classList.toggle('on', a.dataset.v === vista));
    // nodo nuevo en cada render: así no se acumulan los eventos de la vista anterior
    const viejo = document.getElementById('vista');
    const el = viejo.cloneNode(false);
    viejo.replaceWith(el);
    el.className = 'vista v-' + vista;
    def.render(el, params);
    document.getElementById('main').scrollTop = 0;
    window.scrollTo(0, 0);
  }
  LD.refrescar = () => { pintarNav(); render(); };
  LD.refrescarNav = () => { pintarNav(); const { vista } = ruta(); document.querySelectorAll('#nav a, #tabbar a').forEach(a => a.classList.toggle('on', a.dataset.v === vista)); };

  function salir() {
    sessionStorage.removeItem('lifedesk-rol');
    LD.sesion = null;
    history.replaceState(null, '', location.pathname);
    mostrarSelector();
  }

  function mostrarSelector() {
    document.body.classList.add('en-selector');
    const s = document.getElementById('selector');
    s.hidden = false;
    const card = (rol, titulo, desc, ic) => '<button class="rol" data-rol="' + rol + '">' + LD.illus(ic, 56) + '<span><b>' + titulo + '</b><span>' + desc + '</span></span>' + icon('arrowR') + '</button>';
    const db = LD.store.db;
    s.innerHTML = '<div class="sel-box"><a class="marca" href="index.html">' + logo() + '</a>' +
      '<h1>¿Con qué rol quieres entrar?</h1><p class="sel-sub">Demo de mesa de ayuda TI para <b>' + esc(db.empresa.razon) + '</b>, empresa ficticia con ' + db.personas.length + ' personas.</p>' +
      '<div class="roles">' +
      card('empleado', 'Empleado', 'Rosa, de Contabilidad: pide ayuda al asistente y sigue sus tickets.', 'cuenta') +
      card('tecnico', 'Técnico', 'Luis, técnico de campo N2: atiende su cola ordenada por urgencia.', 'equipo') +
      card('jefe', 'Jefa de TI', 'Carla: tablero, tiempos, reportes de ahorro y reglas de prioridad.', 'servidor') +
      '</div><p class="sel-nota">' + icon('alert') + 'Todo es simulado: no se envían mensajes ni se consulta RENIEC de verdad.</p></div>';
    s.querySelectorAll('[data-rol]').forEach(b => b.onclick = () => {
      sessionStorage.setItem('lifedesk-rol', b.dataset.rol);
      history.replaceState(null, '', location.pathname + '?demo=' + b.dataset.rol);
      entrar(b.dataset.rol);
    });
  }

  function logo() {
    return '<svg class="logo" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="7" fill="var(--brand)"/><path d="M9 8v13.5h7" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M18.5 14.5h2.8a3.5 3.5 0 0 1 0 7h-2.8z" stroke="#fff" stroke-width="2.6" stroke-linejoin="round" fill="none"/></svg><span class="logo-t">Life<b>Desk</b></span>';
  }
  LD.logo = logo;

  function entrar(rol) {
    iniciarSesion(rol);
    document.getElementById('selector').hidden = true;
    document.body.classList.remove('en-selector');
    pintarNav();
    if (!location.hash) location.hash = '#/' + ROLES[rol].inicio; else render();
  }

  function atajos(e) {
    if (!LD.sesion || e.ctrlKey || e.metaKey || e.altKey) return;
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) {
      if (e.key === 'Escape') e.target.blur();
      return;
    }
    if (e.key === 'Escape') { LD.ui.cerrarPanel(); return; }
    if (e.key === '/') { const s = document.querySelector('#vista [data-buscar]'); if (s) { e.preventDefault(); s.focus(); } }
    if (e.key === 'n' || e.key === 'N') { if (puede('asistente')) { e.preventDefault(); LD.ir('asistente'); } }
    if (e.key === '?') { e.preventDefault(); ayudaAtajos(); }
  }
  function ayudaAtajos() {
    LD.ui.modal('Atajos de teclado', '<dl class="atajos"><dt><kbd>/</kbd></dt><dd>Buscar en la pantalla</dd><dt><kbd>N</kbd></dt><dd>Pedir ayuda / nuevo ticket</dd><dt><kbd>Esc</kbd></dt><dd>Cerrar el detalle</dd><dt><kbd>?</kbd></dt><dd>Ver esta ayuda</dd></dl>', [['ok', 'Entendido', 'btn-dark']]);
  }

  function init() {
    tema();
    LD.store.init();
    document.getElementById('side-logo').innerHTML = logo();
    document.getElementById('btn-tema').onclick = () => tema(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
    document.getElementById('btn-salir').onclick = salir;
    document.getElementById('btn-atajos').onclick = ayudaAtajos;
    document.getElementById('btn-sim').onclick = () => { const t = LD.tickets.simularEntrante(); LD.ui.toast('Llegó ' + t.id + ' · ' + t.prioridad + ': ' + t.titulo, 'info'); LD.refrescar(); };
    window.addEventListener('hashchange', render);
    document.addEventListener('keydown', atajos);
    const rol = rolInicial();
    if (rol && ROLES[rol]) entrar(rol); else mostrarSelector();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
