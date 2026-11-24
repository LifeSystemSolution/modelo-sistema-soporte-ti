/* Íconos de interfaz (trazo 1.75) e ilustraciones dibujadas a mano por categoría */
(function () {
  const LD = (window.LD = window.LD || {});

  const ui = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/>',
    ticket: '<path d="M3 7a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-3a2 2 0 0 0 0-4z"/><path d="M9 5v14" stroke-dasharray="2 2.5"/>',
    queue: '<path d="M4 6h16M4 12h16M4 18h10"/><circle cx="19" cy="18" r="2"/>',
    monitor: '<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M9 20h6M12 16v4"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/>',
    chart: '<path d="M4 20V4"/><path d="M4 20h16"/><rect x="7" y="11" width="3" height="6"/><rect x="12" y="7" width="3" height="10"/><rect x="17" y="13" width="3" height="4"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    alert: '<path d="M12 3 2 20h20z"/><path d="M12 10v4.5M12 17.5v.5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4.5 4.5-6.5 8-6.5s7 2 8 6.5"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.8 3.6-5.5 6.5-5.5s5.7 1.7 6.5 5.5"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.8c2 .7 3.2 2.4 3.6 5.2"/>',
    arrowR: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    arrowL: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    arrowUp: '<path d="M12 19V5M6 11l6-6 6 6"/>',
    moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    logout: '<path d="M15 4h4v16h-4"/><path d="M10 8l-4 4 4 4M6 12h10"/>',
    print: '<path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="1.5"/><path d="M7 14h10v7H7z"/>',
    scan: '<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/><path d="M7 9v6M10 9v6M13 9v6M16.5 9v6"/>',
    send: '<path d="M4 12 20 4l-6 16-3-7z"/><path d="m11 13 9-9"/>',
    filter: '<path d="M4 5h16l-6 7.5V19l-4 2v-8.5z"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    more: '<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    shield: '<path d="M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6z"/>',
    note: '<path d="M5 3h10l4 4v14H5z"/><path d="M14 3v5h5M8 12h8M8 16h6"/>',
    up: '<path d="m6 15 6-6 6 6"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    whatsapp: '<path d="M4 20l1.3-4A8 8 0 1 1 8.4 19z"/><path d="M9 9.2c0 2.8 2.6 5.6 5.6 5.8l1.3-1.4-1.8-1-.9.8c-1-.4-2.1-1.5-2.5-2.5l.8-.9-1-1.8z"/>',
    swap: '<path d="M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/>',
    refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>',
    star: '<path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8 6.6 19.7l1.1-6.1L3.2 9.4l6.1-.8z"/>',
    pin: '<path d="M12 21s-7-6.3-7-12a7 7 0 0 1 14 0c0 5.7-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.3 2.4c-.5.2-.8.7-.8 1.2v.9M12 17v.5"/>',
    keyboard: '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.5M10 10h.5M14 10h.5M18 10h.5M7 14h10"/>',
    escalate: '<path d="M4 20h5v-5h5v-5h6"/><path d="m16 6 4 4-4 4" transform="translate(0 -4)"/>',
    camera: '<path d="M4 8h3l2-3h6l2 3h3v12H4z"/><circle cx="12" cy="13.5" r="3.5"/>',
    wrench: '<path d="M14.5 6.5a4 4 0 0 0 5 5L12 19a2.1 2.1 0 0 1-3-3z"/><path d="M14.5 6.5 17 4l3 3-2.5 2.5"/>',
    download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>'
  };

  function icon(name, cls) {
    const p = ui[name] || ui.help;
    return '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>';
  }

  /* Ilustraciones 64x64: trazo a mano (líneas ligeramente irregulares), relleno suave y un acento rojo */
  const S = 'stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"';
  const F = 'fill="var(--ill-fill, var(--surface))"';
  const R = 'fill="var(--brand)"';
  const ill = {
    impresora:
      '<path ' + F + ' ' + S + ' d="M14.5 26.2c11.8-.6 23.4-.4 35.3.1 2.4.1 4 1.9 4 4.2l-.3 14.6c0 1.6-1.3 2.8-2.9 2.8H13.4c-1.5 0-2.6-1.2-2.6-2.7l.2-15.2c0-2 1.6-3.7 3.5-3.8z"/>' +
      '<path fill="var(--bg)" ' + S + ' d="M19.3 26.1 19 10.8c8.6-.4 17.2-.3 25.8.1l-.3 15.3"/>' +
      '<path fill="var(--bg)" ' + S + ' d="M19.6 40.3c8.3-.3 16.5-.2 24.8.2l.4 14.6c-8.5.5-17 .5-25.4.1z"/>' +
      '<path ' + S + ' fill="none" d="M24.5 46.2h14.6M24.6 50.4h9.8"/>' +
      '<circle cx="46.5" cy="32.8" r="2.4" ' + R + '/>',
    red:
      '<path ' + F + ' ' + S + ' d="M12.4 38.6c13.2-.5 26.3-.4 39.3.2 1.6.1 2.7 1.3 2.7 2.8l-.2 8.3c0 1.4-1.1 2.5-2.5 2.5l-39.1.1c-1.5 0-2.6-1.2-2.6-2.6l.1-8.4c0-1.6 1-2.8 2.3-2.9z"/>' +
      '<path ' + S + ' fill="none" d="M21.5 38.4 19 18.6M42.6 38.5l2.6-19.9"/>' +
      '<path ' + S + ' fill="none" d="M24.2 13.8c5.4-4.6 11.8-4.8 17.3-.2M27.6 18.2c3-2.5 6.9-2.6 10.1 0"/>' +
      '<circle cx="32.8" cy="22.4" r="2.6" ' + R + '/>' +
      '<path ' + S + ' fill="none" d="M17.6 45.6h.3M23.4 45.6h.3M29.2 45.6h.3"/>' +
      '<path stroke="var(--brand)" stroke-width="2.2" stroke-linecap="round" fill="none" d="M40 45.4h8"/>',
    correo:
      '<path ' + F + ' ' + S + ' d="M10.8 18.5c14.2-.8 28.3-.7 42.4.1 1.4.1 2.5 1.3 2.5 2.7l-.4 23.8c0 1.5-1.2 2.6-2.7 2.6l-41.5-.2c-1.5 0-2.6-1.2-2.6-2.7l.2-23.6c0-1.4 1-2.6 2.1-2.7z"/>' +
      '<path ' + S + ' fill="none" d="M10.4 20.4 31.6 36c.7.5 1.6.5 2.3 0l21.5-15.6"/>' +
      '<circle cx="51.5" cy="17.4" r="7" ' + R + '/><path stroke="#fff" stroke-width="2.2" stroke-linecap="round" d="M51.5 14.2v3.8M51.5 20.6v.1"/>',
    cuenta:
      '<path ' + F + ' ' + S + ' d="M17.5 29.4c9.8-.5 19.5-.4 29.2.2 1.7.1 3 1.5 3 3.2l-.4 18.3c0 1.7-1.4 3-3.1 3H17.8c-1.7 0-3-1.4-3-3.1l.2-18.4c0-1.7 1.1-3.1 2.5-3.2z"/>' +
      '<path ' + S + ' fill="none" d="M22.4 29.2v-6.6c0-5.6 4.4-10.1 9.8-10.1 5.5 0 9.9 4.6 9.8 10.2l-.1 6.6"/>' +
      '<circle cx="32.2" cy="39.6" r="3.4" ' + R + '/><path ' + S + ' fill="none" d="M32.2 43v4.4"/>',
    equipo:
      '<path ' + F + ' ' + S + ' d="M9.6 14.4c15-.7 30-.6 44.9.1 1.4.1 2.4 1.2 2.4 2.6l-.3 25.6c0 1.4-1.1 2.5-2.5 2.5l-44.2.1c-1.4 0-2.5-1.1-2.5-2.5l.1-25.8c0-1.3 1-2.5 2.1-2.6z"/>' +
      '<path ' + S + ' fill="none" d="M26.4 45.6 24.8 53M37.8 45.5l1.6 7.4M20.2 53.4c8-.3 16-.3 24 .1"/>' +
      '<path stroke="var(--brand)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" fill="none" d="M18 31.8h6.2l3-6.8 4.6 13.2 3.6-9.4 2.4 3h8.4"/>',
    software:
      '<path ' + F + ' ' + S + ' d="M10.6 12.8c14.3-.6 28.6-.5 42.8.1 1.5.1 2.6 1.3 2.6 2.8l-.3 32.5c0 1.5-1.2 2.7-2.7 2.7l-42.2.1c-1.5 0-2.7-1.2-2.7-2.7l.1-32.7c0-1.5 1.1-2.7 2.4-2.8z"/>' +
      '<path ' + S + ' fill="none" d="M8.4 21.6c15.7-.4 31.4-.3 47.2.2"/>' +
      '<circle cx="13.8" cy="17.2" r="1.4" ' + R + '/><circle cx="18.4" cy="17.2" r="1.4" fill="currentColor"/>' +
      '<path ' + S + ' fill="none" d="M17 30.5h11.4M17 36.6h20.8M17 42.6h14.2"/>' +
      '<path fill="var(--brand)" d="M42.5 34.2c2.5 0 6.2 0 8.6.1l-.1 9.6c-2.9.1-5.8.1-8.6 0z" opacity=".9"/>',
    reuniones:
      '<path ' + F + ' ' + S + ' d="M10 18.2c10.6-.6 21.2-.5 31.8.1 1.6.1 2.8 1.4 2.8 3l-.3 21.5c0 1.6-1.3 2.9-2.9 2.9l-31.2.1c-1.6 0-2.9-1.3-2.9-2.9l.1-21.7c0-1.6 1.2-2.9 2.6-3z"/>' +
      '<path ' + S + ' fill="var(--bg)" d="m44.6 27.6 10-6.4c.9-.6 2 .1 2 1.1l-.2 19.6c0 1-1.1 1.7-2 1.1l-9.9-6.2"/>' +
      '<circle cx="26.6" cy="28.4" r="4.6" ' + S + ' fill="var(--bg)"/>' +
      '<path ' + S + ' fill="none" d="M18 41c1.6-4 5-5.8 8.6-5.8s7 1.8 8.6 5.7"/>' +
      '<path stroke="var(--brand)" stroke-width="2.6" stroke-linecap="round" d="M12.5 50.5 46 13.5"/>',
    seguridad:
      '<path ' + F + ' ' + S + ' d="M32.3 7.8c6.3 3.4 12.6 5.1 19.4 5.4l-.2 15.6c-.2 12.8-8.4 22.2-19.3 26.9-11-4.6-19.1-14.4-19.3-27.1l-.1-15.3c6.6-.4 13.1-2.1 19.5-5.5z"/>' +
      '<path fill="var(--brand)" d="M30 20.4c1.5-.1 3-.1 4.5 0l-.6 15.4c-1.1.1-2.2.1-3.3 0z"/>' +
      '<circle cx="32.2" cy="42.6" r="2.9" ' + R + '/>',
    hardware:
      '<path ' + F + ' ' + S + ' d="M8.4 30.5c11.6-.5 23.2-.4 34.8.2 1.4.1 2.5 1.2 2.5 2.6l-.3 15.4c0 1.4-1.2 2.5-2.6 2.5H8.6c-1.4 0-2.5-1.2-2.5-2.6l.1-15.5c0-1.4 1-2.5 2.2-2.6z"/>' +
      '<path ' + S + ' fill="none" d="M12.4 37.2h.4M18.4 37.2h.4M24.4 37.2h.4M30.4 37.2h.4M36.6 37.2h.4M13.6 43.8h24"/>' +
      '<path ' + F + ' ' + S + ' d="M50.6 21.8c3.6-.1 6.4 2.8 6.4 6.6l-.1 12c0 3.8-2.9 6.6-6.5 6.6-3.6 0-6.4-2.9-6.4-6.6l.1-12.1c0-3.7 2.9-6.4 6.5-6.5z"/>' +
      '<path ' + S + ' fill="none" d="M50.6 22v7.4M44.4 29.6c4.1-.2 8.3-.2 12.5 0"/>' +
      '<path stroke="var(--brand)" stroke-width="2.4" stroke-linecap="round" fill="none" d="M50.6 21.6c.4-5.4-2.5-9.8-9.6-9.4"/>',
    accesos:
      '<path ' + F + ' ' + S + ' d="M8.6 18.6c5-.3 9.9-.3 14.8 0l3.4 4.2c9.4-.3 18.8-.2 28.3.2 1.4.1 2.4 1.2 2.4 2.6l-.3 22.6c0 1.4-1.1 2.5-2.5 2.5l-46.1.1c-1.4 0-2.5-1.1-2.5-2.5l.2-27.2c0-1.4 1-2.5 2.3-2.5z"/>' +
      '<circle cx="31.2" cy="36" r="5.2" stroke="var(--brand)" stroke-width="2.6" fill="none"/>' +
      '<path stroke="var(--brand)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" fill="none" d="M36.4 36h11.4M43.4 36v4.4M47.6 36v3"/>',
    telefonia:
      '<path ' + F + ' ' + S + ' d="M14.4 24.6c11.6-.6 23.2-.5 34.8.1 1.6.1 2.8 1.4 2.8 3l-.3 21.4c0 1.6-1.3 2.9-2.9 2.9H14.6c-1.6 0-2.9-1.3-2.9-2.9l.1-21.5c0-1.6 1.2-2.9 2.6-3z"/>' +
      '<path ' + S + ' fill="var(--bg)" d="M12.2 17.6c13-4.4 26.8-4.5 39.6 0l.2 5.2c-2.6 1.5-5.6 1.5-8.4.1l-.4-3.6c-7.6-1.6-15.2-1.6-22.6 0l-.4 3.6c-2.8 1.5-5.6 1.4-8.2-.1z"/>' +
      '<path ' + S + ' fill="none" d="M24 33.4h.4M32 33.4h.4M40 33.4h.4M24 40h.4M32 40h.4M40 40h.4"/>' +
      '<path stroke="var(--brand)" stroke-width="2.6" stroke-linecap="round" d="M24 46.2h16.4"/>',
    servidor:
      '<path ' + F + ' ' + S + ' d="M14.6 9.4c11.6-.5 23.2-.4 34.8.1 1.4.1 2.4 1.2 2.4 2.6l-.2 10.2c0 1.4-1.1 2.5-2.5 2.5H14.8c-1.4 0-2.5-1.1-2.5-2.5l.1-10.3c0-1.4 1-2.5 2.2-2.6z"/>' +
      '<path ' + F + ' ' + S + ' d="M14.6 28.2c11.6-.5 23.2-.4 34.8.1 1.4.1 2.4 1.2 2.4 2.6l-.2 10.2c0 1.4-1.1 2.5-2.5 2.5H14.8c-1.4 0-2.5-1.1-2.5-2.5l.1-10.3c0-1.4 1-2.5 2.2-2.6z"/>' +
      '<path ' + S + ' fill="none" d="M20 17.2h10.4M20 36h10.4M32 43.6v6.8M18.6 54.2c8.9-.4 17.8-.4 26.8 0M32 50.4v3.8"/>' +
      '<circle cx="44.2" cy="17.2" r="2.4" fill="var(--ok)"/><circle cx="44.2" cy="36" r="2.4" ' + R + '/>'
  };

  function illus(cat, size) {
    const s = size || 48;
    return '<svg class="ill" width="' + s + '" height="' + s + '" viewBox="0 0 64 64" aria-hidden="true">' + (ill[cat] || ill.software) + '</svg>';
  }

  /* Glifo de prioridad: barras como señal (P1 = 4 barras) + color. Nunca se usa sin etiqueta. */
  function prioGlyph(p) {
    const n = 5 - Number(String(p).replace('P', ''));
    let b = '';
    for (let i = 0; i < 4; i++) {
      const h = 5 + i * 3;
      b += '<rect x="' + (1 + i * 4.2) + '" y="' + (17 - h) + '" width="3" height="' + h + '" rx="1" fill="' + (i < n ? 'currentColor' : 'var(--line-2)') + '"/>';
    }
    return '<svg class="prio-g" viewBox="0 0 18 18" aria-hidden="true">' + b + '</svg>';
  }

  LD.icon = icon;
  LD.illus = illus;
  LD.prioGlyph = prioGlyph;
})();
