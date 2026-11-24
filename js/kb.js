/* Base de conocimiento: las guías que usa el asistente y cuánto resuelven */
(function () {
  const LD = (window.LD = window.LD || {});
  const U = LD.ui, I = LD.icon, S = () => LD.store;

  function tasa(k) { return k.vistas ? Math.round(k.resueltas / k.vistas * 100) : 0; }

  function detalle(k) {
    const puedeEditar = LD.sesion.rol !== 'empleado';
    const p = U.panel('<div class="panel-h"><div style="flex:1;min-width:0"><span class="sub">' + k.id + ' · ' + U.esc(LD.CATEGORIAS[k.categoria].nombre) + '</span><h2>' + U.esc(k.titulo) + '</h2></div><button class="btn btn-ghost btn-icon" data-close aria-label="Cerrar">' + I('x') + '</button></div>' +
      '<div class="panel-c"><div class="fila">' + LD.illus(k.categoria, 56) + '<div><b style="color:var(--ink);font-size:22px" class="num">' + tasa(k) + '%</b><p class="muted">resuelve sin técnico · ' + U.plural(k.vistas, 'uso') + '</p></div></div>' +
      '<div class="bloque"><h3>Pasos que muestra el asistente</h3><ol class="pasos" id="pasos">' + k.pasos.map(s => '<li>' + U.esc(s) + '</li>').join('') + '</ol></div>' +
      '<div class="bloque"><h3>Palabras que la activan</h3><div class="fila" style="gap:6px">' + k.palabras.map(w => '<span class="tag">' + U.esc(w) + '</span>').join('') + '</div></div>' +
      '<p class="muted">Actualizada el ' + U.fecha(k.actualizado) + '</p></div>' +
      (puedeEditar ? '<div class="panel-f"><button class="btn btn-dark" data-a="editar">' + I('note') + 'Editar pasos</button></div>' : ''));
    p.addEventListener('click', async e => {
      if (!e.target.closest('[data-a="editar"]')) return;
      const r = await U.modal('Editar ' + k.id, '<label class="campo">Un paso por línea<textarea name="pasos" rows="8">' + U.esc(k.pasos.join('\n')) + '</textarea></label>', [['cancelar', 'Cancelar', 'btn-line'], ['ok', 'Guardar', 'btn-primary']]);
      if (r.v !== 'ok') return;
      const pasos = String(r.data.get('pasos') || '').split('\n').map(s => s.trim()).filter(Boolean);
      if (!pasos.length) { U.toast('Deja al menos un paso.', 'error'); return; }
      k.pasos = pasos; k.actualizado = Date.now();
      S().log('Actualizó artículo', k.id + ' · ' + k.titulo); S().save();
      U.toast('Guía actualizada. El asistente ya usa los pasos nuevos.'); detalle(k);
    });
  }

  LD.vistas.kb = {
    titulo: 'Base de conocimiento', menu: 'Guías', icono: 'book', corto: 'Guías',
    render(el) {
      const db = S().db;
      let q = '';
      const totV = db.kb.reduce((s, k) => s + k.vistas, 0), totR = db.kb.reduce((s, k) => s + k.resueltas, 0);
      el.innerHTML = '<div class="kpis"><div class="kpi"><span>Guías</span><b class="num">' + db.kb.length + '</b><small>Usadas por el asistente</small></div>' +
        '<div class="kpi"><span>Usos en 30 días</span><b class="num">' + totV + '</b><small>Consultas guiadas</small></div>' +
        '<div class="kpi"><span>Resueltos sin técnico</span><b class="num">' + totR + '</b><small>' + (totV ? Math.round(totR / totV * 100) : 0) + '% de los usos</small></div>' +
        '<div class="kpi"><span>Menos efectiva</span><b class="num">' + Math.min(...db.kb.filter(k => k.vistas > 3).map(tasa)) + '%</b><small>Conviene mejorarla</small></div></div>' +
        '<div class="fila sec"><label class="buscar">' + I('search') + '<span class="sr-only">Buscar guía</span><input type="search" data-buscar placeholder="Buscar guía"><kbd>/</kbd></label></div>' +
        '<div class="kb-list" id="kb-l" style="margin-top:12px"></div>';
      const pintar = () => {
        const ks = db.kb.filter(k => !q || (k.titulo + ' ' + k.palabras.join(' ')).toLowerCase().includes(q)).sort((a, b) => b.vistas - a.vistas);
        el.querySelector('#kb-l').innerHTML = ks.length ? ks.map(k => '<button class="kb" data-k="' + k.id + '">' + LD.illus(k.categoria, 40) + '<div><b>' + U.esc(k.titulo) + '</b><span>' + U.plural(k.pasos.length, 'paso') + ' · resuelve ' + tasa(k) + '% · ' + U.plural(k.vistas, 'uso') + '</span></div></button>').join('') : U.vacio('search', 'No hay guías con ese nombre', 'Prueba con otra palabra.');
      };
      el.querySelector('[data-buscar]').oninput = e => { q = e.target.value.trim().toLowerCase(); pintar(); };
      el.querySelector('#kb-l').onclick = e => { const b = e.target.closest('[data-k]'); if (b) detalle(S().kb(b.dataset.k)); };
      pintar();
    }
  };
})();
