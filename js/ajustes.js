/* Ajustes: empresa, reglas de urgencia con vista previa, plazos, áreas, personas (RENIEC simulado), costos, historial */
(function () {
  const LD = (window.LD = window.LD || {});
  const U = LD.ui, I = LD.icon, S = () => LD.store;

  const EJEMPLOS = [
    { l: 'Facturación caída en Ventas', alcance: 'area', bloqueo: 'total', areaId: 'VEN', texto: 'La facturación no envía a SUNAT', categoria: 'servidor' },
    { l: 'Impresora de una persona', alcance: 'yo', bloqueo: 'parcial', areaId: 'RRH', texto: 'La impresora no imprime', categoria: 'impresora' },
    { l: 'Correo sospechoso', alcance: 'yo', bloqueo: 'no', areaId: 'FIN', texto: 'Me llegó un correo sospechoso del banco', categoria: 'seguridad' }
  ];
  const NOM = ['Jhonatan', 'Mariela', 'Ronald', 'Sandra', 'Elmer', 'Yesenia', 'Martín', 'Nataly', 'Christian', 'Lorena'];
  const APE = ['Apaza', 'Choque', 'Inga', 'Laura', 'Mayta', 'Pari', 'Quiroz', 'Taipe', 'Yupanqui', 'Ccahuana'];

  LD.vistas.ajustes = {
    titulo: 'Ajustes', icono: 'settings',
    render(el) {
      const db = S().db, aj = db.ajustes;
      const pesos = Object.assign({}, aj.pesos);
      let ej = 0;
      const sec = (t, d, body) => '<section class="aj-sec"><div><h2>' + t + '</h2><p>' + d + '</p></div><div>' + body + '</div></section>';

      el.innerHTML =
        sec('Empresa', 'Datos que salen en las actas.', '<form id="f-emp" class="campos"><label class="campo">Razón social<input name="razon" value="' + U.esc(db.empresa.razon) + '"></label><label class="campo">RUC<input name="ruc" inputmode="numeric" maxlength="11" value="' + U.esc(db.empresa.ruc) + '"></label><label class="campo">Dirección<input name="direccion" value="' + U.esc(db.empresa.direccion) + '"></label><label class="campo">Horario de soporte<input name="horario" value="' + U.esc(aj.horario) + '"></label><div><button class="btn btn-dark">Guardar empresa</button></div></form>') +
        sec('Reglas de urgencia', 'Cuántos puntos aporta cada factor. Deben sumar 100. Mueve las barras y mira cómo cambia un caso de ejemplo.',
          '<div style="display:grid;gap:12px" id="pesos">' + ['impacto', 'bloqueo', 'area', 'riesgo', 'contexto'].map(k => '<label class="peso"><span><span class="sw seg-' + k + '" style="display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:6px"></span>' + { impacto: 'Impacto', bloqueo: 'Bloqueo', area: 'Área', riesgo: 'Riesgo', contexto: 'Contexto' }[k] + '</span><input type="range" min="0" max="50" step="5" name="' + k + '" value="' + pesos[k] + '"><output class="num">' + pesos[k] + '</output></label>').join('') + '</div>' +
          '<p id="suma" style="margin:10px 0;font-weight:600"></p>' +
          '<div class="campos" style="grid-template-columns:repeat(3,minmax(0,1fr))"><label class="campo">P1 desde<input type="number" id="u1" value="' + aj.umbrales.p1 + '" min="1" max="100"></label><label class="campo">P2 desde<input type="number" id="u2" value="' + aj.umbrales.p2 + '" min="1" max="100"></label><label class="campo">P3 desde<input type="number" id="u3" value="' + aj.umbrales.p3 + '" min="1" max="100"></label></div>' +
          '<div class="caja caja-p" style="margin-top:14px"><div class="chips" id="ejs" style="margin-bottom:14px">' + EJEMPLOS.map((e, i) => '<button type="button" class="chip' + (i === 0 ? ' on' : '') + '" data-i="' + i + '">' + U.esc(e.l) + '</button>').join('') + '</div><div id="preview"></div></div>' +
          '<div class="fila" style="margin-top:14px"><button class="btn btn-primary" id="g-pesos">Guardar reglas</button><button class="btn btn-ghost" id="r-pesos">Volver a los valores recomendados</button></div>') +
        sec('Plazos (SLA)', 'Tiempo máximo para responder y para resolver, en horas corridas.',
          '<div class="tabla-wrap"><table class="tabla"><thead><tr><th>Prioridad</th><th>Responder en (min)</th><th>Resolver en (horas)</th></tr></thead><tbody>' + ['P1', 'P2', 'P3', 'P4'].map(p => '<tr><td>' + U.prio(p) + '</td><td><input type="number" min="5" data-sla="' + p + '" data-k="resp" value="' + aj.sla[p].resp + '"></td><td><input type="number" min="1" data-sla="' + p + '" data-k="res" value="' + aj.sla[p].res / 60 + '"></td></tr>').join('') + '</tbody></table></div><button class="btn btn-dark" style="margin-top:12px" id="g-sla">Guardar plazos</button>') +
        sec('Áreas', 'La criticidad sube la urgencia de sus tickets.',
          '<div class="tabla-wrap"><table class="tabla"><thead><tr><th>Área</th><th>Sede</th><th>Personas</th><th>Criticidad</th></tr></thead><tbody>' + db.areas.map(a => '<tr><td><b>' + U.esc(a.nombre) + '</b></td><td>' + U.esc(a.sede) + '</td><td class="num">' + db.personas.filter(p => p.areaId === a.id).length + '</td><td><select data-crit="' + a.id + '" aria-label="Criticidad de ' + U.esc(a.nombre) + '">' + [[1, 'Baja'], [2, 'Media'], [3, 'Alta']].map(c => '<option value="' + c[0] + '"' + (a.criticidad === c[0] ? ' selected' : '') + '>' + c[1] + '</option>').join('') + '</select></td></tr>').join('') + '</tbody></table></div>') +
        sec('Personas', 'Empleados y técnicos. Al agregar, el nombre se completa con el DNI.',
          '<div class="fila entre" style="margin-bottom:12px"><label class="buscar">' + I('search') + '<span class="sr-only">Buscar persona</span><input type="search" data-buscar placeholder="Buscar por nombre, DNI o área"></label><button class="btn btn-primary" id="n-per">' + I('plus') + 'Agregar persona</button></div><div class="tabla-wrap"><table class="tabla"><thead><tr><th>Nombre</th><th>DNI</th><th>Área</th><th>Rol</th><th>Anexo</th></tr></thead><tbody id="per"></tbody></table></div><p class="muted" id="per-n" style="margin-top:8px"></p>') +
        sec('Costos para el ahorro', 'Se usan en Reportes para calcular cuánto ahorra el asistente.',
          '<form id="f-cost" class="campos"><label class="campo">Costo hora del técnico (S/)<input type="number" min="1" name="ct" value="' + aj.costoHoraTecnico + '"></label><label class="campo">Costo hora del empleado (S/)<input type="number" min="1" name="ce" value="' + aj.costoHoraEmpleado + '"></label><label class="campo">Minutos de técnico por caso<input type="number" min="1" name="mm" value="' + aj.minutosPorAtencion + '"></label><div><button class="btn btn-dark">Guardar costos</button></div></form>') +
        sec('Historial de cambios', 'Quién cambió qué.', '<ul class="linea">' + db.historial.slice(0, 15).map(h => '<li><time>' + U.cuando(h.t) + '</time><span><b style="color:var(--ink)">' + U.esc(h.usuario) + '</b> · ' + U.esc(h.accion) + (h.detalle ? ' · <span class="muted">' + U.esc(h.detalle) + '</span>' : '') + '</span></li>').join('') + '</ul>') +
        sec('Datos del demo', 'Borra lo que hiciste y vuelve a los datos de ejemplo de hoy.', '<button class="btn btn-line" id="reset">' + I('refresh') + 'Reiniciar datos de ejemplo</button>');

      // Vista previa del triaje con los pesos en edición
      const preview = () => {
        const suma = Object.values(pesos).reduce((s, v) => s + Number(v), 0);
        const sEl = el.querySelector('#suma');
        sEl.textContent = 'Suma: ' + suma + ' de 100' + (suma === 100 ? '' : suma > 100 ? ' · quita ' + (suma - 100) + ' puntos' : ' · faltan ' + (100 - suma) + ' puntos');
        sEl.style.color = suma === 100 ? 'var(--ok)' : 'var(--bad)';
        el.querySelector('#g-pesos').disabled = suma !== 100;
        const orig = { p: aj.pesos, u: aj.umbrales };
        aj.pesos = pesos;
        aj.umbrales = { p1: Number(el.querySelector('#u1').value), p2: Number(el.querySelector('#u2').value), p3: Number(el.querySelector('#u3').value) };
        const e = EJEMPLOS[ej];
        const tri = LD.triaje.calcular(Object.assign({}, e, { fecha: new Date().setDate(15) }));
        el.querySelector('#preview').innerHTML = U.medidor(tri);
        aj.pesos = orig.p; aj.umbrales = orig.u;
      };
      el.querySelector('#pesos').oninput = e => { if (e.target.name) { pesos[e.target.name] = Number(e.target.value); e.target.nextElementSibling.value = e.target.value; preview(); } };
      ['#u1', '#u2', '#u3'].forEach(s => el.querySelector(s).oninput = preview);
      el.querySelector('#ejs').onclick = e => { const c = e.target.closest('[data-i]'); if (!c) return; ej = Number(c.dataset.i); el.querySelectorAll('#ejs .chip').forEach(x => x.classList.toggle('on', x === c)); preview(); };
      el.querySelector('#g-pesos').onclick = () => {
        const u = { p1: Number(el.querySelector('#u1').value), p2: Number(el.querySelector('#u2').value), p3: Number(el.querySelector('#u3').value) };
        if (!(u.p1 > u.p2 && u.p2 > u.p3 && u.p3 > 0 && u.p1 <= 100)) { U.toast('Los umbrales deben ir de mayor a menor: P1 > P2 > P3.', 'error'); return; }
        aj.pesos = Object.assign({}, pesos); aj.umbrales = u;
        S().log('Ajustó reglas de urgencia', Object.keys(pesos).map(k => k + ' ' + pesos[k]).join(', ')); S().save();
        U.toast('Reglas guardadas. Se aplican a los tickets nuevos.');
      };
      el.querySelector('#r-pesos').onclick = () => {
        Object.assign(pesos, { impacto: 30, bloqueo: 25, area: 15, riesgo: 20, contexto: 10 });
        el.querySelectorAll('#pesos input').forEach(i => { i.value = pesos[i.name]; i.nextElementSibling.value = pesos[i.name]; });
        el.querySelector('#u1').value = 75; el.querySelector('#u2').value = 55; el.querySelector('#u3').value = 35; preview();
      };
      preview();

      el.querySelector('#f-emp').onsubmit = e => {
        e.preventDefault(); const f = new FormData(e.target);
        if (!/^(10|20)\d{9}$/.test(f.get('ruc'))) { U.toast('El RUC debe tener 11 dígitos y empezar con 10 o 20.', 'error'); return; }
        Object.assign(db.empresa, { razon: f.get('razon').trim(), ruc: f.get('ruc'), direccion: f.get('direccion').trim() });
        aj.horario = f.get('horario').trim();
        S().log('Editó datos de la empresa'); S().save(); U.toast('Datos de la empresa guardados.');
      };
      el.querySelector('#g-sla').onclick = () => {
        let ok = true;
        el.querySelectorAll('[data-sla]').forEach(i => { const v = Number(i.value); if (!(v > 0)) ok = false; });
        if (!ok) { U.toast('Todos los plazos deben ser mayores que 0.', 'error'); return; }
        el.querySelectorAll('[data-sla]').forEach(i => { aj.sla[i.dataset.sla][i.dataset.k] = i.dataset.k === 'res' ? Number(i.value) * 60 : Number(i.value); });
        S().log('Cambió los plazos (SLA)'); S().save(); U.toast('Plazos guardados. Se aplican a los tickets nuevos.');
      };
      el.querySelectorAll('[data-crit]').forEach(s => s.onchange = () => {
        const a = S().area(s.dataset.crit); a.criticidad = Number(s.value);
        S().log('Cambió criticidad de área', a.nombre + ': ' + s.options[s.selectedIndex].text); S().save(); U.toast(a.nombre + ': criticidad ' + s.options[s.selectedIndex].text.toLowerCase() + '.');
      });
      el.querySelector('#f-cost').onsubmit = e => {
        e.preventDefault(); const f = new FormData(e.target);
        const ct = Number(f.get('ct')), ce = Number(f.get('ce')), mm = Number(f.get('mm'));
        if (!(ct > 0 && ce > 0 && mm > 0)) { U.toast('Ingresa montos mayores que 0.', 'error'); return; }
        Object.assign(aj, { costoHoraTecnico: ct, costoHoraEmpleado: ce, minutosPorAtencion: mm });
        S().log('Cambió costos del ahorro'); S().save(); U.toast('Costos guardados.');
      };

      // Personas
      let q = '';
      const pintarPer = () => {
        const ps = db.personas.filter(p => !q || (p.nombre + ' ' + p.dni + ' ' + S().area(p.areaId).nombre).toLowerCase().includes(q));
        el.querySelector('#per').innerHTML = ps.slice(0, 25).map(p => '<tr><td><b>' + U.esc(p.nombre) + '</b><br><span class="muted">' + U.esc(p.cargo) + '</span></td><td class="num">' + p.dni + '</td><td>' + U.esc(S().area(p.areaId).nombre) + '</td><td>' + (p.tecnico ? (p.jefe ? 'Jefa de TI' : 'Técnico N' + p.nivel) : 'Empleado') + '</td><td class="num">' + p.anexo + '</td></tr>').join('');
        el.querySelector('#per-n').textContent = U.plural(ps.length, 'persona') + (ps.length > 25 ? ' · mostrando 25' : '');
      };
      el.querySelector('[data-buscar]').oninput = e => { q = e.target.value.trim().toLowerCase(); pintarPer(); };
      pintarPer();
      el.querySelector('#n-per').onclick = async () => {
        const d = document.createElement('div');
        const r = U.modal('Agregar persona', '<label class="campo">DNI<input name="dni" id="m-dni" inputmode="numeric" maxlength="8" placeholder="8 dígitos" required></label><button type="button" class="btn btn-line btn-sm" id="m-ren">' + I('search') + 'Consultar RENIEC (simulado)</button>' +
          '<label class="campo">Nombre completo<input name="nombre" id="m-nom" required></label><label class="campo">Área<select name="area">' + db.areas.filter(a => a.id !== 'TI').map(a => '<option value="' + a.id + '">' + U.esc(a.nombre) + '</option>').join('') + '</select></label><label class="campo">Cargo<input name="cargo" placeholder="Ej.: Asistente contable"></label>', [['cancelar', 'Cancelar', 'btn-line'], ['ok', 'Agregar', 'btn-primary']]);
        d.remove();
        setTimeout(() => {
          const b = document.getElementById('m-ren');
          if (b) b.onclick = () => {
            const dni = document.getElementById('m-dni').value.trim();
            if (!/^\d{8}$/.test(dni)) { U.toast('El DNI debe tener 8 números.', 'error'); return; }
            const n = Number(dni);
            document.getElementById('m-nom').value = NOM[n % 10] + ' ' + APE[Math.floor(n / 10) % 10] + ' ' + APE[Math.floor(n / 100) % 10];
            U.toast('Nombre encontrado (consulta simulada).', 'info');
          };
        }, 30);
        const res = await r;
        if (res.v !== 'ok') return;
        const dni = String(res.data.get('dni') || '').trim(), nombre = String(res.data.get('nombre') || '').trim();
        if (!/^\d{8}$/.test(dni) || !nombre) { U.toast('Falta el DNI de 8 números o el nombre. Vuelve a intentarlo.', 'error'); return; }
        if (db.personas.some(p => p.dni === dni)) { U.toast('Ese DNI ya está registrado.', 'error'); return; }
        db.personas.push({ id: 'E' + (db.personas.length + 100), nombre, dni, areaId: res.data.get('area'), cargo: String(res.data.get('cargo') || 'Colaborador').trim() || 'Colaborador', anexo: '—', activo: true });
        S().log('Agregó persona', nombre); S().save(); U.toast(nombre + ' agregado.'); pintarPer();
      };

      el.querySelector('#reset').onclick = async () => {
        const r = await U.modal('Reiniciar datos de ejemplo', '<p>Se borrarán los tickets y cambios que hiciste en este navegador y se cargarán los datos de ejemplo de hoy.</p>', [['cancelar', 'Cancelar', 'btn-line'], ['ok', 'Reiniciar', 'btn-primary']]);
        if (r.v !== 'ok') return;
        S().reset(); LD.sesion.persona = S().persona(LD.sesion.personaId) || LD.sesion.persona; U.toast('Datos de ejemplo restaurados.'); LD.refrescar();
      };
    }
  };
})();
