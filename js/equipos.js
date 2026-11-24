/* Equipos (inventario): código patrimonial escaneable, salud simulada, fallas y garantía */
(function () {
  const LD = (window.LD = window.LD || {});
  const U = LD.ui, I = LD.icon, S = () => LD.store;
  const TIPOS = { pc: 'PC de escritorio', laptop: 'Laptop', impresora: 'Impresora', red: 'Equipo de red', servidor: 'Servidor' };
  const ILL = { pc: 'equipo', laptop: 'equipo', impresora: 'impresora', red: 'red', servidor: 'servidor' };
  const DIA = 864e5;

  // Fallas del propio equipo (no cuenta contraseñas, correo, etc.)
  const DE_EQUIPO = ['equipo', 'hardware'];
  function fallas(eq, dias) { const d = Date.now() - (dias || 30) * DIA; return S().db.tickets.filter(t => t.equipoId === eq.id && t.creado > d && DE_EQUIPO.includes(t.categoria)); }
  function relacionados(eq, dias) { const d = Date.now() - (dias || 90) * DIA; return S().db.tickets.filter(t => t.equipoId === eq.id && t.creado > d); }
  function diagnostico(eq) {
    const s = eq.salud, rec = [];
    if (s.temp >= 85) rec.push({ mal: true, txt: 'Temperatura alta (' + s.temp + ' °C): limpiar ventiladores y cambiar pasta térmica.' });
    else if (s.temp >= 75) rec.push({ txt: 'Temperatura algo elevada (' + s.temp + ' °C): revisar ventilación.' });
    if (s.disco < 50) rec.push({ mal: true, txt: 'Disco con desgaste (' + s.disco + '% de vida): respaldar y cambiar por SSD.' });
    if (s.ram < 16 && (eq.tipo === 'pc' || eq.tipo === 'laptop')) rec.push({ txt: 'Con ' + s.ram + ' GB de RAM: ampliar a 16 GB mejora Excel y Teams.' });
    if (eq.proximoMant < Date.now()) rec.push({ mal: true, txt: 'Mantenimiento preventivo vencido desde el ' + U.fecha(eq.proximoMant) + '.' });
    if (fallas(eq).length >= 3) rec.push({ mal: true, txt: U.plural(fallas(eq).length, 'falla') + ' en 30 días: evaluar reemplazo.' });
    if (!rec.length) rec.push({ txt: 'Todo en orden. Próximo mantenimiento: ' + U.fecha(eq.proximoMant) + '.' });
    return rec;
  }
  function estadoChip(eq) {
    const rec = diagnostico(eq), malos = rec.filter(r => r.mal).length;
    if (eq.estado !== 'operativo') return '<span class="tag tag-red">' + U.esc(eq.estado) + '</span>';
    return malos ? '<span class="tag tag-red">' + I('alert') + U.plural(malos, 'alerta') + '</span>' : '<span class="tag">' + I('check') + 'En orden</span>';
  }
  function saludHtml(eq) {
    const s = eq.salud;
    const r = (l, p, val, c) => '<div class="salud-r"><span>' + l + '</span><i style="--p:' + p + '%;--c:' + c + '"></i><b class="num">' + val + '</b></div>';
    return '<div class="salud">' +
      r('Vida del disco', s.disco, s.disco + '%', s.disco < 50 ? 'var(--bad)' : s.disco < 70 ? 'var(--warn)' : 'var(--ok)') +
      r('Temperatura', Math.min(100, s.temp), s.temp + ' °C', s.temp >= 85 ? 'var(--bad)' : s.temp >= 75 ? 'var(--warn)' : 'var(--ok)') +
      (eq.tipo === 'pc' || eq.tipo === 'laptop' ? r('Memoria RAM', s.ram / 32 * 100, s.ram + ' GB', 'var(--info)') : '') + '</div>';
  }

  function detalle(id) {
    const eq = S().equipo(id);
    if (!eq) { U.toast('No existe el equipo ' + id + '. Revisa el código de la etiqueta.', 'error'); return; }
    const p = eq.asignadoA ? S().persona(eq.asignadoA) : null, a = S().area(eq.areaId);
    const fs = relacionados(eq, 90);
    const esTec = LD.sesion.rol !== 'empleado';
    const html = '<div class="panel-h"><div style="flex:1;min-width:0"><span class="sub num">' + eq.id + ' · ' + TIPOS[eq.tipo] + '</span><h2>' + U.esc(eq.modelo) + '</h2></div><button class="btn btn-ghost btn-icon" data-close aria-label="Cerrar">' + I('x') + '</button></div>' +
      '<div class="panel-c"><div class="fila">' + LD.illus(ILL[eq.tipo], 64) + estadoChip(eq) + '</div>' +
      '<div class="dato-grid"><div class="dato"><span>Asignado a</span><b>' + U.esc(p ? p.nombre : 'Uso compartido') + '</b></div><div class="dato"><span>Área</span><b>' + U.esc(a ? a.nombre : '—') + '</b></div>' +
      '<div class="dato"><span>Año de compra</span><b class="num">' + eq.anio + '</b></div><div class="dato"><span>Garantía</span><b>' + (eq.garantiaHasta > Date.now() ? 'Hasta ' + U.fecha(eq.garantiaHasta) + ' ' + new Date(eq.garantiaHasta).getFullYear() : 'Vencida') + '</b></div>' +
      '<div class="dato"><span>Último mantenimiento</span><b>' + U.fecha(eq.ultimoMant) + '</b></div><div class="dato"><span>Próximo</span><b>' + U.fecha(eq.proximoMant) + '</b></div></div>' +
      '<div class="bloque"><h3>Salud del equipo</h3>' + saludHtml(eq) + '<p class="muted" style="font-size:13px;margin-top:8px">Lecturas simuladas. En producción las envía un agente instalado en la PC.</p></div>' +
      '<div class="bloque"><h3>Qué se puede mejorar</h3><div class="alertas">' + diagnostico(eq).map(r => '<div class="alerta' + (r.mal ? ' mal' : '') + '">' + I(r.mal ? 'alert' : 'check') + '<div>' + U.esc(r.txt) + '</div></div>').join('') + '</div></div>' +
      '<div class="bloque"><h3>Tickets de este equipo (90 días)</h3>' + (fs.length ?'<ul class="linea">' + fs.sort((x, y) => y.creado - x.creado).map(t => '<li><time>' + U.fecha(t.creado) + '</time><a href="#/' + (esTec ? 'tickets' : 'mis-tickets') + '?id=' + t.id + '" data-close>' + t.id + ' · ' + U.esc(t.titulo) + '</a></li>').join('') + '</ul>' : '<p class="muted">Sin fallas registradas.</p>') + '</div></div>' +
      '<div class="panel-f"><button class="btn btn-dark" data-a="revisar">' + I('refresh') + 'Revisar salud ahora</button>' +
      (esTec ? '<button class="btn btn-line" data-a="estado">' + (eq.estado === 'operativo' ? 'Marcar en reparación' : 'Marcar operativo') + '</button>' : '') + '</div>';
    const pn = U.panel(html);
    pn.addEventListener('click', e => {
      const b = e.target.closest('[data-a]'); if (!b) return;
      if (b.dataset.a === 'revisar') {
        b.disabled = true; b.innerHTML = I('refresh') + 'Revisando…';
        setTimeout(() => {
          eq.salud.temp = Math.max(38, Math.min(95, eq.salud.temp + Math.round(Math.random() * 6 - 3)));
          S().save(); U.toast('Revisión lista (simulada).'); detalle(eq.id);
        }, 900);
      }
      if (b.dataset.a === 'estado') {
        eq.estado = eq.estado === 'operativo' ? 'en reparación' : 'operativo';
        S().log('Cambió estado de equipo', eq.id + ' → ' + eq.estado); S().save(); LD.refrescar(); detalle(eq.id);
      }
    });
  }

  LD.vistas.equipos = {
    titulo: 'Equipos', icono: 'monitor',
    render(el) {
      const db = S().db;
      const f = { tipo: '', q: '', alerta: false };
      el.innerHTML = '<div class="fila entre"><label class="buscar">' + I('search') + '<span class="sr-only">Buscar o escanear</span><input type="search" data-buscar placeholder="Código, modelo o persona. También acepta lector de barras"><kbd>/</kbd></label>' +
        '<button class="btn btn-line" id="scan">' + I('camera') + 'Escanear etiqueta</button></div>' +
        '<div class="chips" style="margin-top:12px" id="f-tipo"><button class="chip" data-t="">Todos</button>' + Object.keys(TIPOS).map(t => '<button class="chip" data-t="' + t + '">' + TIPOS[t] + '</button>').join('') + '<button class="chip" data-t="alerta">' + I('alert') + 'Con alertas</button></div>' +
        '<p class="muted" id="e-cuenta" style="margin:14px 0 8px"></p><div class="eq-grid" id="e-lista"></div>';
      const pintar = () => {
        let es = db.equipos.slice();
        if (f.tipo) es = es.filter(e => e.tipo === f.tipo);
        if (f.alerta) es = es.filter(e => e.estado !== 'operativo' || diagnostico(e).some(r => r.mal));
        if (f.q) { const q = f.q.toLowerCase(); es = es.filter(e => (e.id + ' ' + e.modelo + ' ' + ((S().persona(e.asignadoA) || {}).nombre || '') + ' ' + S().area(e.areaId).nombre).toLowerCase().includes(q)); }
        el.querySelector('#e-cuenta').textContent = U.plural(es.length, 'equipo') + (es.length > 48 ? ' · mostrando 48' : '');
        el.querySelector('#e-lista').innerHTML = es.length ? es.slice(0, 48).map(e => {
          const p = e.asignadoA ? S().persona(e.asignadoA) : null;
          return '<button class="eq" data-eq="' + e.id + '">' + LD.illus(ILL[e.tipo], 44) + '<div><b>' + U.esc(e.modelo) + '</b><span class="num">' + e.id + '</span><span>' + U.esc(p ? U.nombreCorto(p.nombre) : 'Compartido') + ' · ' + U.esc(S().area(e.areaId).nombre) + '</span><div class="eq-est">' + estadoChip(e) + '</div></div></button>';
        }).join('') : U.vacio('search', 'No encontramos ese equipo', 'Revisa el código de la etiqueta (ej.: VA-PC-0012) o busca por nombre.');
        el.querySelectorAll('#f-tipo .chip').forEach(c => c.classList.toggle('on', f.alerta ? c.dataset.t === 'alerta' : c.dataset.t === f.tipo));
      };
      el.querySelector('#f-tipo').onclick = e => { const c = e.target.closest('[data-t]'); if (!c) return; if (c.dataset.t === 'alerta') { f.alerta = true; f.tipo = ''; } else { f.alerta = false; f.tipo = c.dataset.t; } pintar(); };
      const inp = el.querySelector('[data-buscar]');
      inp.oninput = e => { f.q = e.target.value.trim(); pintar(); };
      inp.onkeydown = e => { if (e.key === 'Enter') { const eq = S().equipo(inp.value.trim().toUpperCase()); if (eq) detalle(eq.id); } };
      el.querySelector('#scan').onclick = () => {
        const eq = db.equipos[Math.floor(Math.random() * db.equipos.length)];
        U.toast('Etiqueta leída (simulado): ' + eq.id, 'info'); detalle(eq.id);
      };
      el.querySelector('#e-lista').onclick = e => { const b = e.target.closest('[data-eq]'); if (b) detalle(b.dataset.eq); };
      pintar();
    }
  };

  LD.vistas['mi-equipo'] = {
    titulo: 'Mi equipo', icono: 'monitor', corto: 'Mi PC',
    render(el) {
      const eq = S().equipo(LD.sesion.persona.equipoId);
      if (!eq) { el.innerHTML = U.vacio('monitor', 'No tienes un equipo asignado', 'Pide a TI que registre tu PC o laptop.'); return; }
      el.innerHTML = '<div class="caja caja-p" style="max-width:720px"><div class="fila" style="gap:16px">' + LD.illus(ILL[eq.tipo], 72) + '<div><h2 style="font-size:20px">' + U.esc(eq.modelo) + '</h2><p class="muted num">' + eq.id + ' · ' + TIPOS[eq.tipo] + '</p><div style="margin-top:6px">' + estadoChip(eq) + '</div></div></div>' +
        '<div class="bloque sec"><h3>Salud</h3>' + saludHtml(eq) + '</div>' +
        '<div class="bloque sec"><h3>Recomendaciones</h3><div class="alertas">' + diagnostico(eq).map(r => '<div class="alerta' + (r.mal ? ' mal' : '') + '">' + I(r.mal ? 'alert' : 'check') + '<div>' + U.esc(r.txt) + '</div></div>').join('') + '</div></div>' +
        '<div class="fila sec"><button class="btn btn-dark" id="ver">Ver detalle y fallas</button><a class="btn btn-line" href="#/asistente">Reportar un problema</a></div></div>';
      el.querySelector('#ver').onclick = () => detalle(eq.id);
    }
  };

  LD.equipos = { detalle, diagnostico, fallas, TIPOS };
})();
