/* Reportes: volumen, plazos, ahorro estimado del asistente, por área/categoría/hora/técnico y alertas */
(function () {
  const LD = (window.LD = window.LD || {});
  const U = LD.ui, I = LD.icon, S = () => LD.store;
  const DIA = 864e5;
  const prom = a => a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0;

  function metricas(dias) {
    const db = S().db, aj = db.ajustes;
    const desde = dias === 0 ? new Date().setHours(0, 0, 0, 0) : Date.now() - dias * DIA;
    const ts = db.tickets.filter(t => t.creado >= desde);
    const at = db.atenciones.filter(a => a.t >= desde);
    const deflex = at.filter(a => a.resuelto).length;
    const cerr = ts.filter(t => t.resuelto);
    const cumple = cerr.filter(t => t.resuelto <= t.venceResolucion).length;
    const resp = ts.filter(t => t.primeraRespuesta).map(t => (t.primeraRespuesta - t.creado) / 6e4);
    const res = cerr.map(t => (t.resuelto - t.creado) / 6e4);
    const sat = ts.filter(t => t.satisfaccion).map(t => t.satisfaccion);
    const contactos = deflex + ts.length;
    const horasTec = deflex * aj.minutosPorAtencion / 60;
    const horasEmp = deflex * 30 / 60; // tiempo que el empleado no espera parado (estimado: 30 min)
    return {
      desde, ts, at, deflex, contactos, cumplePct: cerr.length ? Math.round(cumple / cerr.length * 100) : 100,
      tResp: prom(resp), tRes: prom(res), sat: prom(sat), satN: sat.length,
      deflexPct: contactos ? Math.round(deflex / contactos * 100) : 0,
      horasTec, horasEmp, ahorroTec: horasTec * aj.costoHoraTecnico, ahorroEmp: horasEmp * aj.costoHoraEmpleado
    };
  }

  function alertas() {
    const db = S().db, out = [];
    const ab = db.tickets.filter(LD.tickets.abierto);
    const venc = ab.filter(t => U.slaInfo(t).nivel === 'bad');
    if (venc.length) out.push({ mal: true, ic: 'clock', titulo: U.plural(venc.length, 'ticket') + ' fuera de plazo', texto: 'El más antiguo: ' + venc.sort((a, b) => a.creado - b.creado)[0].id + '. Reasigna o escala.' });
    const sinTomar = ab.filter(t => t.estado === 'asignado' && t.prioridad === 'P1');
    if (sinTomar.length) out.push({ mal: true, ic: 'bolt', titulo: U.plural(sinTomar.length, 'P1 sin tomar', 'P1 sin tomar'), texto: 'Crítico: nadie lo ha tomado todavía.' });
    const hace7 = Date.now() - 7 * DIA;
    const grupos = {};
    db.tickets.filter(t => t.creado > hace7).forEach(t => { const k = t.areaId + '|' + t.categoria; grupos[k] = (grupos[k] || 0) + 1; });
    Object.keys(grupos).filter(k => grupos[k] >= 4).sort((a, b) => grupos[b] - grupos[a]).slice(0, 2).forEach(k => {
      const [a, c] = k.split('|');
      out.push({ ic: 'refresh', titulo: 'Problema repetido: ' + LD.CATEGORIAS[c].nombre + ' en ' + S().area(a).nombre, texto: U.plural(grupos[k], 'ticket') + ' en 7 días. Puede haber una causa de fondo.' });
    });
    const quemados = db.equipos.filter(e => LD.equipos.fallas(e).length >= 3);
    if (quemados.length) out.push({ ic: 'monitor', titulo: U.plural(quemados.length, 'equipo') + ' con 3 o más fallas en 30 días', texto: quemados.slice(0, 3).map(e => e.id).join(', ') + '. Evaluar reemplazo.' });
    const calientes = db.equipos.filter(e => e.salud.temp >= 85);
    if (calientes.length) out.push({ mal: true, ic: 'alert', titulo: U.plural(calientes.length, 'equipo') + ' con temperatura alta', texto: 'Limpieza y cambio de pasta térmica: ' + calientes.slice(0, 3).map(e => e.id).join(', ') + '.' });
    const garantia = db.equipos.filter(e => e.garantiaHasta > Date.now() && e.garantiaHasta < Date.now() + 60 * DIA);
    if (garantia.length) out.push({ ic: 'shield', titulo: U.plural(garantia.length, 'garantía') + ' por vencer en 60 días', texto: 'Revisa fallas pendientes antes de que venzan.' });
    const mantAtr = db.mantenimientos.filter(m => m.estado !== 'hecho' && m.fecha < Date.now());
    if (mantAtr.length) out.push({ ic: 'calendar', titulo: U.plural(mantAtr.length, 'mantenimiento atrasado', 'mantenimientos atrasados'), texto: mantAtr.map(m => m.titulo).join(', ') + '.' });
    return out;
  }
  LD.alertas = alertas;

  function exportar(m) {
    const filas = [['Codigo', 'Fecha', 'Area', 'Categoria', 'Prioridad', 'Puntaje', 'Nivel', 'Estado', 'Tecnico', 'Minutos a resolver', 'Dentro de plazo']];
    m.ts.forEach(t => filas.push([t.id, new Date(t.creado).toISOString(), S().area(t.areaId).nombre, LD.CATEGORIAS[t.categoria].nombre, t.prioridad, t.puntaje, 'N' + t.nivel, t.estado, (S().persona(t.tecnicoId) || {}).nombre || '', t.resuelto ? Math.round((t.resuelto - t.creado) / 6e4) : '', t.resuelto ? (t.resuelto <= t.venceResolucion ? 'si' : 'no') : '']));
    const csv = '﻿' + filas.map(f => f.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(';')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = 'lifedesk-tickets.csv'; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  LD.vistas.reportes = {
    titulo: 'Reportes', icono: 'chart',
    render(el, params) {
      const dias = Number(params.get('dias') || 30);
      const db = S().db, m = metricas(dias), aj = db.ajustes;
      const nDias = dias || 1;
      // por día
      const porDia = [];
      for (let i = nDias - 1; i >= 0; i--) {
        const d0 = new Date(); d0.setHours(0, 0, 0, 0); const ini = d0.getTime() - i * DIA;
        const n = m.ts.filter(t => t.creado >= ini && t.creado < ini + DIA).length;
        const a = m.at.filter(x => x.resuelto && x.t >= ini && x.t < ini + DIA).length;
        porDia.push({ l: new Date(ini).getDate() + '', v: n, a });
      }
      const contar = (arr, key) => { const o = {}; arr.forEach(x => { o[key(x)] = (o[key(x)] || 0) + 1; }); return o; };
      const porCat = contar(m.ts, t => t.categoria), porArea = contar(m.ts, t => t.areaId), porHora = contar(m.ts, t => new Date(t.creado).getHours()), porPrio = contar(m.ts, t => t.prioridad);
      const tecs = S().tecnicos().filter(p => !p.jefe).map(p => {
        const suyos = m.ts.filter(t => t.tecnicoId === p.id && t.resuelto);
        const ok = suyos.filter(t => t.resuelto <= t.venceResolucion).length;
        return { p, n: suyos.length, pct: suyos.length ? Math.round(ok / suyos.length * 100) : 0, sat: prom(suyos.filter(t => t.satisfaccion).map(t => t.satisfaccion)) };
      });
      const ahorroTot = m.ahorroTec + m.ahorroEmp;
      const al = alertas();

      el.innerHTML = '<div class="fila entre"><div class="chips" id="rango">' + [[0, 'Hoy'], [7, '7 días'], [30, '30 días']].map(r => '<button class="chip' + (r[0] === dias ? ' on' : '') + '" data-d="' + r[0] + '">' + r[1] + '</button>').join('') + '</div>' +
        '<button class="btn btn-line btn-sm" id="csv">' + I('download') + 'Exportar Excel (CSV)</button></div>' +
        '<div class="kpis sec"><div class="kpi"><span>Tickets</span><b class="num">' + m.ts.length + '</b><small>' + U.plural(m.contactos, 'pedido') + ' de ayuda en total</small></div>' +
        '<div class="kpi"><span>Resuelto por el asistente</span><b class="num">' + m.deflexPct + '%</b><small>' + U.plural(m.deflex, 'caso') + ' sin técnico</small></div>' +
        '<div class="kpi"><span>Dentro del plazo</span><b class="num">' + m.cumplePct + '%</b><small class="' + (m.cumplePct >= 85 ? 'bien' : 'mal') + '">Meta: 85%</small></div>' +
        '<div class="kpi"><span>Satisfacción</span><b class="num">' + (m.satN ? m.sat.toFixed(1) : '—') + '<small style="display:inline;font-size:15px"> / 5</small></b><small>' + U.plural(m.satN, 'calificación', 'calificaciones') + '</small></div></div>' +
        '<div class="kpis" style="margin-top:12px"><div class="kpi"><span>Primera respuesta (promedio)</span><b class="num">' + (m.tResp ? U.duracion(m.tResp) : '—') + '</b></div>' +
        '<div class="kpi"><span>Tiempo para resolver (promedio)</span><b class="num">' + (m.tRes ? U.duracion(m.tRes) : '—') + '</b></div>' +
        '<div class="kpi"><span>Horas de técnico ahorradas</span><b class="num">' + Math.round(m.horasTec) + ' h</b><small>' + aj.minutosPorAtencion + ' min por caso</small></div>' +
        '<div class="kpi"><span>Ahorro estimado</span><b class="num">' + U.soles(ahorroTot) + '</b><small>Técnico + tiempo del empleado</small></div></div>' +
        '<p class="muted" style="font-size:13px;margin-top:8px">Ahorro = casos resueltos por el asistente × (' + aj.minutosPorAtencion + ' min de técnico a S/ ' + aj.costoHoraTecnico + '/h + 30 min del empleado a S/ ' + aj.costoHoraEmpleado + '/h). Ajusta estos valores en Ajustes.</p>' +
        '<section class="caja caja-p sec"><div class="sec-h"><h2>Tickets por día</h2><p>' + (dias === 0 ? 'Hoy' : 'Últimos ' + dias + ' días') + '</p></div>' + U.barras(porDia.map(d => ({ l: d.l, v: d.v })), { alto: 150 }) + '</section>' +
        '<div class="grid2 sec"><section class="caja caja-p"><div class="sec-h"><h2>Por tipo de problema</h2></div>' + U.barras(Object.keys(porCat).sort((a, b) => porCat[b] - porCat[a]).map(c => ({ l: LD.CATEGORIAS[c].nombre, v: porCat[c] })), { horizontal: true }) + '</section>' +
        '<section class="caja caja-p"><div class="sec-h"><h2>Por área</h2></div>' + U.barras(Object.keys(porArea).sort((a, b) => porArea[b] - porArea[a]).map(a => ({ l: S().area(a).nombre, v: porArea[a] })), { horizontal: true }) + '</section></div>' +
        '<div class="grid2 sec"><section class="caja caja-p"><div class="sec-h"><h2>Por hora del día</h2><p>Para planificar turnos</p></div>' + U.barras(Array.from({ length: 11 }, (_, i) => i + 8).map(h => ({ l: h + 'h', v: porHora[h] || 0 })), { alto: 130 }) + '</section>' +
        '<section class="caja caja-p"><div class="sec-h"><h2>Por prioridad</h2></div>' + U.barras(['P1', 'P2', 'P3', 'P4'].map(p => ({ l: p + ' ' + U.PRIO[p], v: porPrio[p] || 0, color: 'var(--' + p.toLowerCase() + ')' })), { horizontal: true }) + '</section></div>' +
        '<section class="sec"><div class="sec-h"><h2>Equipo técnico</h2></div><div class="tabla-wrap"><table class="tabla"><thead><tr><th>Técnico</th><th>Nivel</th><th>Resueltos</th><th>Dentro de plazo</th><th>Satisfacción</th><th>Abiertos ahora</th></tr></thead><tbody>' +
        tecs.map(t => '<tr><td><b>' + U.esc(t.p.nombre) + '</b><br><span class="muted">' + U.esc(t.p.cargo) + '</span></td><td>N' + t.p.nivel + '</td><td class="num">' + t.n + '</td><td class="num">' + (t.n ? t.pct + '%' : '—') + '</td><td class="num">' + (t.sat ? t.sat.toFixed(1) : '—') + '</td><td class="num">' + db.tickets.filter(x => x.tecnicoId === t.p.id && LD.tickets.abierto(x)).length + '</td></tr>').join('') +
        '</tbody></table></div></section>' +
        '<section class="sec"><div class="sec-h"><h2>Alertas</h2></div><div class="alertas">' + (al.length ? al.map(a => '<div class="alerta' + (a.mal ? ' mal' : '') + '">' + I(a.ic || 'alert') + '<div><b>' + U.esc(a.titulo) + '</b><br><span class="muted">' + U.esc(a.texto) + '</span></div></div>').join('') : '<p class="muted">Sin alertas.</p>') + '</div></section>';
      el.querySelector('#rango').onclick = e => { const c = e.target.closest('[data-d]'); if (c) LD.ir('reportes', { dias: c.dataset.d }); };
      el.querySelector('#csv').onclick = () => { exportar(m); U.toast('Archivo descargado: ' + U.plural(m.ts.length, 'ticket') + '.'); };
    }
  };

  LD.reportes = { metricas, alertas };
})();
