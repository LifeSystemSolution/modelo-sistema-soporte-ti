/* Asistente virtual (simulado con reglas, no IA): intenta resolver con pasos guiados,
   y si no funciona hace 2 preguntas, calcula la urgencia y crea el ticket. */
(function () {
  const LD = (window.LD = window.LD || {});
  const U = LD.ui, I = LD.icon, S = () => LD.store;

  const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  const PISTAS = {
    impresora: /impres|imprim|tinta|toner|papel/, red: /internet|wifi|wi-fi|red\b|vpn|conexion|lento el internet/, correo: /correo|outlook|buzon|mail/,
    cuenta: /contrasen|clave|password|usuario|bloquead|acceso al sistema/, equipo: /pc|computadora|laptop|lenta|reinicia|no prende|pantalla azul/,
    software: /excel|word|pdf|programa|instalar|office/, reuniones: /teams|zoom|meet|camara|microfono|audio|escuch/, seguridad: /virus|sospechos|phishing|hacke|enlace raro|ransom|amenaza|extension rara/,
    hardware: /mouse|teclado|monitor|cargador|parpadea/, accesos: /carpeta|permiso|crear usuario|dar de baja/, telefonia: /anexo|telefono|central|llamada/,
    servidor: /erp|servidor|sunat|factura|sistema de ventas|no carga el sistema/
  };

  function buscarKB(texto) {
    const t = norm(texto);
    let mejor = null, max = 0;
    S().db.kb.forEach(k => {
      let s = 0;
      k.palabras.forEach(p => { if (t.includes(norm(p))) s += 2 + norm(p).split(' ').length; });
      norm(k.titulo).split(' ').forEach(w => { if (w.length > 4 && t.includes(w)) s += 1; });
      if (s > max) { max = s; mejor = k; }
    });
    return max >= 3 ? mejor : null;
  }
  function categoria(texto) {
    const t = norm(texto);
    for (const c in PISTAS) if (PISTAS[c].test(t)) return c;
    return null;
  }

  LD.vistas.asistente = {
    titulo: 'Pedir ayuda', menu: 'Asistente', icono: 'chat', corto: 'Ayuda',
    render(el) {
      const db = S().db;
      const esJefe = LD.sesion.rol === 'jefe';
      let usuario = esJefe ? db.personas.find(p => p.demo === 'empleado') : LD.sesion.persona;
      const st = {};
      const reset = () => Object.assign(st, { texto: '', kb: null, paso: 0, intentos: [], cat: null, alcance: null, bloqueo: null, seguridad: false });
      reset();

      const misAbiertos = () => db.tickets.filter(t => t.empleadoId === usuario.id && LD.tickets.abierto(t)).sort((a, b) => b.creado - a.creado);
      const top = db.kb.slice().sort((a, b) => b.resueltas - a.resueltas).slice(0, 5);

      el.innerHTML = '<div class="asis"><div class="chat"><div class="chat-log" id="log" aria-live="polite"></div>' +
        '<form class="chat-in" id="f-chat"><label class="sr-only" for="chat-txt">Describe tu problema</label><input id="chat-txt" autocomplete="off" placeholder="Escribe qué pasa, por ejemplo: no imprime"><button class="btn btn-primary btn-icon" aria-label="Enviar">' + I('send') + '</button></form></div>' +
        '<aside class="asis-lado">' +
        (esJefe ? '<div class="caja caja-p"><h3>Probar como</h3><label class="sr-only" for="como">Empleado</label><select id="como">' + db.personas.filter(p => !p.tecnico).map(p => '<option value="' + p.id + '"' + (p.id === usuario.id ? ' selected' : '') + '>' + U.esc(p.nombre) + ' · ' + U.esc(S().area(p.areaId).nombre) + '</option>').join('') + '</select><p class="muted" style="margin-top:8px">El área y el cargo cambian la urgencia calculada.</p></div>' : '') +
        '<div class="caja caja-p" id="lado-tk"></div>' +
        '<div class="caja caja-p"><h3>Lo que más se resuelve aquí</h3>' + top.map(k => '<button class="chip" style="margin:0 6px 6px 0" data-kbq="' + k.id + '">' + U.esc(k.titulo) + '</button>').join('') + '</div>' +
        '<p class="muted fila" style="font-size:13px;gap:8px;flex-wrap:nowrap;align-items:flex-start">' + I('alert') + ' Asistente simulado con reglas para la demo. La versión con IA real se cotiza aparte.</p>' +
        '</aside></div>';

      const log = el.querySelector('#log');
      const lado = () => {
        const ab = misAbiertos();
        el.querySelector('#lado-tk').innerHTML = '<h3>' + (esJefe ? 'Tickets de ' + U.esc(U.nombreCorto(usuario.nombre)) : 'Tus tickets en curso') + '</h3>' +
          (ab.length ? ab.slice(0, 4).map(t => '<a class="mini-tk" href="' + (esJefe ? '#/tickets?id=' : '#/mis-tickets?id=') + t.id + '"><b>' + U.esc(t.titulo) + '</b><span class="fila" style="gap:10px">' + U.prio(t.prioridad, true) + U.estado(t.estado) + '</span></a>').join('') : '<p class="muted">Ninguno. ¡Bien!</p>');
      };
      lado();

      const scroll = () => {
        log.scrollTop = log.scrollHeight;
        if (window.innerWidth <= 640 && log.lastElementChild && log.children.length > 2) log.lastElementChild.scrollIntoView({ block: 'center', behavior: 'smooth' });
      };
      function bot(html, full) {
        const d = document.createElement('div');
        d.className = 'msg bot' + (full ? ' msg-full' : '');
        d.innerHTML = '<span class="bot-av">' + I('chat') + '</span><div class="msg-b">' + html + '</div>';
        log.appendChild(d); scroll(); return d;
      }
      function yo(txt) {
        const d = document.createElement('div');
        d.className = 'msg yo';
        d.innerHTML = '<div class="msg-b">' + U.esc(txt) + '</div>';
        log.appendChild(d); scroll();
      }
      function opciones(ops) {
        log.querySelectorAll('.opciones').forEach(o => o.remove());
        const d = document.createElement('div');
        d.className = 'opciones';
        ops.forEach(o => {
          const b = document.createElement('button');
          b.type = 'button'; b.className = 'btn ' + (o.cls || 'btn-line'); b.innerHTML = (o.ic ? I(o.ic) : '') + U.esc(o.txt);
          b.onclick = () => { d.remove(); if (!o.silencio) yo(o.txt); o.fn(); };
          d.appendChild(b);
        });
        log.appendChild(d); scroll();
      }
      function pensando(fn, ms) {
        const d = bot('<span class="escribiendo" aria-label="Escribiendo"><i></i><i></i><i></i></span>');
        setTimeout(() => { d.remove(); fn(); }, ms || 550);
      }

      function saludo() {
        log.innerHTML = '';
        reset();
        bot('Hola, ' + U.esc(usuario.nombre.split(' ')[0]) + '. Cuéntame qué está fallando o elige un tema. Intentaré resolverlo contigo en unos minutos; si no se puede, aviso a TI con la urgencia correcta.');
        const d = document.createElement('div');
        d.className = 'temas';
        d.innerHTML = Object.keys(LD.CATEGORIAS).map(c => '<button type="button" class="tema" data-cat="' + c + '">' + LD.illus(c, 40) + U.esc(LD.CATEGORIAS[c].nombre) + '</button>').join('');
        d.onclick = e => { const b = e.target.closest('[data-cat]'); if (b) { d.remove(); elegirCat(b.dataset.cat); } };
        log.appendChild(d);
      }

      function elegirCat(c) {
        st.cat = c;
        yo(LD.CATEGORIAS[c].nombre);
        const arts = db.kb.filter(k => k.categoria === c);
        pensando(() => {
          bot('¿Cuál se parece más a lo que te pasa?');
          opciones(arts.map(k => ({ txt: k.titulo, fn: () => { st.texto = k.titulo; iniciarKB(k); } })).concat([{ txt: 'Es otra cosa', cls: 'btn-ghost', fn: () => { st.texto = LD.CATEGORIAS[c].nombre; pedirDetalle(); } }]));
        });
      }

      function texto(txt) {
        st.texto = txt;
        const t = norm(txt);
        st.cat = categoria(txt) || st.cat;
        if (PISTAS.seguridad.test(t)) return pensando(seguridad);
        const k = buscarKB(txt);
        pensando(() => {
          if (k) iniciarKB(k);
          else {
            bot('No tengo una guía para eso todavía. Te hago dos preguntas y paso tu caso a TI.');
            if (!st.cat) return elegirCatTriaje();
            preguntaAlcance();
          }
        });
      }

      function seguridad() {
        st.seguridad = true; st.cat = 'seguridad';
        bot('<b>Esto puede ser un problema de seguridad. Haz esto ahora:</b><ol><li>No hagas clic en nada más ni abras adjuntos.</li><li>Desconecta el cable de red o apaga el Wi-Fi de tu equipo.</li><li>No apagues la PC: el especialista necesita revisarla así.</li></ol>');
        setTimeout(() => { bot('Voy a crear el ticket de inmediato para el especialista de seguridad (N3).'); preguntaAlcance(); }, 400);
      }

      function iniciarKB(k) {
        if (k.categoria === 'seguridad') { st.texto = st.texto || k.titulo; return seguridad(); }
        st.kb = k; st.cat = k.categoria; st.paso = 0; st.intentos = [];
        k.vistas++; S().save();
        bot('Probemos esto: <b>' + U.esc(k.titulo) + '</b>. Son ' + U.plural(k.pasos.length, 'paso') + ' cortos.');
        mostrarPaso();
      }
      function mostrarPaso() {
        const k = st.kb;
        bot('<span class="paso-n">Paso ' + (st.paso + 1) + ' de ' + k.pasos.length + '</span>' + U.esc(k.pasos[st.paso]));
        opciones([
          { txt: 'Ya funciona', cls: 'btn-ok', ic: 'check', fn: resuelto },
          { txt: st.paso < k.pasos.length - 1 ? 'Hecho, sigue igual' : 'Hecho, sigue fallando', cls: 'btn-line', fn: () => siguiente(true) },
          { txt: 'No puedo hacer este paso', cls: 'btn-ghost', fn: () => siguiente(false) }
        ]);
      }
      function siguiente(hecho) {
        st.intentos.push((hecho ? '' : '(no pudo) ') + st.kb.pasos[st.paso]);
        st.paso++;
        if (st.paso < st.kb.pasos.length) pensando(mostrarPaso, 350);
        else pensando(() => { bot('Gracias por intentarlo. Ahora necesito dos datos para calcular qué tan urgente es.'); preguntaAlcance(); });
      }
      function resuelto() {
        st.kb.resueltas++;
        db.atenciones.push({ id: 'AT' + S().nextId('atencion'), t: Date.now(), empleadoId: usuario.id, areaId: usuario.areaId, kbId: st.kb.id, categoria: st.kb.categoria, resuelto: true });
        S().save();
        pensando(() => {
          bot('¡Listo! Quedó resuelto sin esperar a un técnico. Lo anoto para que TI sepa que esta guía funciona.');
          opciones([{ txt: 'Tengo otro problema', fn: saludo, silencio: true, cls: 'btn-dark' }]);
          if (LD.refrescarNav) LD.refrescarNav();
        });
      }

      function elegirCatTriaje() {
        bot('¿De qué tipo es el problema?');
        opciones(Object.keys(LD.CATEGORIAS).map(c => ({ txt: LD.CATEGORIAS[c].nombre, fn: () => { st.cat = c; preguntaAlcance(); } })));
      }
      function pedirDetalle() {
        bot('Cuéntame en una frase qué pasa, así el técnico llega sabiendo.');
        el.querySelector('#chat-txt').focus();
        st.esperandoDetalle = true;
      }
      function preguntaAlcance() {
        bot('¿A quién afecta el problema?');
        opciones([
          { txt: 'Solo a mí', fn: () => { st.alcance = 'yo'; preguntaBloqueo(); } },
          { txt: 'A mi área', fn: () => { st.alcance = 'area'; preguntaBloqueo(); } },
          { txt: 'A toda la empresa', fn: () => { st.alcance = 'empresa'; preguntaBloqueo(); } }
        ]);
      }
      function preguntaBloqueo() {
        pensando(() => {
          bot('¿Puedes seguir trabajando?');
          opciones([
            { txt: 'Sí, puedo seguir', fn: () => { st.bloqueo = 'no'; resumen(); } },
            { txt: 'A medias', fn: () => { st.bloqueo = 'parcial'; resumen(); } },
            { txt: 'No, estoy parado', fn: () => { st.bloqueo = 'total'; resumen(); } }
          ]);
        }, 300);
      }

      function resumen() {
        const titulo = st.kb ? st.kb.titulo : (st.texto || LD.CATEGORIAS[st.cat].nombre).replace(/^./, c => c.toUpperCase()).slice(0, 80);
        const desc = st.texto && st.texto !== titulo ? st.texto : '';
        const tri = LD.triaje.calcular({ alcance: st.alcance, bloqueo: st.bloqueo, areaId: usuario.areaId, texto: titulo + ' ' + st.texto, empleadoId: usuario.id, categoria: st.cat, fecha: Date.now() });
        const tecId = LD.triaje.asignar(st.cat, tri.nivel);
        const tec = S().persona(tecId);
        const sla = db.ajustes.sla[tri.prioridad];
        pensando(() => {
          bot('<div class="tri-card"><h4>' + U.esc(titulo) + '</h4>' + U.medidor(tri) +
            '<p style="margin-top:14px;font-size:14px">Te responderá <b>' + U.esc(tec ? U.nombreCorto(tec.nombre) : 'TI') + '</b> (' + U.esc(tec ? tec.cargo.toLowerCase() : '') + ') en máximo <b>' + U.duracion(sla.resp) + '</b>, y la meta para resolverlo es <b>' + U.duracion(sla.res) + '</b>.</p></div>', true);
          opciones([
            { txt: 'Crear ticket', cls: 'btn-primary', ic: 'send', fn: () => crearTicket(titulo, desc, tri) },
            { txt: 'Mejor lo intento de nuevo', cls: 'btn-ghost', fn: saludo, silencio: true }
          ]);
        }, 700);
      }

      function crearTicket(titulo, desc, tri) {
        const t = LD.tickets.crear({ empleadoId: usuario.id, categoria: st.cat, titulo, descripcion: desc, alcance: st.alcance, bloqueo: st.bloqueo, canal: 'asistente', kbId: st.kb ? st.kb.id : null, intentos: st.intentos, triaje: tri });
        db.atenciones.push({ id: 'AT' + S().nextId('atencion'), t: Date.now(), empleadoId: usuario.id, areaId: usuario.areaId, kbId: st.kb ? st.kb.id : null, categoria: st.cat, resuelto: false, ticketId: t.id });
        S().save();
        pensando(() => {
          bot('Listo, creé el ticket <b class="num">' + t.id + '</b> con prioridad <b>' + t.prioridad + ' ' + U.PRIO[t.prioridad] + '</b>. Te avisaremos por WhatsApp cuando el técnico lo tome <span class="muted">(simulado)</span>.');
          opciones([
            { txt: 'Ver mi ticket', cls: 'btn-dark', fn: () => LD.ir(esJefe ? 'tickets' : 'mis-tickets', { id: t.id }), silencio: true },
            { txt: 'Tengo otro problema', fn: saludo, silencio: true }
          ]);
          lado();
          LD.refrescarNav && LD.refrescarNav();
        });
      }

      el.querySelector('#f-chat').onsubmit = e => {
        e.preventDefault();
        const inp = el.querySelector('#chat-txt');
        const txt = inp.value.trim();
        if (!txt) { inp.focus(); return; }
        inp.value = '';
        log.querySelectorAll('.opciones, .temas').forEach(o => o.remove());
        yo(txt);
        if (st.esperandoDetalle) {
          st.esperandoDetalle = false; st.texto = txt;
          if (PISTAS.seguridad.test(norm(txt))) return pensando(seguridad);
          return pensando(preguntaAlcance);
        }
        if (st.alcance && !st.bloqueo) return;
        reset();
        texto(txt);
      };
      el.querySelectorAll('[data-kbq]').forEach(b => b.onclick = () => {
        log.querySelectorAll('.opciones, .temas').forEach(o => o.remove());
        const k = S().kb(b.dataset.kbq); reset(); yo(k.titulo); st.texto = k.titulo; pensando(() => iniciarKB(k));
      });
      const como = el.querySelector('#como');
      if (como) como.onchange = () => { usuario = S().persona(como.value); lado(); saludo(); };

      saludo();
    }
  };
})();
