/* Almacenamiento en localStorage con versión de esquema.
   Si cambia SCHEMA o es otro día, se regeneran los datos de ejemplo (hoy siempre empieza en 0). */
(function () {
  const LD = (window.LD = window.LD || {});
  const KEY = 'lifedesk-datos';
  const SCHEMA = 4;

  function pad(n) { return String(n).padStart(2, '0'); }
  function diaISO(d) { d = d || new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }

  const store = {
    db: null,
    SCHEMA,
    diaISO,
    init() {
      let raw = null;
      try { raw = JSON.parse(localStorage.getItem(KEY)); } catch (e) { raw = null; }
      if (!raw || raw.schema !== SCHEMA || raw.seedDay !== diaISO()) {
        raw = LD.seed();
        raw.schema = SCHEMA;
        raw.seedDay = diaISO();
        this.db = raw;
        this.save();
      } else {
        this.db = raw;
      }
      return this.db;
    },
    save() {
      try { localStorage.setItem(KEY, JSON.stringify(this.db)); }
      catch (e) { if (LD.ui) LD.ui.toast('No se pudo guardar en este navegador. Libera espacio o usa otro navegador.', 'error'); }
    },
    reset() {
      localStorage.removeItem(KEY);
      return this.init();
    },
    nextId(tipo) {
      const c = this.db.contadores;
      c[tipo] = (c[tipo] || 0) + 1;
      return c[tipo];
    },
    log(accion, detalle) {
      const u = LD.sesion ? LD.sesion.nombre : 'Sistema';
      this.db.historial.unshift({ t: Date.now(), usuario: u, accion, detalle: detalle || '' });
      if (this.db.historial.length > 300) this.db.historial.length = 300;
    },
    // atajos de búsqueda
    persona(id) { return this.db.personas.find(p => p.id === id); },
    area(id) { return this.db.areas.find(a => a.id === id); },
    equipo(id) { return this.db.equipos.find(e => e.id === id); },
    ticket(id) { return this.db.tickets.find(t => t.id === id); },
    tecnicos() { return this.db.personas.filter(p => p.tecnico); },
    kb(id) { return this.db.kb.find(k => k.id === id); }
  };

  LD.store = store;
})();
