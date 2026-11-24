/* Tickets: creación, cola del técnico, lista general, mis tickets, detalle con SLA, escalamiento y acta */
(function () {
  const LD = (window.LD = window.LD || {});
  const U = LD.ui, I = LD.icon, S = () => LD.store;
  const ABIERTOS = ['asignado', 'en_progreso', 'en_espera'];
  const abierto = t => ABIERTOS.includes(t.estado);

  /* ---------- Lógica ---------- */
  function crear(o) {
    const db = S().db;
    const p = S().persona(o.empleadoId);
    const ahora = o.fecha || Date.now();
    const tri = o.triaje || LD.triaje.calcular({ alcance: o.alcance, bloqueo: o.bloqueo, areaId: p.areaId, texto: o.titulo + ' ' + (o.descripcion || ''), empleadoId: p.id, categoria: o.categoria, fecha: ahora });
    const tecnicoId = LD.triaje.asignar(o.categoria, tri.nivel);
    const sla = LD.triaje.sla(tri.prioridad, ahora);
    const tec = S().persona(tecnicoId);
    const t = {
      id: 'TK-' + String(S().nextId('ticket')).padStart(5, '0'), titulo: o.titulo, descripcion: o.descripcion || '', categoria: o.categoria,
      empleadoId: p.id, areaId: p.areaId, equipoId: p.equipoId, alcance: o.alcance, bloqueo: o.bloqueo, canal: o.canal || 'portal', creado: ahora,
      puntaje: tri.puntaje, prioridad: tri.prioridad, nivel: tri.nivel, factores: tri.factores, seguridad: tri.seguridad, kbIntentado: o.kbId || null,
      tecnicoId, venceRespuesta: sla.respuesta, venceResolucion: sla.resolucion, primeraRespuesta: null, resuelto: null, cerrado: null,
      estado: 'asignado', satisfaccion: null, notas: [], intentos: o.intentos || [],
      eventos: [{ t: ahora, txt: o.canal === 'asistente' ? 'Creado por el asistente (no se resolvió con los pasos)' : 'Creado por ' + (o.canal || 'portal') }, { t: ahora, txt: 'Asignado automáticamente a ' + (tec ? tec.nombre : '—') + ' (N' + tri.nivel + ')' }]
    };
    db.tickets.push(t);
    S().save();
    return t;
  }

  const SIM = [
    ['impresora', 'La impresora de Ventas no imprime', 'Tenemos cola de boletas y no sale nada.', 'area', 'parcial'],
    ['servidor', 'La facturación no envía a SUNAT', 'Desde hace 20 minutos las facturas quedan pendientes.', 'area', 'total'],
    ['cuenta', 'Olvidé mi contraseña de Windows', 'Volví de vacaciones y no recuerdo la clave.', 'yo', 'total'],
    ['reuniones', 'No se escucha en Teams', 'Tengo reunión con un cliente en 15 minutos.', 'yo', 'parcial'],
    ['seguridad', 'Hice clic en un enlace raro', 'Abrí un correo del "banco" y se descargó un archivo.', 'yo', 'parcial'],
    ['red', 'El internet está muy lento en el área', 'Las páginas demoran mucho en cargar.', 'area', 'parcial']
  ];
  function simularEntrante(idx) {
    const db = S().db;
    const s = SIM[idx >= 0 && idx < SIM.length ? idx : Math.floor(Math.random() * SIM.length)];
    const emp = db.personas.filter(p => !p.tecnico);
    let e = emp[Math.floor(Math.random() * emp.length)];
    if (s[0] === 'servidor') e = emp.find(p => p.areaId === 'VEN') || e;
    const t = crear({ empleadoId: e.id, categoria: s[0], titulo: s[1], descripcion: s[2], alcance: s[3], bloqueo: s[4], canal: 'asistente' });
    S().log('Ticket entrante (simulado)', t.id + ' · ' + t.prioridad);
    S().save();
    return t;
  }

  function evento(t, txt) { t.eventos.push({ t: Date.now(), txt }); }
  function tomar(t) {
    if (!t.primeraRespuesta) t.primeraRespuesta = Date.now();
    if (t.tecnicoId !== LD.sesion.personaId && LD.sesion.rol === 'tecnico') t.tecnicoId = LD.sesion.personaId;
    t.estado = 'en_progreso';
    evento(t, U.nombreCorto(LD.sesion.nombre) + ' tomó el ticket');
    S().save();
  }
  function resolver(t, solucion) {
    if (!t.primeraRespuesta) t.primeraRespuesta = Date.now();
    t.estado = 'resuelto'; t.resuelto = Date.now();
    t.notas.push({ t: Date.now(), autor: LD.sesion.nombre, txt: solucion, interna: false });
    evento(t, 'Resuelto por ' + U.nombreCorto(LD.sesion.nombre) + ' · se avisó al usuario por WhatsApp (simulado)');
    S().save();
  }
  function escalar(t) {
    if (t.nivel >= 3) return false;
    t.nivel++;
    const antes = S().persona(t.tecnicoId);
    t.tecnicoId = LD.triaje.asignar(t.categoria, t.nivel);
    const nuevo = S().persona(t.tecnicoId);
    t.estado = 'asignado';
    evento(t, 'Escalado a N' + t.nivel + ': de ' + U.nombreCorto(antes && antes.nombre) + ' a ' + U.nombreCorto(nuevo && nuevo.nombre));
    S().log('Escaló ticket', t.id + ' a N' + t.nivel);
    S().save();
    return true;
  }

  /* ---------- Vistas de lista ---------- */
  function fila(t, opts) {
    opts = opts || {};
    const e = S().persona(t.empleadoId), a = S().area(t.areaId), tec = S().persona(t.tecnicoId);
    return '<button type="button" class="tk' + (t.prioridad === 'P1' && abierto(t) ? ' critico' : '') + '" data-tk="' + t.id + '">' +
      '<span class="tk-p">' + U.prio(t.prioridad, true) + '<span class="tk-id num">' + t.id + '</span></span>' +
      '<span class="tk-t"><b>' + U.esc(t.titulo) + '</b><span>' + U.esc(U.nombreCorto(e && e.nombre)) + ' · ' + U.esc(a ? a.nombre : '') + ' · ' + U.cuando(t.creado) + '</span></span>' +
      '<span class="tk-e">' + U.estado(t.estado) + '</span>' +
      '<span class="tk-s">' + U.slaBar(t) + '</span>' +
      '<span class="tk-tec">' + (tec ? U.avatar(tec.nombre, 'gris') + '<span>' + U.esc(U.nombreCorto(tec.nombre)) + '</span>' : '—') + '</span>' +
      '</button>';
  }
  function cabecera() { return '<div class="tk tk-cab" aria-hidden="true"><span>Prioridad</span><span>Problema</span><span>Estado</span><span>Plazo (SLA)</span><span class="tk-tec">Técnico</span></div>'; }
  function lista(tks, vacioHtml) {
    if (!tks.length) return '<div class="lista">' + vacioHtml + '</div>';
    return '<div class="lista">' + cabecera() + tks.map(t => fila(t)).join('') + '</div>';
  }
  function ordenUrgencia(a, b) {
    const sa = U.slaInfo(a), sb = U.slaInfo(b);
    return (a.prioridad > b.prioridad ? 1 : a.prioridad < b.prioridad ? -1 : 0) || (sa.resta - sb.resta);
  }
  function enlazar(el) {
    el.addEventListener('click', e => { const b = e.target.closest('[data-tk]'); if (b) detalle(b.dataset.tk); });
  }

  // Cola del técnico
  LD.vistas.cola = {
    titulo: 'Mi cola', icono: 'queue', corto: 'Cola',
    badge: () => S().db.tickets.filter(t => t.tecnicoId === LD.sesion.personaId && abierto(t)).length,
    render(el) {
      const me = LD.sesion.personaId;
      const mios = S().db.tickets.filter(t => t.tecnicoId === me && abierto(t)).sort(ordenUrgencia);
      const vencidos = mios.filter(t => U.slaInfo(t).nivel === 'bad').length;
      const hoyRes = S().db.tickets.filter(t => t.resuelto && U.esHoy(t.resuelto) && t.tecnicoId === me).length;
      const sig = mios[0];
      el.innerHTML =
        '<div class="kpis"><div class="kpi"><span>En mi cola</span><b class="num">' + mios.length + '</b><small>' + U.plural(mios.filter(t => t.estado === 'asignado').length, 'sin tomar', 'sin tomar') + '</small></div>' +
        '<div class="kpi' + (vencidos ? ' kpi-mal' : '') + '"><span>Fuera de plazo</span><b class="num">' + vencidos + '</b><small>' + (vencidos ? 'Atiende estos primero' : 'Todo a tiempo') + '</small></div>' +
        '<div class="kpi"><span>Resueltos hoy</span><b class="num">' + hoyRes + '</b><small>El día empieza en 0</small></div>' +
        '<div class="kpi"><span>Mi nivel</span><b>N' + LD.sesion.persona.nivel + '</b><small>' + U.esc(LD.sesion.cargo) + '</small></div></div>' +
        (sig ? '<section class="sec"><div class="sec-h"><h2>Atiende ahora</h2><p>Ordenado por prioridad y por el plazo que queda</p></div><div class="lista">' + fila(sig) + '</div></section>' : '') +
        '<section class="sec"><div class="sec-h"><h2>Siguientes</h2><p>' + U.plural(Math.max(0, mios.length - 1), 'ticket') + '</p></div>' +
        lista(mios.slice(1), U.vacio('check', 'No tienes más tickets', 'Cuando llegue uno nuevo aparecerá aquí, ya ordenado por urgencia.')) + '</section>';
      enlazar(el);
    }
  };

  // Lista general con filtros
  LD.vistas.tickets = {
    titulo: 'Tickets', icono: 'ticket',
    render(el, params) {
      const f = { estado: params.get('estado') || 'abiertos', prio: params.get('prio') || '', q: '' };
      el.innerHTML = '<div class="fila entre"><label class="buscar">' + I('search') + '<span class="sr-only">Buscar</span><input type="search" data-buscar placeholder="Buscar por código, problema o persona"><kbd>/</kbd></label>' +
        '<div class="chips" id="f-est">' + [['abiertos', 'Abiertos'], ['vencidos', 'Fuera de plazo'], ['hoy', 'De hoy'], ['cerrados', 'Resueltos'], ['todos', 'Todos']].map(c => '<button class="chip" data-e="' + c[0] + '">' + c[1] + '</button>').join('') + '</div></div>' +
        '<div class="chips sec" style="margin-top:12px" id="f-prio"><button class="chip" data-p="">Toda prioridad</button>' + ['P1', 'P2', 'P3', 'P4'].map(p => '<button class="chip" data-p="' + p + '">' + LD.prioGlyph(p) + p + ' ' + U.PRIO[p] + '</button>').join('') + '</div>' +
        '<p class="muted" id="t-cuenta" style="margin:14px 0 8px"></p><div id="t-lista"></div>';
      const pintar = () => {
        let ts = S().db.tickets.slice();
        if (f.estado === 'abiertos') ts = ts.filter(abierto);
        if (f.estado === 'vencidos') ts = ts.filter(t => abierto(t) && U.slaInfo(t).nivel === 'bad');
        if (f.estado === 'hoy') ts = ts.filter(t => U.esHoy(t.creado));
        if (f.estado === 'cerrados') ts = ts.filter(t => !abierto(t));
        if (f.prio) ts = ts.filter(t => t.prioridad === f.prio);
        if (f.q) {
          const q = f.q.toLowerCase();
          ts = ts.filter(t => (t.id + ' ' + t.titulo + ' ' + (S().persona(t.empleadoId) || {}).nombre + ' ' + (S().area(t.areaId) || {}).nombre).toLowerCase().includes(q));
        }
        ts.sort(f.estado === 'abiertos' || f.estado === 'vencidos' ? ordenUrgencia : (a, b) => b.creado - a.creado);
        const total = ts.length;
        el.querySelector('#t-cuenta').textContent = U.plural(total, 'ticket') + (total > 60 ? ' · mostrando los 60 primeros' : '');
        el.querySelector('#t-lista').innerHTML = lista(ts.slice(0, 60), U.vacio('search', 'No hay tickets con estos filtros', f.estado === 'hoy' ? 'Hoy todavía no llega ninguno. Usa «Simular ticket» arriba para ver cómo entra uno.' : 'Prueba con otro filtro o borra la búsqueda.'));
        el.querySelectorAll('#f-est .chip').forEach(c => c.classList.toggle('on', c.dataset.e === f.estado));
        el.querySelectorAll('#f-prio .chip').forEach(c => c.classList.toggle('on', c.dataset.p === f.prio));
      };
      el.querySelector('#f-est').onclick = e => { const c = e.target.closest('[data-e]'); if (c) { f.estado = c.dataset.e; pintar(); } };
      el.querySelector('#f-prio').onclick = e => { const c = e.target.closest('[data-p]'); if (c) { f.prio = c.dataset.p; pintar(); } };
      el.querySelector('[data-buscar]').oninput = e => { f.q = e.target.value.trim(); pintar(); };
      enlazar(el);
      pintar();
      let id = params.get('id');
      // ?sim=N crea un ticket entrante de ejemplo (1 = facturación SUNAT caída) y lo abre
      if (params.get('sim')) { const t = simularEntrante(Number(params.get('sim'))); history.replaceState(null, '', '#/tickets'); LD.refrescarNav && LD.refrescarNav(); pintar(); id = t.id; }
      // ?id=primero abre el ticket abierto más urgente (útil para enlaces y capturas)
      if (id === 'primero') { const t = S().db.tickets.filter(abierto).sort(ordenUrgencia)[0]; id = t && t.id; }
      if (id) detalle(id);
    }
  };

  // Mis tickets (empleado)
  LD.vistas['mis-tickets'] = {
    titulo: 'Mis tickets', icono: 'ticket', corto: 'Tickets',
    badge: () => S().db.tickets.filter(t => t.empleadoId === LD.sesion.personaId && t.estado === 'resuelto').length,
    render(el, params) {
      const mios = S().db.tickets.filter(t => t.empleadoId === LD.sesion.personaId).sort((a, b) => b.creado - a.creado);
      const ab = mios.filter(abierto), porCalif = mios.filter(t => t.estado === 'resuelto'), resto = mios.filter(t => t.estado === 'cerrado');
      el.innerHTML =
        (porCalif.length ? '<section><div class="sec-h"><h2>Confirma si quedó resuelto</h2><p>Tu opinión cierra el ticket</p></div>' + lista(porCalif, '') + '</section>' : '') +
        '<section class="' + (porCalif.length ? 'sec' : '') + '"><div class="sec-h"><h2>En curso</h2><a class="btn btn-primary btn-sm" href="#/asistente">' + I('plus') + 'Pedir ayuda</a></div>' +
        lista(ab, U.vacio('check', 'No tienes tickets en curso', 'Si algo falla, cuéntaselo al asistente: muchas veces se resuelve en minutos.')) + '</section>' +
        (resto.length ? '<section class="sec"><div class="sec-h"><h2>Anteriores</h2></div>' + lista(resto.slice(0, 15), '') + '</section>' : '');
      enlazar(el);
      if (params.get('id')) detalle(params.get('id'));
    }
  };

  /* ---------- Detalle ---------- */
  function detalle(id) {
    const t = S().ticket(id);
    if (!t) { U.toast('No se encontró el ticket ' + id + '. Puede que los datos de ejemplo se hayan renovado.', 'error'); return; }
    const e = S().persona(t.empleadoId), a = S().area(t.areaId), tec = S().persona(t.tecnicoId), eq = S().equipo(t.equipoId);
    const rol = LD.sesion.rol, esTec = rol !== 'empleado';
    const s = U.slaInfo(t);
    const tri = { puntaje: t.puntaje, prioridad: t.prioridad, nivel: t.nivel, factores: t.factores };
    const kb = t.kbIntentado ? S().kb(t.kbIntentado) : null;
    const notas = t.notas.filter(n => esTec || !n.interna);

    let acciones = '';
    if (esTec && abierto(t)) {
      if (t.estado === 'asignado') acciones += '<button class="btn btn-dark" data-a="tomar">' + I('check') + 'Tomar ticket</button>';
      acciones += '<button class="btn btn-ok" data-a="resolver">' + I('check') + 'Marcar resuelto</button>';
      if (t.estado !== 'en_espera') acciones += '<button class="btn btn-line" data-a="espera">' + I('clock') + 'En espera</button>';
      if (t.nivel < 3) acciones += '<button class="btn btn-line" data-a="escalar">' + I('arrowUp') + 'Escalar a N' + (t.nivel + 1) + '</button>';
    }
    if (esTec && !abierto(t)) acciones += '<button class="btn btn-line" data-a="acta">' + I('print') + 'Imprimir acta</button>';
    if (rol === 'empleado' && t.estado === 'resuelto') acciones += '<button class="btn btn-line" data-a="reabrir">Sigue fallando</button>';

    const html =
      '<div class="panel-h"><div style="flex:1;min-width:0"><span class="sub num">' + t.id + ' · ' + U.esc(LD.CATEGORIAS[t.categoria].nombre) + '</span><h2>' + U.esc(t.titulo) + '</h2></div><button class="btn btn-ghost btn-icon" data-close aria-label="Cerrar">' + I('x') + '</button></div>' +
      '<div class="panel-c">' +
      (t.seguridad && abierto(t) ? '<div class="alerta mal alerta-seg">' + I('shield') + '<div><b>Posible incidente de seguridad.</b> Indica al usuario que desconecte el cable de red y no apague la PC hasta que llegue el especialista.</div></div>' : '') +
      '<div class="fila">' + U.estado(t.estado) + U.slaBar(t) + '</div>' +
      (rol === 'empleado' && t.estado === 'resuelto' ? '<div class="bloque"><h3>¿Cómo te atendimos?</h3><div class="estrellas" id="estrellas">' + [1, 2, 3, 4, 5].map(n => '<button type="button" data-n="' + n + '" aria-label="' + n + ' de 5">' + I('star') + '</button>').join('') + '</div></div>' : '') +
      '<div class="bloque"><h3>¿Por qué esta prioridad?</h3>' + U.medidor(tri) + '</div>' +
      '<div class="bloque"><h3>Detalle</h3><p style="color:var(--ink);margin-bottom:12px">' + U.esc(t.descripcion || 'Sin descripción') + '</p><div class="dato-grid">' +
      '<div class="dato"><span>Pidió ayuda</span><b>' + U.esc(e ? e.nombre : '—') + '</b></div>' +
      '<div class="dato"><span>Área</span><b>' + U.esc(a ? a.nombre : '—') + '</b></div>' +
      '<div class="dato"><span>Anexo</span><b class="num">' + U.esc(e ? e.anexo : '—') + '</b></div>' +
      '<div class="dato"><span>Equipo</span><b class="num">' + U.esc(eq ? eq.id : '—') + '</b></div>' +
      '<div class="dato"><span>Técnico</span><b>' + U.esc(tec ? tec.nombre : 'Sin asignar') + '</b></div>' +
      '<div class="dato"><span>Llegó por</span><b>' + U.esc(t.canal) + '</b></div></div></div>' +
      (kb ? '<div class="bloque"><h3>Lo que ya intentó con el asistente</h3><div class="nota"><b>' + U.esc(kb.titulo) + '</b>' + (t.intentos && t.intentos.length ? '<ol class="pasos" style="margin-top:8px;font-size:14px">' + t.intentos.map(p => '<li>' + U.esc(p) + '</li>').join('') + '</ol>' : '<p style="margin-top:4px;color:var(--ink-3)">Siguió los ' + U.plural(kb.pasos.length, 'paso') + ' del artículo ' + kb.id + ' y no se resolvió.</p>') + '</div></div>' : '') +
      '<div class="bloque"><h3>Notas</h3><div style="display:grid;gap:8px">' + (notas.length ? notas.map(n => '<div class="nota' + (n.interna ? ' interna' : '') + '"><header><b>' + U.esc(n.autor) + (n.interna ? ' · nota interna' : '') + '</b><time>' + U.cuando(n.t) + '</time></header>' + U.esc(n.txt) + '</div>').join('') : '<p class="muted">Todavía no hay notas.</p>') + '</div>' +
      (abierto(t) ? '<form id="f-nota" style="display:grid;gap:8px;margin-top:10px"><label class="sr-only" for="nota-txt">Escribir nota</label><textarea id="nota-txt" rows="2" placeholder="' + (esTec ? 'Escribe qué hiciste o qué falta' : 'Agrega información para el técnico') + '"></textarea><div class="fila">' + (esTec ? '<label class="fila" style="gap:6px;font-size:14px"><input type="checkbox" id="nota-int"> Solo para TI</label>' : '') + '<button class="btn btn-line btn-sm" style="margin-left:auto">Agregar nota</button></div></form>' : '') + '</div>' +
      '<div class="bloque"><h3>Historial</h3><ul class="linea">' + t.eventos.slice().reverse().map(ev => '<li><time class="num">' + U.cuando(ev.t) + '</time><span>' + U.esc(ev.txt) + '</span></li>').join('') + '</ul></div>' +
      '</div>' + (acciones ? '<div class="panel-f">' + acciones + '</div>' : '') + acta(t);

    const p = U.panel(html);
    const recargar = () => { LD.refrescar(); detalle(t.id); };
    p.addEventListener('click', async ev => {
      const b = ev.target.closest('[data-a]');
      const st = ev.target.closest('[data-n]');
      if (st) {
        t.satisfaccion = Number(st.dataset.n); t.estado = 'cerrado'; t.cerrado = Date.now();
        evento(t, 'Cerrado · ' + U.nombreCorto(LD.sesion.nombre) + ' calificó ' + t.satisfaccion + '/5'); S().save();
        U.toast('Gracias. Ticket cerrado.'); recargar(); return;
      }
      if (!b) return;
      const a = b.dataset.a;
      if (a === 'tomar') { tomar(t); U.toast('Tomaste ' + t.id + '. El reloj de respuesta se detuvo.'); recargar(); }
      if (a === 'espera') { if (!t.primeraRespuesta) t.primeraRespuesta = Date.now(); t.estado = 'en_espera'; evento(t, 'En espera (repuesto o respuesta del usuario)'); S().save(); recargar(); }
      if (a === 'escalar') { if (escalar(t)) { U.toast(t.id + ' escalado a N' + t.nivel + '.'); recargar(); } }
      if (a === 'acta') window.print();
      if (a === 'reabrir') { t.estado = 'en_progreso'; t.resuelto = null; evento(t, 'El usuario indicó que sigue fallando'); S().save(); U.toast('Avisamos al técnico que sigue fallando.', 'info'); recargar(); }
      if (a === 'resolver') {
        const r = await U.modal('Marcar ' + t.id + ' como resuelto', '<label class="campo">¿Qué se hizo?<small>Lo verá el usuario y saldrá en el acta</small><textarea name="sol" required placeholder="Ej.: se reinstaló el controlador de la impresora y se imprimió una prueba"></textarea></label>', [['cancelar', 'Cancelar', 'btn-line'], ['ok', 'Marcar resuelto', 'btn-ok']]);
        if (r.v === 'ok') {
          const sol = (r.data.get('sol') || '').trim() || 'Atendido y verificado con el usuario.';
          resolver(t, sol); U.toast(t.id + ' resuelto. Le pedimos al usuario que califique.'); recargar();
        }
      }
    });
    const fn = p.querySelector('#f-nota');
    if (fn) fn.onsubmit = ev => {
      ev.preventDefault();
      const txt = p.querySelector('#nota-txt').value.trim();
      if (!txt) { U.toast('Escribe la nota antes de agregarla.', 'error'); return; }
      const interna = !!(p.querySelector('#nota-int') || {}).checked;
      t.notas.push({ t: Date.now(), autor: LD.sesion.nombre, txt, interna });
      if (esTec && !t.primeraRespuesta) { t.primeraRespuesta = Date.now(); t.estado = 'en_progreso'; }
      evento(t, 'Nota de ' + U.nombreCorto(LD.sesion.nombre)); S().save(); recargar();
    };
  }

  function acta(t) {
    const db = S().db, e = S().persona(t.empleadoId), tec = S().persona(t.tecnicoId), eq = S().equipo(t.equipoId), a = S().area(t.areaId);
    const sol = t.notas.filter(n => !n.interna).map(n => n.txt).join(' ');
    return '<div class="acta-print"><h1>Acta de atención técnica ' + t.id + '</h1><p>' + U.esc(db.empresa.razon) + ' · RUC ' + db.empresa.ruc + ' (empresa ficticia de demostración)</p>' +
      '<table><tr><td><b>Usuario</b><br>' + U.esc(e && e.nombre) + ' · DNI ' + U.esc(e && e.dni) + '</td><td><b>Área</b><br>' + U.esc(a && a.nombre) + '</td></tr>' +
      '<tr><td><b>Equipo</b><br>' + U.esc(eq ? eq.id + ' · ' + eq.modelo : '—') + '</td><td><b>Prioridad</b><br>' + t.prioridad + ' ' + U.PRIO[t.prioridad] + ' · puntaje ' + t.puntaje + '/100 · N' + t.nivel + '</td></tr>' +
      '<tr><td><b>Reportado</b><br>' + U.fechaLarga(t.creado) + ' ' + U.hora(t.creado) + '</td><td><b>Resuelto</b><br>' + (t.resuelto ? U.fechaLarga(t.resuelto) + ' ' + U.hora(t.resuelto) : '—') + '</td></tr>' +
      '<tr><td colspan="2"><b>Problema</b><br>' + U.esc(t.titulo + '. ' + t.descripcion) + '</td></tr><tr><td colspan="2"><b>Trabajo realizado</b><br>' + U.esc(sol || '—') + '</td></tr></table>' +
      '<div class="firmas"><div>' + U.esc(tec && tec.nombre) + '<br>Técnico</div><div>' + U.esc(e && e.nombre) + '<br>Usuario conforme</div></div></div>';
  }

  LD.tickets = { crear, simularEntrante, detalle, fila, lista, abierto, ordenUrgencia, enlazar };
})();
