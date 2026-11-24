/* Landing: cálculo de urgencia en vivo (mismo motor del sistema), módulos, calculadoras y contacto */
(function () {
  const LD = window.LD;
  const U = LD.ui;
  const WA = '51957111471';
  const wa = txt => 'https://wa.me/' + WA + '?text=' + encodeURIComponent(txt);

  LD.store.init();

  document.getElementById('l-logo').innerHTML = LD.logo ? LD.logo() : '<svg class="logo" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="7" fill="var(--brand)"/><path d="M9 8v13.5h7" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M18.5 14.5h2.8a3.5 3.5 0 0 1 0 7h-2.8z" stroke="#fff" stroke-width="2.6" stroke-linejoin="round" fill="none"/></svg><span class="logo-t">Life<b>Desk</b></span>';
  document.getElementById('wa-hero').href = wa('Hola, vi el demo de LifeDesk (mesa de ayuda TI) y quiero más información.');
  const fin = document.getElementById('wa-fin');
  fin.href = wa('Hola, quiero LifeDesk para mi empresa. ¿Podemos agendar una llamada?');
  fin.innerHTML = LD.icon('whatsapp') + 'Escribir al +51 957 111 471';
  document.getElementById('ill-emp').innerHTML = LD.illus('cuenta', 56);
  document.getElementById('ill-tec').innerHTML = LD.illus('equipo', 56);
  document.getElementById('ill-jef').innerHTML = LD.illus('servidor', 56);

  /* ---- Cálculo de urgencia en vivo ---- */
  const CASOS = [
    { id: 'sunat', l: 'Facturación SUNAT caída', texto: 'La facturación no envía a SUNAT', categoria: 'servidor', areaId: 'VEN', area: 'Ventas' },
    { id: 'imp', l: 'Impresora no imprime', texto: 'La impresora no imprime', categoria: 'impresora', areaId: 'RRH', area: 'Recursos Humanos' },
    { id: 'phish', l: 'Clic en enlace raro', texto: 'Hice clic en un enlace raro de un correo sospechoso', categoria: 'seguridad', areaId: 'FIN', area: 'Contabilidad' }
  ];
  const st = { caso: 'sunat', alcance: 'area', bloqueo: 'total' };
  const OPC = {
    caso: CASOS.map(c => [c.id, c.l]),
    alcance: [['yo', 'Solo a mí'], ['area', 'A mi área'], ['empresa', 'A todos']],
    bloqueo: [['no', 'Sí'], ['parcial', 'A medias'], ['total', 'No, estoy parado']]
  };
  const tri = document.getElementById('triaje');
  tri.querySelectorAll('[data-campo]').forEach(box => {
    const k = box.dataset.campo;
    box.innerHTML = OPC[k].map(o => '<button type="button" class="chip" data-v="' + o[0] + '">' + U.esc(o[1]) + '</button>').join('');
    box.onclick = e => { const b = e.target.closest('[data-v]'); if (b) { st[k] = b.dataset.v; pintarTriaje(); } };
  });
  function pintarTriaje() {
    tri.querySelectorAll('[data-campo]').forEach(box => box.querySelectorAll('.chip').forEach(c => { c.classList.toggle('on', c.dataset.v === st[box.dataset.campo]); c.setAttribute('aria-pressed', c.dataset.v === st[box.dataset.campo]); }));
    const c = CASOS.find(x => x.id === st.caso);
    const r = LD.triaje.calcular({ alcance: st.alcance, bloqueo: st.bloqueo, areaId: c.areaId, texto: c.texto, categoria: c.categoria, fecha: new Date().setDate(15) });
    document.getElementById('l-med').innerHTML = U.medidor(r);
    const sla = LD.store.db.ajustes.sla[r.prioridad];
    document.getElementById('l-med-pie').textContent = 'Área: ' + c.area + '. Respuesta en máximo ' + U.duracion(sla.resp) + ' y solución en ' + U.duracion(sla.res) + '. Mismo cálculo que usa el sistema.';
  }
  pintarTriaje();

  /* ---- Módulos ---- */
  const MODS = [
    ['reuniones', 'Asistente virtual', 'Resuelve problemas básicos con pasos guiados y crea el ticket si no funciona.'],
    ['servidor', 'Urgencia de 0 a 100', 'Impacto, bloqueo, área, palabras de riesgo y contexto. Siempre dice por qué.'],
    ['software', 'Tickets con plazos', 'Prioridad P1 a P4, tiempos de respuesta y solución, escalamiento N1, N2 y N3.'],
    ['equipo', 'Inventario de equipos', 'Código patrimonial escaneable, salud del disco y temperatura, fallas y garantía.'],
    ['hardware', 'Mantenimientos', 'Calendario de preventivos por área y alertas de equipos vencidos.'],
    ['accesos', 'Guías de ayuda', 'Las instrucciones que usa el asistente, con su porcentaje de éxito.'],
    ['red', 'Reportes', 'Tiempos, cumplimiento, problemas repetidos, carga por técnico y ahorro en soles.'],
    ['impresora', 'Acta de atención', 'Constancia imprimible con lo que se hizo, para firmar con el usuario.'],
    ['cuenta', 'Personas y áreas', 'Empleados con DNI (RENIEC simulado), técnicos por nivel y criticidad de cada área.'],
    ['seguridad', 'Incidentes de seguridad', 'Ante un posible virus o ransomware da instrucciones inmediatas y va directo a N3.']
  ];
  document.getElementById('l-mods').innerHTML = MODS.map(m => '<div class="l-mod">' + LD.illus(m[0], 48) + '<div><h3>' + m[1] + '</h3><p>' + m[2] + '</p></div></div>').join('');

  /* ---- Calculadora de ahorro ---- */
  const fA = document.getElementById('f-ahorro'), fI = document.getElementById('f-ia');
  const num = (f, n, d) => { const v = parseFloat(f.elements[n].value); return isFinite(v) && v >= 0 ? v : d; };
  function ahorro() {
    const emp = num(fA, 'emp', 80), ped = num(fA, 'ped', 3), def = num(fA, 'def', 40) / 100, ct = num(fA, 'ct', 18), ce = num(fA, 'ce', 15);
    document.getElementById('o-def').textContent = Math.round(def * 100) + '%';
    const conv = Math.round(emp * ped), res = Math.round(conv * def);
    const hT = res * 25 / 60, hE = res * 30 / 60, mes = hT * ct + hE * ce;
    document.getElementById('r-ahorro').innerHTML =
      '<div class="l-big"><span>Ahorro estimado al año</span><b class="num">' + U.soles(mes * 12) + '</b></div>' +
      '<dl class="l-dl"><div><dt>Pedidos de ayuda al mes</dt><dd class="num">' + conv.toLocaleString('es-PE') + '</dd></div>' +
      '<div><dt>Resueltos sin técnico</dt><dd class="num">' + res.toLocaleString('es-PE') + '</dd></div>' +
      '<div><dt>Horas de técnico libres al mes</dt><dd class="num">' + Math.round(hT) + ' h</dd></div>' +
      '<div><dt>Ahorro al mes</dt><dd class="num">' + U.soles(mes) + '</dd></div></dl>' +
      '<p class="l-res-pie">Cada caso resuelto ahorra 25 min de técnico y 30 min de espera del empleado.</p>';
    fI.elements.conv.value = conv;
    costoIA();
  }

  /* ---- Costo de IA real (precios de lista Anthropic al 3 nov 2026, US$ por millón de tokens) ---- */
  const PRECIOS = { haiku: [0.10, 0.50, 'Claude Haiku 5.5'], sonnet: [2, 10, 'Claude Sonnet 5.5'], opus: [4, 20, 'Claude Opus 5.5'] };
  function costoIA() {
    const m = PRECIOS[fI.elements.modelo.value] || PRECIOS.haiku;
    const conv = num(fI, 'conv', 240), turnos = num(fI, 'turnos', 6), tc = num(fI, 'tc', 3.75);
    const tin = turnos * 5000, tout = turnos * 250;
    const porConv = (tin * m[0] + tout * m[1]) / 1e6;
    const usd = porConv * conv;
    const fmtUsd = v => 'US$ ' + v.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    document.getElementById('r-ia').innerHTML =
      '<div class="l-big"><span>' + m[2] + ' · al mes</span><b class="num">' + fmtUsd(usd) + '</b><small class="num">≈ S/ ' + (usd * tc).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '</small></div>' +
      '<dl class="l-dl"><div><dt>Por conversación</dt><dd class="num">' + fmtUsd(porConv) + '</dd></div>' +
      '<div><dt>Tokens por conversación</dt><dd class="num">' + (tin + tout).toLocaleString('es-PE') + '</dd></div>' +
      '<div><dt>Al año</dt><dd class="num">' + fmtUsd(usd * 12) + '</dd></div></dl>';
  }
  fA.addEventListener('input', ahorro);
  fI.addEventListener('input', costoIA);
  [fA, fI].forEach(f => f.addEventListener('submit', e => e.preventDefault()));
  ahorro();
})();
