/* Utilidades de interfaz: formato, plurales, toasts, panel lateral, modal, medidor de urgencia */
(function () {
  const LD = (window.LD = window.LD || {});
  LD.vistas = LD.vistas || {};

  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const plural = (n, uno, varios) => n + ' ' + (n === 1 ? uno : (varios || uno + 's'));
  const pad = n => String(n).padStart(2, '0');
  const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'set', 'oct', 'nov', 'dic'];
  const DIAS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

  function hora(t) { const d = new Date(t); return pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function fecha(t) { const d = new Date(t); return d.getDate() + ' ' + MESES[d.getMonth()]; }
  function fechaLarga(t) { const d = new Date(t); return DIAS[d.getDay()] + ' ' + d.getDate() + ' ' + MESES[d.getMonth()] + ' ' + d.getFullYear(); }
  function esHoy(t) { return new Date(t).toDateString() === new Date().toDateString(); }
  function cuando(t) {
    const m = Math.round((Date.now() - t) / 6e4);
    if (m < 1) return 'ahora';
    if (m < 60) return 'hace ' + plural(m, 'min', 'min');
    if (esHoy(t)) return 'hoy ' + hora(t);
    const ay = new Date(); ay.setDate(ay.getDate() - 1);
    if (new Date(t).toDateString() === ay.toDateString()) return 'ayer ' + hora(t);
    return fecha(t) + ' ' + hora(t);
  }
  function duracion(min) {
    min = Math.max(0, Math.round(min));
    if (min < 60) return min + ' min';
    const h = Math.floor(min / 60), m = min % 60;
    if (h < 24) return h + ' h' + (m ? ' ' + m + ' min' : '');
    const d = Math.floor(h / 24), hh = h % 24;
    return plural(d, 'día') + (hh ? ' ' + hh + ' h' : '');
  }
  const soles = n => 'S/ ' + Number(n).toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const nombreCorto = n => { const p = String(n || '').split(' '); return p[0] + (p[1] ? ' ' + p[1] : ''); };
  const iniciales = n => String(n || '?').split(' ').slice(0, 2).map(x => x[0]).join('');

  const ESTADOS = {
    asignado: { txt: 'Por atender', cls: 'st-new' },
    en_progreso: { txt: 'En atención', cls: 'st-prog' },
    en_espera: { txt: 'En espera', cls: 'st-wait' },
    resuelto: { txt: 'Resuelto', cls: 'st-ok' },
    cerrado: { txt: 'Cerrado', cls: 'st-closed' }
  };
  const PRIO = { P1: 'Crítica', P2: 'Alta', P3: 'Media', P4: 'Baja' };

  function prio(p, corto) {
    return '<span class="prio prio-' + p + '">' + LD.prioGlyph(p) + '<b>' + p + '</b>' + (corto ? '' : '<span>' + PRIO[p] + '</span>') + '</span>';
  }
  function estado(e) { const s = ESTADOS[e] || { txt: e, cls: '' }; return '<span class="estado ' + s.cls + '">' + s.txt + '</span>'; }
  function avatar(n, cls) { return '<span class="avatar ' + (cls || '') + '" aria-hidden="true">' + esc(iniciales(n)) + '</span>'; }

  /* Estado del SLA de un ticket: qué plazo corre y cuánto queda */
  function slaInfo(t) {
    const abierto = !['resuelto', 'cerrado'].includes(t.estado);
    if (!abierto) {
      const ok = t.resuelto <= t.venceResolucion;
      return { abierto, ok, txt: ok ? 'Dentro del plazo' : 'Fuera de plazo', nivel: ok ? 'ok' : 'bad', pct: 1 };
    }
    const enEspera = t.estado === 'en_espera';
    const meta = t.primeraRespuesta ? t.venceResolucion : t.venceRespuesta;
    const tipo = t.primeraRespuesta ? 'solución' : 'respuesta';
    const total = meta - t.creado, resta = meta - Date.now();
    const pct = Math.min(1, Math.max(0, 1 - resta / total));
    let nivel = 'ok';
    if (resta < 0) nivel = 'bad'; else if (pct > .75) nivel = 'warn';
    const txt = resta < 0 ? 'Vencido hace ' + duracion(-resta / 6e4) : 'Quedan ' + duracion(resta / 6e4);
    return { abierto, resta, pct, nivel, txt, tipo, enEspera };
  }
  function slaBar(t, compacto) {
    const s = slaInfo(t);
    if (!s.abierto) return '<span class="sla sla-' + s.nivel + '">' + LD.icon(s.ok ? 'check' : 'alert') + s.txt + '</span>';
    return '<span class="sla sla-' + s.nivel + '" title="Plazo de ' + s.tipo + '">' + (compacto ? '' : '<i style="--p:' + Math.round(s.pct * 100) + '%"></i>') + '<em>' + (s.nivel === 'bad' ? LD.icon('alert') : LD.icon('clock')) + s.txt + '</em></span>';
  }

  /* Medidor de urgencia: barra 0–100 con un segmento por factor y marcas de P3/P2/P1 */
  function medidor(tri, opts) {
    opts = opts || {};
    const u = LD.store.db.ajustes.umbrales;
    const segs = tri.factores.filter(f => f.pts > 0).map(f => '<span class="seg seg-' + f.clave + '" style="width:' + f.pts + '%" title="' + esc(f.etiqueta + ': ' + f.pts + ' pts') + '"></span>').join('');
    const marcas = [['P3', u.p3], ['P2', u.p2], ['P1', u.p1]].map(m => '<span class="umbral" style="left:' + m[1] + '%"><i></i>' + m[0] + '</span>').join('');
    const lista = opts.sinLista ? '' : '<ul class="factores">' + tri.factores.map(f =>
      '<li><span class="sw seg-' + f.clave + '"></span><b>' + esc(f.etiqueta) + '</b><span class="mot">' + esc(f.motivo) + '</span><span class="pts num">+' + f.pts + '<small>/' + f.peso + '</small></span></li>').join('') + '</ul>';
    return '<div class="medidor">' +
      '<div class="med-top"><span class="med-num num">' + tri.puntaje + '<small>/100</small></span>' + prio(tri.prioridad) + '<span class="nivel">N' + tri.nivel + '</span></div>' +
      '<div class="med-bar" role="img" aria-label="Puntaje de urgencia ' + tri.puntaje + ' de 100">' + segs + marcas + '</div>' + lista + '</div>';
  }

  /* Toasts */
  function toast(msg, tipo) {
    let box = document.getElementById('toasts');
    if (!box) { box = document.createElement('div'); box.id = 'toasts'; box.setAttribute('role', 'status'); box.setAttribute('aria-live', 'polite'); document.body.appendChild(box); }
    const el = document.createElement('div');
    el.className = 'toast toast-' + (tipo || 'ok');
    el.innerHTML = LD.icon(tipo === 'error' ? 'alert' : tipo === 'info' ? 'bolt' : 'check') + '<span>' + esc(msg) + '</span>';
    box.appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 300); }, 3600);
  }

  /* Panel lateral (detalle). En celular ocupa toda la pantalla. */
  let panelPrev = null;
  function panel(html, onClose) {
    cerrarPanel();
    panelPrev = document.activeElement;
    const w = document.createElement('div');
    w.className = 'panel-wrap';
    w.innerHTML = '<div class="panel-bg" data-close></div><aside class="panel" role="dialog" aria-modal="true" tabindex="-1">' + html + '</aside>';
    document.body.appendChild(w);
    document.body.classList.add('no-scroll');
    requestAnimationFrame(() => w.classList.add('in'));
    w.addEventListener('click', e => { if (e.target.closest('[data-close]')) cerrarPanel(); });
    w._onClose = onClose;
    w.querySelector('.panel').focus();
    return w.querySelector('.panel');
  }
  function cerrarPanel() {
    const w = document.querySelector('.panel-wrap');
    if (!w) return;
    if (w._onClose) w._onClose();
    w.remove();
    document.body.classList.remove('no-scroll');
    if (panelPrev && panelPrev.focus) panelPrev.focus();
  }

  function modal(titulo, cuerpo, botones) {
    return new Promise(res => {
      const d = document.createElement('dialog');
      d.className = 'modal';
      d.innerHTML = '<form method="dialog"><h3>' + esc(titulo) + '</h3><div class="modal-body">' + cuerpo + '</div><div class="modal-acc">' +
        (botones || [['cancelar', 'Cancelar', 'btn-line'], ['ok', 'Aceptar', 'btn-primary']]).map(b => '<button class="btn ' + b[2] + '" value="' + b[0] + '">' + b[1] + '</button>').join('') + '</div></form>';
      document.body.appendChild(d);
      d.addEventListener('close', () => { const v = d.returnValue; const data = new FormData(d.querySelector('form')); d.remove(); res({ v, data }); });
      d.showModal();
    });
  }

  function vacio(ic, titulo, texto, accion) {
    return '<div class="vacio">' + LD.icon(ic) + '<h3>' + esc(titulo) + '</h3>' + (texto ? '<p>' + esc(texto) + '</p>' : '') + (accion || '') + '</div>';
  }

  /* Gráfico de barras SVG simple, accesible */
  function barras(datos, opts) {
    opts = opts || {};
    const max = Math.max(1, ...datos.map(d => d.v));
    const h = opts.alto || 160;
    return '<div class="barras' + (opts.horizontal ? ' horiz' : '') + '" style="--h:' + h + 'px">' + datos.map(d =>
      '<div class="b" title="' + esc(d.l + ': ' + (d.fmt || d.v)) + '"><span class="bv num">' + esc(d.fmt || d.v) + '</span><span class="bb" style="--v:' + (d.v / max * 100).toFixed(1) + ';' + (d.color ? 'background:' + d.color : '') + '"></span><span class="bl">' + esc(d.l) + '</span></div>').join('') + '</div>';
  }

  LD.ui = { esc, plural, hora, fecha, fechaLarga, cuando, duracion, soles, esHoy, nombreCorto, iniciales, prio, estado, avatar, slaInfo, slaBar, medidor, toast, panel, cerrarPanel, modal, vacio, barras, ESTADOS, PRIO };
})();
