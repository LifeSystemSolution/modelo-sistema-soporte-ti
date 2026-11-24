/* Datos de ejemplo ficticios: empresa, áreas, personas, equipos, base de conocimiento,
   30 días de tickets y atenciones del asistente. Hoy empieza en 0. */
(function () {
  const LD = (window.LD = window.LD || {});

  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const NOM_F = ['Rosa', 'María', 'Carmen', 'Lucía', 'Ana', 'Milagros', 'Jessica', 'Karina', 'Patricia', 'Elizabeth', 'Gabriela', 'Diana', 'Fiorella', 'Katherine', 'Sofía', 'Valeria', 'Yolanda', 'Silvia', 'Liliana', 'Roxana', 'Pamela', 'Mónica', 'Giovanna', 'Claudia', 'Rocío', 'Vanessa'];
  const NOM_M = ['José', 'Luis', 'Carlos', 'Jorge', 'Juan', 'Miguel', 'César', 'Víctor', 'Raúl', 'Renzo', 'Kevin', 'Brayan', 'Edwin', 'Wilmer', 'Ricardo', 'Alonso', 'Hugo', 'Percy', 'Marco', 'Fernando', 'Óscar', 'Gustavo', 'Iván', 'Walter'];
  const APE = ['Quispe', 'Huamán', 'Mamani', 'Flores', 'Rojas', 'Sánchez', 'García', 'Chávez', 'Ramos', 'Vargas', 'Castillo', 'Gutiérrez', 'Espinoza', 'Cárdenas', 'Condori', 'Ticona', 'Vásquez', 'Reyes', 'Díaz', 'Ríos', 'Cruz', 'Medina', 'Aguilar', 'Palomino', 'Zevallos', 'Villanueva', 'Lozano', 'Huerta', 'Arévalo', 'Pineda', 'Solís', 'Benites', 'Cáceres', 'Navarro'];

  const AREAS = [
    { id: 'GER', nombre: 'Gerencia', criticidad: 3, n: 6, sede: 'Sede central · piso 3', cargos: ['Gerente General', 'Gerente Comercial', 'Gerente de Finanzas', 'Asistente de Gerencia'] },
    { id: 'VEN', nombre: 'Ventas', criticidad: 3, n: 28, sede: 'Sede central · piso 1', cargos: ['Jefa de Ventas', 'Ejecutivo de ventas', 'Cajero', 'Vendedor de mostrador'] },
    { id: 'FIN', nombre: 'Contabilidad y Finanzas', criticidad: 2, n: 14, sede: 'Sede central · piso 2', cargos: ['Jefe de Contabilidad', 'Contador', 'Asistente contable', 'Tesorera'] },
    { id: 'ALM', nombre: 'Almacén', criticidad: 2, n: 22, sede: 'Almacén Callao', cargos: ['Jefe de Almacén', 'Almacenero', 'Auxiliar de almacén', 'Controlador de inventario'] },
    { id: 'LOG', nombre: 'Logística y Despacho', criticidad: 2, n: 18, sede: 'Almacén Callao', cargos: ['Jefa de Logística', 'Coordinador de despacho', 'Asistente logístico', 'Chofer repartidor'] },
    { id: 'RRH', nombre: 'Recursos Humanos', criticidad: 1, n: 8, sede: 'Sede central · piso 2', cargos: ['Jefa de RR.HH.', 'Analista de planillas', 'Asistente social', 'Reclutadora'] },
    { id: 'MKT', nombre: 'Marketing', criticidad: 1, n: 8, sede: 'Sede central · piso 3', cargos: ['Jefe de Marketing', 'Diseñadora gráfica', 'Community manager', 'Analista de marketing'] },
    { id: 'TI', nombre: 'Tecnología (TI)', criticidad: 3, n: 0, sede: 'Sede central · piso 2', cargos: [] }
  ];

  const TECNICOS = [
    { id: 'T1', nombre: 'Carla Mendoza Ríos', cargo: 'Jefa de TI', nivel: 3, jefe: true, especialidades: ['mesa', 'campo', 'redes'] },
    { id: 'T2', nombre: 'Diego Huamán Torres', cargo: 'Mesa de ayuda', nivel: 1, especialidades: ['mesa'] },
    { id: 'T3', nombre: 'Kevin Rojas Palomino', cargo: 'Mesa de ayuda', nivel: 1, especialidades: ['mesa'] },
    { id: 'T4', nombre: 'Luis Paredes Cáceres', cargo: 'Técnico de campo', nivel: 2, especialidades: ['campo', 'mesa'] },
    { id: 'T5', nombre: 'Milagros Torres Benites', cargo: 'Técnica de campo', nivel: 2, especialidades: ['campo', 'mesa'] },
    { id: 'T6', nombre: 'Jorge Salazar Navarro', cargo: 'Especialista en redes y servidores', nivel: 3, especialidades: ['redes', 'campo'] }
  ];

  /* Plantillas de tickets: [título, descripción, alcance más probable] */
  const PLANT = {
    impresora: [['La impresora no imprime', 'Mando a imprimir y se queda en cola, no sale nada.'], ['La impresora atasca el papel', 'Cada dos hojas se atasca el papel en la bandeja.'], ['La impresión sale en blanco', 'Las hojas salen sin tinta en algunas partes.'], ['No aparece la impresora en mi lista', 'Cambiaron la impresora del área y no la encuentro para imprimir.']],
    red: [['No tengo internet en mi PC', 'El ícono de red sale con una equis y no abre ninguna página.'], ['El Wi-Fi se cae a cada rato', 'La laptop se desconecta del Wi-Fi varias veces al día.'], ['El internet está muy lento en el área', 'Todo el área tiene el internet lentísimo desde la mañana.', 'area'], ['No conecta la VPN desde casa', 'Estoy en trabajo remoto y la VPN no conecta.']],
    correo: [['Outlook no abre', 'Al abrir Outlook se queda en "Cargando perfil".'], ['No me llegan los correos', 'Desde ayer no recibo correos de clientes.'], ['Mi buzón está lleno', 'Me sale aviso de buzón lleno y no puedo enviar.'], ['No puedo enviar adjuntos grandes', 'Los archivos de más de 20 MB rebotan.']],
    cuenta: [['Olvidé mi contraseña de Windows', 'No recuerdo la contraseña nueva que puse el viernes.'], ['Mi usuario está bloqueado', 'Puse mal la contraseña varias veces y ahora sale bloqueado.'], ['Necesito cambiar la contraseña del correo', 'Me pide cambiarla y no me acepta la nueva.'], ['No puedo entrar al sistema de ventas', 'Me dice usuario o clave incorrectos.']],
    equipo: [['La PC está muy lenta', 'Para abrir cualquier programa demora varios minutos.'], ['La PC se reinicia sola', 'Se apaga y se vuelve a prender sin avisar.'], ['La laptop no prende', 'Presiono el botón y no enciende ninguna luz.'], ['Pantalla azul al iniciar', 'Al prender sale una pantalla azul con un error.']],
    software: [['Excel se cuelga al abrir un archivo', 'El archivo de cuadre se queda "No responde".'], ['Necesito instalar un programa', 'Necesito el lector de PDF para firmar documentos.'], ['Word no guarda los cambios', 'Guardo el documento y al abrirlo no están los cambios.'], ['Error al abrir los PDF', 'Los PDF que envía el proveedor no abren.']],
    reuniones: [['No se escucha en Teams', 'En las reuniones de Teams nadie me escucha.'], ['La cámara no funciona en Zoom', 'Zoom no detecta la cámara de la laptop.'], ['El micrófono no funciona', 'El audífono con micrófono no se reconoce.'], ['No puedo compartir pantalla', 'Al compartir pantalla los demás la ven en negro.']],
    seguridad: [['Me llegó un correo sospechoso', 'Un correo dice ser del banco y pide mis datos.'], ['Hice clic en un enlace raro', 'Abrí un enlace de un correo y se descargó algo.'], ['El antivirus detectó una amenaza', 'Salió una alerta roja del antivirus.'], ['Archivos con extensión rara', 'Los archivos de la carpeta compartida tienen una extensión rara y no abren.', 'area']],
    hardware: [['El mouse no funciona', 'El mouse no mueve el cursor.'], ['Teclas del teclado no responden', 'Varias teclas no escriben.'], ['El monitor parpadea', 'La pantalla parpadea y a ratos se va a negro.'], ['Necesito un cargador de laptop', 'El cargador se dañó y la batería está por acabarse.']],
    accesos: [['Acceso a la carpeta compartida', 'Necesito entrar a la carpeta de Ventas en el servidor.'], ['Permiso para la carpeta de Contabilidad', 'Me cambiaron de puesto y necesito acceso.'], ['Crear usuario para personal nuevo', 'Ingresa una persona nueva el lunes, necesita correo y usuario.'], ['Dar de baja a usuario que cesó', 'Un colaborador cesó y hay que bloquear su acceso.']],
    telefonia: [['Mi anexo no tiene tono', 'Levanto el teléfono y no hay tono.'], ['No puedo transferir llamadas', 'Al transferir se corta la llamada.'], ['La central no contesta', 'Los clientes dicen que la central suena y nadie contesta.', 'area']],
    servidor: [['El ERP no carga', 'El sistema se queda cargando y no entra.', 'area'], ['La facturación no envía a SUNAT', 'Las facturas quedan pendientes de envío a SUNAT.', 'area'], ['No abre la carpeta del servidor', 'La unidad S: sale desconectada.', 'area'], ['Lentitud general del sistema', 'Todo el sistema está lento para todos.', 'empresa']]
  };
  const PESO_CAT = { impresora: 14, red: 12, correo: 10, cuenta: 13, equipo: 11, software: 11, reuniones: 7, seguridad: 4, hardware: 8, accesos: 6, telefonia: 3, servidor: 4 };

  const KB = [
    ['impresora', 'La impresora no imprime', ['impresora', 'no imprime', 'cola', 'imprimir'], ['Revisa que la impresora esté prendida y sin luz naranja parpadeando.', 'En tu PC abre Inicio → "Impresoras" y elige la impresora de tu área.', 'Cancela los documentos atascados en la cola ("Ver lo que se imprime" → Cancelar todo).', 'Apaga la impresora 30 segundos y vuelve a prenderla.', 'Imprime de nuevo una sola hoja de prueba.']],
    ['impresora', 'Papel atascado', ['atasca', 'atascado', 'papel'], ['Apaga la impresora.', 'Abre la tapa frontal y jala el papel con las dos manos, despacio y hacia afuera.', 'Revisa que no queden pedacitos de papel.', 'Pon máximo 100 hojas bien alineadas en la bandeja y prende la impresora.']],
    ['impresora', 'Agregar la impresora del área', ['no aparece', 'agregar impresora', 'nueva impresora', 'lista'], ['Abre Inicio → Configuración → Impresoras y escáneres.', 'Pulsa "Agregar dispositivo" y espera 1 minuto.', 'Elige la que tiene el nombre de tu área (por ejemplo IMP-VENTAS-01).', 'Imprime una página de prueba.']],
    ['red', 'Sin internet en la PC', ['internet', 'sin red', 'no abre paginas', 'equis', 'desconectado', 'red'], ['Revisa que el cable de red esté bien conectado detrás de la PC (debe sonar "clic").', 'Haz clic derecho en el ícono de red → "Solucionar problemas".', 'Reinicia la PC.', 'Pregunta a un compañero si a él sí le funciona: si nadie tiene internet, es un problema del área.']],
    ['red', 'El Wi-Fi se desconecta', ['wifi', 'wi-fi', 'se cae', 'inalambrica'], ['Olvida la red: Configuración → Wi-Fi → Administrar redes → Olvidar.', 'Vuelve a conectarte a la red de la oficina con la clave del área.', 'Acércate al punto de acceso o usa cable de red si lo tienes.']],
    ['red', 'La VPN no conecta', ['vpn', 'trabajo remoto', 'desde casa'], ['Verifica que tu internet de casa funcione abriendo cualquier página.', 'Cierra la VPN por completo y ábrela otra vez.', 'Revisa que escribiste tu usuario sin el @ de la empresa.', 'Reinicia la laptop y vuelve a intentar.']],
    ['correo', 'Outlook no abre', ['outlook', 'cargando perfil', 'correo no abre'], ['Cierra Outlook. Si no cierra, usa Ctrl + Shift + Esc y finaliza "Outlook".', 'Abre Outlook manteniendo presionada la tecla Ctrl y acepta "modo seguro".', 'Si abre en modo seguro, ciérralo y ábrelo normal.', 'Si sigue igual, entra al correo desde el navegador: outlook.office.com.']],
    ['correo', 'Buzón lleno', ['buzon lleno', 'buzón', 'espacio', 'no puedo enviar'], ['Vacía la carpeta "Elementos eliminados".', 'Ordena tu bandeja por tamaño y borra o guarda en tu PC los correos con adjuntos grandes.', 'Espera 5 minutos y prueba enviar.']],
    ['correo', 'No llegan los correos', ['no me llegan', 'no recibo', 'correos'], ['Revisa la carpeta de "Correo no deseado".', 'Revisa que no tengas una regla que mueva los correos.', 'Pide a alguien que te escriba de prueba y espera 2 minutos.']],
    ['cuenta', 'Olvidé mi contraseña', ['contraseña', 'clave', 'olvide', 'olvidé', 'password'], ['En la pantalla de inicio pulsa "Restablecer contraseña".', 'Responde tus preguntas de seguridad o usa el código que llega a tu celular.', 'Crea una clave de al menos 10 caracteres con mayúsculas y números.', 'Anota la clave en un lugar seguro, nunca en un papel pegado al monitor.']],
    ['cuenta', 'Usuario bloqueado', ['bloqueado', 'bloqueo', 'intentos'], ['Espera 15 minutos: el bloqueo se quita solo.', 'Escribe la clave con cuidado, revisa que Bloq Mayús esté apagado.', 'Si no recuerdas la clave, usa "Restablecer contraseña".']],
    ['equipo', 'La PC está lenta', ['lenta', 'lento', 'demora', 'se cuelga', 'pc lenta'], ['Guarda tu trabajo y reinicia la PC (no solo apagar la pantalla).', 'Cierra pestañas del navegador que no uses.', 'Abre el Administrador de tareas (Ctrl + Shift + Esc) y revisa qué usa más memoria.', 'Si tu disco está casi lleno, borra descargas que ya no necesitas.']],
    ['equipo', 'La PC se reinicia sola', ['reinicia', 'se apaga', 'reinicio'], ['Revisa que el cable de corriente esté firme y la PC no esté en una regleta suelta.', 'Comprueba que las rejillas de ventilación no estén tapadas.', 'Si se apaga varias veces al día, puede ser temperatura: un técnico debe revisarla.']],
    ['software', 'Excel no responde', ['excel', 'no responde', 'cuelga'], ['Espera 1 minuto: los archivos grandes demoran.', 'Cierra Excel con el Administrador de tareas.', 'Abre Excel vacío y luego el archivo desde Archivo → Abrir.', 'Si el archivo viene de correo, guárdalo primero en tu PC.']],
    ['software', 'Los PDF no abren', ['pdf', 'adobe', 'no abre pdf'], ['Haz clic derecho en el PDF → Abrir con → Microsoft Edge.', 'Si abre, marca "usar siempre esta aplicación".']],
    ['reuniones', 'No me escuchan en Teams', ['teams', 'no me escuchan', 'microfono', 'micrófono', 'audio'], ['En la reunión pulsa "Más" → Configuración del dispositivo.', 'Elige el micrófono correcto (tu audífono o el de la laptop).', 'Revisa que el botón de silencio del audífono no esté activado.', 'Sal y vuelve a entrar a la reunión.']],
    ['reuniones', 'La cámara no funciona', ['camara', 'cámara', 'zoom', 'video'], ['Revisa si la laptop tiene una tapita sobre la cámara.', 'Cierra otros programas que usen cámara (Teams, WhatsApp Web).', 'En Zoom: Configuración → Video y elige la cámara correcta.']],
    ['reuniones', 'Compartir pantalla sale en negro', ['compartir pantalla', 'pantalla negra'], ['Comparte una ventana en vez de toda la pantalla.', 'Cierra y vuelve a abrir la aplicación de reunión.']],
    ['seguridad', 'Correo sospechoso', ['sospechoso', 'phishing', 'banco', 'enlace', 'link raro'], ['No hagas clic en enlaces ni abras adjuntos.', 'No respondas ni reenvíes el correo.', 'Repórtalo a TI con este asistente: se crea un ticket de seguridad.']],
    ['hardware', 'El mouse o teclado no responde', ['mouse', 'teclado', 'teclas', 'raton'], ['Desconecta el cable USB y conéctalo en otro puerto.', 'Si es inalámbrico, cambia las pilas.', 'Reinicia la PC con el botón de encendido si no puedes usar el mouse.']],
    ['hardware', 'El monitor parpadea', ['monitor', 'parpadea', 'pantalla negra', 'pantalla'], ['Ajusta el cable de video detrás del monitor y de la PC.', 'Apaga el monitor 10 segundos y vuelve a prenderlo.']],
    ['accesos', 'Pedir acceso a una carpeta', ['carpeta', 'acceso', 'permiso', 'unidad'], ['Tu jefe debe aprobar el acceso: crea el ticket indicando la carpeta.', 'TI te dará el acceso en el día una vez aprobado.']],
    ['telefonia', 'El anexo no tiene tono', ['anexo', 'telefono', 'teléfono', 'tono'], ['Revisa que el cable del teléfono esté conectado a la toma de red.', 'Desconecta el teléfono 10 segundos y vuelve a conectarlo.']],
    ['servidor', 'El sistema (ERP) no carga', ['erp', 'sistema', 'no carga', 'servidor'], ['Pregunta a un compañero si a él le funciona.', 'Si a nadie le funciona, crea el ticket indicando que afecta al área: se atiende como urgente.']]
  ];

  const EQUIPOS_MOD = {
    pc: ['HP ProDesk 400 G7', 'Lenovo ThinkCentre M70q', 'Dell OptiPlex 3080'],
    laptop: ['Lenovo ThinkPad E14', 'Dell Latitude 3420', 'HP ProBook 440 G8'],
    impresora: ['Epson EcoTank L6270', 'HP LaserJet Pro M404dn', 'Brother HL-L5100DN'],
    red: ['MikroTik hEX RB750Gr3', 'TP-Link TL-SG1024', 'Ubiquiti UniFi AP AC Lite'],
    servidor: ['Dell PowerEdge T150', 'Synology DS920+']
  };

  function seed() {
    const r = rng(20261123);
    const pick = a => a[Math.floor(r() * a.length)];
    const between = (a, b) => a + r() * (b - a);
    const now = Date.now();
    const hoy0 = new Date(); hoy0.setHours(0, 0, 0, 0);
    const DIA = 864e5;
    const usados = new Set();
    const nombreUnico = (f) => {
      let n; do { n = pick(f ? NOM_F : NOM_M) + ' ' + pick(APE) + ' ' + pick(APE); } while (usados.has(n)); usados.add(n); return n;
    };

    const db = {
      empresa: { razon: 'Comercial Vértice Andina S.A.C.', nombre: 'Vértice Andina', ruc: '20612345671', direccion: 'Lima, Perú', telefono: '01 700 0000', rubro: 'Distribución de productos de consumo', ficticia: true },
      ajustes: {
        pesos: { impacto: 30, bloqueo: 25, area: 15, riesgo: 20, contexto: 10 },
        umbrales: { p1: 75, p2: 55, p3: 35 },
        sla: { P1: { resp: 15, res: 240 }, P2: { resp: 60, res: 480 }, P3: { resp: 120, res: 2880 }, P4: { resp: 480, res: 7200 } },
        costoHoraTecnico: 18, costoHoraEmpleado: 15, minutosPorAtencion: 25,
        horario: 'Lunes a viernes 8:00–18:00 · sábados 8:00–13:00',
        feriados: ['2026-12-08 Inmaculada Concepción', '2026-12-09 Batalla de Ayacucho', '2026-12-25 Navidad', '2027-01-01 Año Nuevo']
      },
      areas: AREAS.map(a => ({ id: a.id, nombre: a.nombre, criticidad: a.criticidad, sede: a.sede })),
      personas: [], equipos: [], tickets: [], atenciones: [], kb: [], mantenimientos: [], historial: [], chats: [],
      contadores: {}
    };

    // Personas
    let pid = 1;
    TECNICOS.forEach(t => db.personas.push(Object.assign({ areaId: 'TI', dni: String(40000000 + Math.floor(r() * 3e7)), anexo: String(200 + pid), tecnico: true, activo: true }, t, { id: t.id })));
    AREAS.forEach(a => {
      for (let i = 0; i < a.n; i++) {
        const cargo = i === 0 ? a.cargos[0] : (a.id === 'GER' && i < 3 ? a.cargos[i] : pick(a.cargos.slice(1)));
        const fem = /a$|Jefa|Tesorera|Diseñadora|Reclutadora/.test(cargo.split(' ')[0]) ? true : r() < .5;
        db.personas.push({ id: 'E' + (pid++), nombre: nombreUnico(fem), cargo, areaId: a.id, dni: String(10000000 + Math.floor(r() * 8e7)), anexo: String(100 + pid), activo: true });
      }
    });
    // Personas de demo con nombre fijo
    const rosa = db.personas.find(p => p.areaId === 'FIN' && p.cargo === 'Asistente contable');
    if (rosa) { rosa.nombre = 'Rosa Quispe Vargas'; rosa.demo = 'empleado'; }

    // Equipos
    let eid = 1;
    const anioActual = new Date().getFullYear();
    function nuevoEquipo(tipo, asignado, areaId) {
      const pref = { pc: 'PC', laptop: 'LT', impresora: 'IMP', red: 'RED', servidor: 'SRV' }[tipo];
      const anio = anioActual - Math.floor(between(0, 6));
      const ult = now - Math.floor(between(20, 220)) * DIA;
      const eq = {
        id: 'VA-' + pref + '-' + String(eid++).padStart(4, '0'), tipo, modelo: pick(EQUIPOS_MOD[tipo]), areaId, asignadoA: asignado || null,
        anio, garantiaHasta: new Date(anio + 3, Math.floor(r() * 12), 15).getTime(), estado: 'operativo',
        ultimoMant: ult, proximoMant: ult + 180 * DIA,
        salud: { disco: Math.round(between(55, 100)), temp: Math.round(between(42, 82)), ram: pick([8, 8, 16, 16, 32]) }
      };
      db.equipos.push(eq); return eq;
    }
    db.personas.forEach(p => {
      const tipo = (p.tecnico || /Ejecutivo|Gerente|Jef|Coordinador/.test(p.cargo) || r() < .15) ? 'laptop' : 'pc';
      p.equipoId = nuevoEquipo(tipo, p.id, p.areaId).id;
    });
    AREAS.forEach(a => { if (a.id !== 'TI') { nuevoEquipo('impresora', null, a.id); if (a.n > 15) nuevoEquipo('impresora', null, a.id); } });
    ['red', 'red', 'red', 'red', 'red', 'red'].forEach(t => nuevoEquipo(t, null, 'TI'));
    ['servidor', 'servidor', 'servidor'].forEach(t => nuevoEquipo(t, null, 'TI'));
    db.equipos.filter(e => e.tipo === 'servidor')[0].modelo = 'Dell PowerEdge T150';
    // Algunos en mal estado
    db.equipos.slice(10, 14).forEach(e => { e.salud.temp = Math.round(between(86, 94)); e.salud.disco = Math.round(between(28, 45)); });
    db.equipos[22].estado = 'en reparación';

    // Base de conocimiento
    KB.forEach((k, i) => db.kb.push({ id: 'KB' + String(i + 1).padStart(2, '0'), categoria: k[0], titulo: k[1], palabras: k[2], pasos: k[3], vistas: 0, resueltas: 0, actualizado: now - Math.floor(between(5, 120)) * DIA }));

    // Días de historia (30 días previos a hoy)
    const empleados = db.personas.filter(p => !p.tecnico);
    const catList = []; Object.keys(PESO_CAT).forEach(c => { for (let i = 0; i < PESO_CAT[c]; i++) catList.push(c); });
    const tmp = { tickets: [] };
    LD.store.db = db; // para que el triaje lea ajustes durante la siembra
    let tnum = 0, anum = 0;

    for (let d = 30; d >= 1; d--) {
      const dia = new Date(hoy0.getTime() - d * DIA);
      const dow = dia.getDay();
      if (dow === 0) continue;
      const nT = dow === 6 ? 3 + Math.floor(r() * 3) : 8 + Math.floor(r() * 7);
      const nA = dow === 6 ? 2 + Math.floor(r() * 3) : 6 + Math.floor(r() * 6);
      const hora = () => {
        const h = r() < .55 ? pick([8, 9, 9, 10, 10, 11]) : pick([12, 14, 15, 15, 16, 17]);
        return dow === 6 ? 8 + Math.floor(r() * 5) : h;
      };

      // Atenciones del asistente resueltas sin ticket
      for (let i = 0; i < nA; i++) {
        const k = pick(db.kb.filter(x => x.categoria !== 'servidor' && x.categoria !== 'seguridad' && x.categoria !== 'accesos'));
        const e = pick(empleados);
        const t = dia.getTime() + hora() * 36e5 + Math.floor(r() * 59) * 6e4;
        db.atenciones.push({ id: 'AT' + (++anum), t, empleadoId: e.id, areaId: e.areaId, kbId: k.id, categoria: k.categoria, resuelto: true });
        k.vistas++; k.resueltas++;
      }

      for (let i = 0; i < nT; i++) {
        const cat = pick(catList);
        const pl = pick(PLANT[cat]);
        let e = pick(empleados);
        if (cat === 'servidor' && r() < .5) e = pick(empleados.filter(p => p.areaId === 'VEN' || p.areaId === 'FIN'));
        const creado = dia.getTime() + hora() * 36e5 + Math.floor(r() * 59) * 6e4;
        const alcance = pl[2] || (r() < .82 ? 'yo' : 'area');
        const bloqueo = r() < .33 ? 'no' : r() < .72 ? 'parcial' : 'total';
        const tri = LD.triaje.calcular({ alcance, bloqueo, areaId: e.areaId, texto: pl[0] + ' ' + pl[1], empleadoId: e.id, categoria: cat, fecha: creado });
        const canal = r() < .58 ? 'asistente' : pick(['portal', 'teléfono', 'correo']);
        const tecnicoId = LD.triaje.asignar(cat, tri.nivel);
        const sla = LD.triaje.sla(tri.prioridad, creado);
        const s = db.ajustes.sla[tri.prioridad];
        const cumpleR = r() < .92, cumpleS = r() < .87;
        const respEn = creado + Math.round((cumpleR ? between(.15, .9) : between(1.1, 2.2)) * s.resp * 6e4);
        const resEn = creado + Math.round((cumpleS ? between(.2, .85) : between(1.05, 1.8)) * s.res * 6e4);
        const id = 'TK-' + String(++tnum + 1200).padStart(5, '0');
        const t = {
          id, titulo: pl[0], descripcion: pl[1], categoria: cat, empleadoId: e.id, areaId: e.areaId, equipoId: e.equipoId,
          alcance, bloqueo, canal, creado, puntaje: tri.puntaje, prioridad: tri.prioridad, nivel: tri.nivel, factores: tri.factores, seguridad: tri.seguridad,
          tecnicoId, venceRespuesta: sla.respuesta, venceResolucion: sla.resolucion, primeraRespuesta: null, resuelto: null, cerrado: null,
          estado: 'resuelto', satisfaccion: null, notas: [], eventos: [{ t: creado, txt: canal === 'asistente' ? 'Creado por el asistente (no se resolvió con los pasos)' : 'Creado por ' + canal }]
        };
        if (canal === 'asistente') {
          const k = db.kb.find(x => x.categoria === cat);
          if (k) { k.vistas++; t.kbIntentado = k.id; }
          db.atenciones.push({ id: 'AT' + (++anum), t: creado - 4 * 6e4, empleadoId: e.id, areaId: e.areaId, kbId: k ? k.id : null, categoria: cat, resuelto: false, ticketId: id });
        }
        const tec = db.personas.find(p => p.id === tecnicoId);
        t.eventos.push({ t: creado + 6e4, txt: 'Asignado automáticamente a ' + (tec ? tec.nombre : '—') + ' (N' + tri.nivel + ')' });

        // nada ocurre hoy: lo que se resolvería hoy queda abierto
        const corte = hoy0.getTime();
        const abierto = (resEn >= corte) || (d <= 4 && r() < .05);
        if (respEn < corte) { t.primeraRespuesta = respEn; t.eventos.push({ t: respEn, txt: (tec ? tec.nombre.split(' ')[0] : 'TI') + ' tomó el ticket' }); }
        if (abierto) {
          t.estado = t.primeraRespuesta ? pick(['en_progreso', 'en_progreso', 'en_espera']) : 'asignado';
          if (t.estado === 'en_espera') t.notas.push({ t: t.primeraRespuesta + 20 * 6e4, autor: tec ? tec.nombre : 'TI', txt: 'Esperando repuesto / respuesta del usuario.', interna: false });
        } else {
          t.resuelto = resEn;
          t.estado = r() < .8 ? 'cerrado' : 'resuelto';
          t.notas.push({ t: resEn - 10 * 6e4, autor: tec ? tec.nombre : 'TI', txt: pick(['Se reinició el servicio y se probó con el usuario.', 'Se reemplazó el cable y quedó operativo.', 'Se restableció la contraseña y se verificó el acceso.', 'Se limpió la cola y se reinstaló el controlador.', 'Se actualizó el programa y se probó.', 'Se cambió el periférico por uno de stock.']), interna: false });
          t.eventos.push({ t: resEn, txt: 'Resuelto' });
          if (t.estado === 'cerrado') { t.cerrado = resEn + 2 * 36e5; t.satisfaccion = r() < .7 ? 5 : r() < .7 ? 4 : r() < .6 ? 3 : 2; t.eventos.push({ t: t.cerrado, txt: 'Cerrado · el usuario calificó ' + t.satisfaccion + '/5' }); }
        }
        tmp.tickets.push(t);
        db.tickets.push(t);
      }
    }
    db.contadores.ticket = tnum + 1200;
    db.contadores.atencion = anum;

    // Mantenimientos preventivos: pasados hechos y próximos programados por área
    const areasMant = AREAS.filter(a => a.id !== 'TI');
    areasMant.forEach((a, i) => {
      const n = db.equipos.filter(e => e.areaId === a.id).length;
      db.mantenimientos.push({ id: 'MP' + (i + 1), areaId: a.id, titulo: 'Preventivo ' + a.nombre, equipos: n, fecha: hoy0.getTime() - (i * 4 + 3) * DIA + 9 * 36e5, tecnicoId: pick(['T4', 'T5']), estado: 'hecho' });
      db.mantenimientos.push({ id: 'MP' + (i + 20), areaId: a.id, titulo: 'Preventivo ' + a.nombre, equipos: n, fecha: hoy0.getTime() + (i * 5 + 2) * DIA + 9 * 36e5, tecnicoId: pick(['T4', 'T5']), estado: 'programado' });
    });
    db.mantenimientos.push({ id: 'MP40', areaId: 'TI', titulo: 'Revisión del servidor y copias de seguridad', equipos: 3, fecha: hoy0.getTime() + 5 * DIA + 19 * 36e5, tecnicoId: 'T6', estado: 'programado' });
    db.mantenimientos.push({ id: 'MP41', areaId: 'TI', titulo: 'Actualización de firmware de switches', equipos: 4, fecha: hoy0.getTime() - 2 * DIA + 19 * 36e5, tecnicoId: 'T6', estado: 'atrasado' });

    // Historial de cambios
    const H = [
      [26, 'Carla Mendoza Ríos', 'Cambió el SLA de P2', 'Resolución de 12 h a 8 h'],
      [21, 'Carla Mendoza Ríos', 'Ajustó pesos del triaje', 'Riesgo de 15 a 20 puntos'],
      [17, 'Jorge Salazar Navarro', 'Actualizó artículo', 'KB04 · Sin internet en la PC'],
      [12, 'Carla Mendoza Ríos', 'Reasignó ticket', 'TK-01288 de Kevin Rojas a Luis Paredes'],
      [9, 'Carla Mendoza Ríos', 'Agregó usuario', 'Personal nuevo de Almacén'],
      [6, 'Milagros Torres Benites', 'Marcó equipo en reparación', db.equipos[22].id],
      [4, 'Carla Mendoza Ríos', 'Cambió criticidad de área', 'Contabilidad y Finanzas: de baja a media'],
      [2, 'Jorge Salazar Navarro', 'Reprogramó mantenimiento', 'Firmware de switches']
    ];
    H.forEach(h => db.historial.push({ t: now - h[0] * DIA, usuario: h[1], accion: h[2], detalle: h[3] }));
    db.historial.sort((a, b) => b.t - a.t);

    return db;
  }

  LD.seed = seed;
})();
