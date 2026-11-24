/* Triaje automático: puntaje 0–100 explicable, prioridad P1–P4, nivel N1–N3, SLA y asignación */
(function () {
  const LD = (window.LD = window.LD || {});

  const CATEGORIAS = {
    impresora: { nombre: 'Impresora', nivel: 1, esp: 'campo' },
    red: { nombre: 'Internet y red', nivel: 2, esp: 'redes' },
    correo: { nombre: 'Correo', nivel: 1, esp: 'mesa' },
    cuenta: { nombre: 'Contraseña y usuario', nivel: 1, esp: 'mesa' },
    equipo: { nombre: 'PC o laptop', nivel: 2, esp: 'campo' },
    software: { nombre: 'Programas', nivel: 1, esp: 'mesa' },
    reuniones: { nombre: 'Audio y video', nivel: 1, esp: 'mesa' },
    seguridad: { nombre: 'Seguridad', nivel: 3, esp: 'redes' },
    hardware: { nombre: 'Mouse, teclado, monitor', nivel: 2, esp: 'campo' },
    accesos: { nombre: 'Accesos y carpetas', nivel: 1, esp: 'mesa' },
    telefonia: { nombre: 'Teléfono y anexos', nivel: 2, esp: 'redes' },
    servidor: { nombre: 'Sistemas y servidor', nivel: 3, esp: 'redes' }
  };

  const RIESGO = [
    { re: /ransomware|rescate|cifrad|encriptad|extensi[oó]n rara/i, v: 1, tag: 'posible ransomware', seguridad: true },
    { re: /virus|malware|hacke|phishing|enlace (raro|sospechoso)|correo sospechoso|amenaza/i, v: .8, tag: 'riesgo de seguridad', seguridad: true },
    { re: /sunat|no (puedo |podemos )?factur|factura electr|boleta|comprobante/i, v: .9, tag: 'facturación SUNAT' },
    { re: /servidor|erp|sistema ca[ií]do|nadie puede|toda la oficina|todos/i, v: .8, tag: 'sistema compartido' },
    { re: /caja|pos\b|cobrar/i, v: .7, tag: 'cobranza en caja' },
    { re: /planilla|pago|banco|transferencia/i, v: .6, tag: 'pagos' },
    { re: /perd[ií]|borr[eé]|se borr/i, v: .5, tag: 'posible pérdida de datos' }
  ];

  const ALCANCE = { yo: { v: .2, txt: 'Solo a mí' }, area: { v: .6, txt: 'A mi área' }, empresa: { v: 1, txt: 'A toda la empresa' } };
  const BLOQUEO = { no: { v: .15, txt: 'Puede seguir trabajando' }, parcial: { v: .55, txt: 'Trabaja a medias' }, total: { v: 1, txt: 'Está parado' } };

  function calcular(o) {
    const db = LD.store.db;
    const pesos = db.ajustes.pesos;
    const fecha = new Date(o.fecha || Date.now());
    const texto = (o.texto || '').toLowerCase();
    const area = LD.store.area(o.areaId) || { criticidad: 1, nombre: '' };
    const persona = o.empleadoId ? LD.store.persona(o.empleadoId) : null;

    const al = ALCANCE[o.alcance] || ALCANCE.yo;
    const bl = BLOQUEO[o.bloqueo] || BLOQUEO.parcial;

    let riesgo = 0, riesgoTag = '', seguridad = false;
    RIESGO.forEach(r => { if (r.re.test(texto) && r.v > riesgo) { riesgo = r.v; riesgoTag = r.tag; } if (r.re.test(texto) && r.seguridad) seguridad = true; });
    if (o.categoria === 'seguridad') { seguridad = true; riesgo = Math.max(riesgo, .8); riesgoTag = riesgoTag || 'riesgo de seguridad'; }

    let ctx = 0; const ctxM = [];
    const d = fecha.getDate();
    if (d >= 26 || d <= 3) { ctx += .4; ctxM.push('cierre de mes'); }
    if (persona && /gerent|jef/i.test(persona.cargo || '')) { ctx += .3; ctxM.push('cargo ' + persona.cargo.toLowerCase()); }
    if (o.empleadoId) {
      const hace7 = fecha.getTime() - 7 * 864e5;
      const rep = db.tickets.some(t => t.empleadoId === o.empleadoId && t.categoria === o.categoria && t.creado > hace7 && t.creado < fecha.getTime());
      if (rep) { ctx += .4; ctxM.push('el problema se repite'); }
    }
    ctx = Math.min(1, ctx);

    const factores = [
      { clave: 'impacto', etiqueta: 'Impacto', valor: al.v, motivo: al.txt },
      { clave: 'bloqueo', etiqueta: 'Bloqueo', valor: bl.v, motivo: bl.txt },
      { clave: 'area', etiqueta: 'Área', valor: (area.criticidad || 1) / 3, motivo: area.nombre ? 'Criticidad de ' + area.nombre : 'Área' },
      { clave: 'riesgo', etiqueta: 'Riesgo', valor: riesgo, motivo: riesgoTag ? 'Menciona ' + riesgoTag : 'Sin palabras de riesgo' },
      { clave: 'contexto', etiqueta: 'Contexto', valor: ctx, motivo: ctxM.length ? ctxM.join(', ') : 'Sin contexto especial' }
    ].map(f => Object.assign(f, { peso: pesos[f.clave], pts: Math.round(f.valor * pesos[f.clave]) }));

    let puntaje = Math.min(100, factores.reduce((s, f) => s + f.pts, 0));
    if (/ransomware|rescate|cifrad/i.test(texto)) puntaje = Math.max(puntaje, 90);

    const u = db.ajustes.umbrales;
    const prioridad = puntaje >= u.p1 ? 'P1' : puntaje >= u.p2 ? 'P2' : puntaje >= u.p3 ? 'P3' : 'P4';

    const cat = CATEGORIAS[o.categoria] || CATEGORIAS.software;
    let nivel = cat.nivel;
    if (seguridad) nivel = 3;
    if (o.alcance === 'empresa') nivel = Math.max(nivel, (o.categoria === 'red' || o.categoria === 'servidor') ? 3 : 2);

    return { puntaje, prioridad, nivel, factores, seguridad };
  }

  function sla(prioridad, desde) {
    const s = LD.store.db.ajustes.sla[prioridad];
    return { respuesta: desde + s.resp * 6e4, resolucion: desde + s.res * 6e4 };
  }

  function asignar(categoria, nivel) {
    const db = LD.store.db;
    const esp = (CATEGORIAS[categoria] || {}).esp;
    const abiertos = id => db.tickets.filter(t => t.tecnicoId === id && !['resuelto', 'cerrado'].includes(t.estado)).length;
    let cands = LD.store.tecnicos().filter(p => p.nivel >= nivel && p.activo !== false && !p.jefe);
    const conEsp = cands.filter(p => (p.especialidades || []).includes(esp));
    if (conEsp.length) cands = conEsp;
    if (!cands.length) cands = LD.store.tecnicos();
    cands.sort((a, b) => abiertos(a.id) - abiertos(b.id) || a.nivel - b.nivel);
    return cands[0] ? cands[0].id : null;
  }

  LD.CATEGORIAS = CATEGORIAS;
  LD.ALCANCE = ALCANCE;
  LD.BLOQUEO = BLOQUEO;
  LD.triaje = { calcular, sla, asignar };
})();
