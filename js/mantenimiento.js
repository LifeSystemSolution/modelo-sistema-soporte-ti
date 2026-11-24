/* Mantenimientos preventivos: calendario por área, programar y marcar hecho */
(function () {
  const LD = (window.LD = window.LD || {});
  const U = LD.ui, I = LD.icon, S = () => LD.store;
  const MES = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SET', 'OCT', 'NOV', 'DIC'];

  function fila(m) {
    const d = new Date(m.fecha), tec = S().persona(m.tecnicoId), a = S().area(m.areaId);
    const atrasado = m.estado !== 'hecho' && m.fecha < Date.now();
    const est = m.estado === 'hecho' ? '<span class="estado st-ok">Hecho</span>' : atrasado ? '<span class="estado st-new">Atrasado</span>' : '<span class="estado st-prog">Programado</span>';
    const puede = LD.sesion.rol !== 'empleado' && m.estado !== 'hecho';
    return '<div class="mant"><div class="mant-f"><b class="num">' + d.getDate() + '</b><span>' + MES[d.getMonth()] + '</span></div>' +
      '<div><h4>' + U.esc(m.titulo) + '</h4><p>' + U.plural(m.equipos, 'equipo') + ' · ' + U.esc(a ? a.sede : '') + ' · ' + U.esc(tec ? U.nombreCorto(tec.nombre) : '—') + ' · ' + U.hora(m.fecha) + '</p><div style="margin-top:4px">' + est + '</div></div>' +
      '<div>' + (puede ? '<button class="btn btn-line btn-sm" data-hecho="' + m.id + '">' + I('check') + 'Marcar hecho</button>' : '') + '</div></div>';
  }

  LD.vistas.mantenimiento = {
    titulo: 'Mantenimientos', icono: 'calendar', corto: 'Manten.',
    badge: () => S().db.mantenimientos.filter(m => m.estado !== 'hecho' && m.fecha < Date.now()).length,
    render(el) {
      const db = S().db;
      const prox = db.mantenimientos.filter(m => m.estado !== 'hecho').sort((a, b) => a.fecha - b.fecha);
      const hechos = db.mantenimientos.filter(m => m.estado === 'hecho').sort((a, b) => b.fecha - a.fecha);
      const vencidosEq = db.equipos.filter(e => e.proximoMant < Date.now()).length;
      el.innerHTML = '<div class="kpis"><div class="kpi"><span>Programados</span><b class="num">' + prox.length + '</b><small>Próximos 30 días</small></div>' +
        '<div class="kpi' + (prox.some(m => m.fecha < Date.now()) ? ' kpi-mal' : '') + '"><span>Atrasados</span><b class="num">' + prox.filter(m => m.fecha < Date.now()).length + '</b><small>Reprogramar o atender</small></div>' +
        '<div class="kpi"><span>Equipos con preventivo vencido</span><b class="num">' + vencidosEq + '</b><small>De ' + db.equipos.length + ' equipos</small></div>' +
        '<div class="kpi"><span>Hechos este mes</span><b class="num">' + hechos.length + '</b><small>Cada 6 meses por equipo</small></div></div>' +
        '<section class="sec"><div class="sec-h"><h2>Próximos</h2>' + (LD.sesion.rol === 'jefe' ? '<button class="btn btn-primary btn-sm" id="nuevo">' + I('plus') + 'Programar</button>' : '') + '</div><div class="caja">' + (prox.length ? prox.map(fila).join('') : U.vacio('calendar', 'No hay mantenimientos programados', 'Programa uno por área para evitar fallas.')) + '</div></section>' +
        '<section class="sec"><div class="sec-h"><h2>Realizados</h2></div><div class="caja">' + hechos.map(fila).join('') + '</div></section>';
      el.onclick = async e => {
        const b = e.target.closest('[data-hecho]');
        if (b) {
          const m = db.mantenimientos.find(x => x.id === b.dataset.hecho);
          m.estado = 'hecho'; m.fecha = Math.min(m.fecha, Date.now());
          db.equipos.filter(x => x.areaId === m.areaId).forEach(x => { x.ultimoMant = Date.now(); x.proximoMant = Date.now() + 180 * 864e5; });
          S().log('Completó mantenimiento', m.titulo); S().save();
          U.toast('Mantenimiento registrado. Se actualizó la fecha de ' + U.plural(m.equipos, 'equipo') + '.');
          LD.refrescar();
        }
        if (e.target.closest('#nuevo')) {
          const hoy = new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10);
          const r = await U.modal('Programar mantenimiento', '<label class="campo">Área<select name="area">' + db.areas.map(a => '<option value="' + a.id + '">' + U.esc(a.nombre) + '</option>').join('') + '</select></label>' +
            '<label class="campo">Fecha<input type="date" name="fecha" value="' + hoy + '" required></label>' +
            '<label class="campo">Técnico<select name="tec">' + S().tecnicos().filter(p => !p.jefe).map(p => '<option value="' + p.id + '">' + U.esc(p.nombre) + '</option>').join('') + '</select></label>', [['cancelar', 'Cancelar', 'btn-line'], ['ok', 'Programar', 'btn-primary']]);
          if (r.v !== 'ok') return;
          const a = S().area(r.data.get('area'));
          const f = new Date(r.data.get('fecha') + 'T09:00:00').getTime();
          if (isNaN(f)) { U.toast('Elige una fecha válida.', 'error'); return; }
          db.mantenimientos.push({ id: 'MP' + S().nextId('mant'), areaId: a.id, titulo: 'Preventivo ' + a.nombre, equipos: db.equipos.filter(x => x.areaId === a.id).length, fecha: f, tecnicoId: r.data.get('tec'), estado: 'programado' });
          S().log('Programó mantenimiento', a.nombre + ' · ' + U.fecha(f)); S().save();
          U.toast('Programado para el ' + U.fechaLarga(f) + '.'); LD.refrescar();
        }
      };
    }
  };
})();
