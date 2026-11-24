/* Tablero de la jefa de TI: lo de hoy, lo urgente, carga del equipo y alertas */
(function () {
  const LD = (window.LD = window.LD || {});
  const U = LD.ui, I = LD.icon, S = () => LD.store;

  LD.vistas.tablero = {
    titulo: 'Tablero', icono: 'home', corto: 'Inicio',
    render(el) {
      const db = S().db;
      const ab = db.tickets.filter(LD.tickets.abierto);
      const venc = ab.filter(t => U.slaInfo(t).nivel === 'bad');
      const hoyT = db.tickets.filter(t => U.esHoy(t.creado));
      const hoyA = db.atenciones.filter(a => U.esHoy(a.t) && a.resuelto);
      const urg = ab.filter(t => t.prioridad === 'P1' || t.prioridad === 'P2' || U.slaInfo(t).nivel === 'bad').sort(LD.tickets.ordenUrgencia).slice(0, 6);
      const tecs = S().tecnicos().filter(p => !p.jefe);
      const carga = tecs.map(p => ({ l: U.nombreCorto(p.nombre) + ' · N' + p.nivel, v: ab.filter(t => t.tecnicoId === p.id).length }));
      const alertas = LD.alertas ? LD.alertas().slice(0, 5) : [];

      el.innerHTML =
        '<p class="muted" style="margin-bottom:14px">' + U.fechaLarga(Date.now()) + ' · ' + U.esc(db.empresa.razon) + ' (ficticia)</p>' +
        '<div class="kpis">' +
        '<div class="kpi"><span>Tickets de hoy</span><b class="num">' + hoyT.length + '</b><small>' + (hoyT.length ? U.plural(hoyT.filter(t => !LD.tickets.abierto(t)).length, 'resuelto') : 'El día empieza en 0') + '</small></div>' +
        '<div class="kpi"><span>Resueltos por el asistente hoy</span><b class="num">' + hoyA.length + '</b><small>Sin pasar a un técnico</small></div>' +
        '<div class="kpi"><span>Abiertos</span><b class="num">' + ab.length + '</b><small>' + U.plural(ab.filter(t => t.estado === 'asignado').length, 'sin tomar', 'sin tomar') + '</small></div>' +
        '<div class="kpi' + (venc.length ? ' kpi-mal' : '') + '"><span>Fuera de plazo</span><b class="num">' + venc.length + '</b><small class="' + (venc.length ? 'mal' : 'bien') + '">' + (venc.length ? 'Requieren atención' : 'Todo a tiempo') + '</small></div></div>' +
        '<section class="sec"><div class="sec-h"><h2>Urgente ahora</h2><a class="btn btn-ghost btn-sm" href="#/tickets?estado=abiertos">Ver todos ' + I('arrowR') + '</a></div>' +
        LD.tickets.lista(urg, U.vacio('check', 'Nada urgente', 'No hay tickets P1 o P2 abiertos ni plazos vencidos.')) + '</section>' +
        '<div class="grid2 sec"><section class="caja caja-p"><div class="sec-h"><h2>Carga del equipo</h2><p>Tickets abiertos</p></div>' + U.barras(carga, { horizontal: true }) + '</section>' +
        '<section class="caja caja-p"><div class="sec-h"><h2>Alertas</h2><a class="btn btn-ghost btn-sm" href="#/reportes">Reportes ' + I('arrowR') + '</a></div><div class="alertas">' +
        (alertas.length ? alertas.map(a => '<div class="alerta' + (a.mal ? ' mal' : '') + '">' + I(a.ic || 'alert') + '<div><b>' + U.esc(a.titulo) + '</b><br><span class="muted">' + U.esc(a.texto) + '</span></div></div>').join('') : '<p class="muted">Sin alertas.</p>') +
        '</div></section></div>';
      LD.tickets.enlazar(el);
    }
  };
})();
