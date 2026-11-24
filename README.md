# LifeDesk · Mesa de ayuda TI (demo)

Demo de **LifeSystem Solutions**: mesa de ayuda de TI para empresas peruanas, con un asistente virtual que resuelve los problemas básicos y un **cálculo de urgencia de 0 a 100** que prioriza y asigna cada ticket.

- `index.html` · presentación para el dueño o gerente (problema, cómo funciona, módulos, calculadora de ahorro, costo de IA real, contacto por WhatsApp).
- `app.html` · el sistema funcionando.

## Accesos directos

| Rol | Enlace | Qué ve |
|---|---|---|
| Empleado | `app.html?demo=empleado` | Asistente, mis tickets, mi equipo |
| Técnico | `app.html?demo=tecnico` | Mi cola, tickets, equipos, mantenimientos, guías |
| Jefa de TI | `app.html?demo=jefe` | Tablero, tickets, reportes, equipos, mantenimientos, guías, asistente (probar como cualquier empleado), ajustes |

Otros enlaces útiles para presentar:

- `app.html?demo=jefe#/tickets?sim=1` crea un ticket entrante de ejemplo («La facturación no envía a SUNAT») y lo abre.
- `app.html?demo=jefe#/tickets?id=primero` abre el ticket abierto más urgente.

Sin `?demo=` se muestra una pantalla para elegir el rol.

## Módulos

1. **Asistente virtual** · temas con ilustraciones, texto libre, pasos guiados («Ya funciona» / «Sigue igual»). Si no se resuelve, hace dos preguntas (¿a quién afecta? ¿puedes seguir trabajando?), muestra la urgencia calculada y crea el ticket con lo que ya se intentó. Ante un posible virus o ransomware da instrucciones inmediatas y lo pasa a N3.
2. **Cálculo de urgencia (triaje)** · `js/triaje.js`.
3. **Tickets** · cola por prioridad y plazo restante, tomar, en espera, notas (públicas o solo para TI), escalar N1 → N2 → N3, resolver, calificación del usuario (1 a 5), historial y **acta de atención imprimible**.
4. **Equipos** · inventario con código patrimonial (búsqueda o lector de código de barras), salud (disco, temperatura, RAM), recomendaciones, tickets por equipo, garantía.
5. **Mantenimientos** · preventivos por área, atrasados, programar y marcar hecho (actualiza la fecha de los equipos).
6. **Guías (base de conocimiento)** · los pasos que usa el asistente, con su porcentaje de éxito; se pueden editar.
7. **Reportes** · hoy / 7 / 30 días: tickets, % resuelto por el asistente, cumplimiento de plazos, satisfacción, tiempos promedio, horas y soles ahorrados, por día, tipo, área, hora y prioridad, desempeño por técnico, alertas y exportación a Excel (CSV).
8. **Ajustes** · empresa, pesos del cálculo con vista previa en vivo, umbrales P1–P3, plazos (SLA), criticidad de áreas, personas (DNI con RENIEC simulado), costos para el ahorro, historial de cambios y reinicio de datos.

Atajos de teclado: `/` buscar, `N` pedir ayuda, `Esc` cerrar el detalle, `?` ver atajos. Modo oscuro con el botón de luna.

## Cómo se calcula la urgencia

Puntaje = suma de cinco factores (pesos editables en Ajustes; por defecto suman 100):

| Factor | Peso | Valor |
|---|---|---|
| Impacto | 30 | solo a mí 0.2 · mi área 0.6 · toda la empresa 1 |
| Bloqueo | 25 | puede seguir 0.15 · a medias 0.55 · está parado 1 |
| Área | 15 | criticidad del área (baja 1/3, media 2/3, alta 1) |
| Riesgo | 20 | palabras: ransomware 1 · SUNAT/factura 0.9 · virus/phishing 0.8 · servidor/ERP/«todos» 0.8 · caja 0.7 · pagos 0.6 · pérdida de datos 0.5 |
| Contexto | 10 | cierre de mes +0.4 · cargo de jefatura +0.3 · el problema se repite en 7 días +0.4 (máx. 1) |

- Prioridad: **P1** ≥ 75 · **P2** ≥ 55 · **P3** ≥ 35 · **P4** el resto. Un posible ransomware siempre es P1.
- Nivel: según el tipo de problema (N1 mesa de ayuda, N2 campo, N3 redes y servidores); seguridad siempre N3; si afecta a toda la empresa, mínimo N2.
- Asignación: técnico con el nivel y la especialidad necesarios y menos tickets abiertos.
- Plazos por defecto (horas corridas): P1 15 min / 4 h · P2 1 h / 8 h · P3 2 h / 2 días · P4 8 h / 5 días.

## Costo de un asistente con IA real

La landing incluye una calculadora. Supuestos: unas 5,000 fichas (tokens) de entrada y 250 de salida por mensaje. Precios de lista de Anthropic consultados el 3 nov 2026, en US$ por millón de tokens:

| Modelo | Entrada | Salida |
|---|---|---|
| Claude Haiku 5.5 | 0.10 | 0.50 |
| Claude Sonnet 5.5 | 2.00 | 10.00 |
| Claude Opus 5.5 | 4.00 | 20.00 |

Ejemplo: 240 conversaciones de 6 mensajes al mes con Haiku 5.5 ≈ US$ 0.90 al mes; con Sonnet 5.5 ≈ US$ 18. No incluye IGV, el servidor que conecta la página con la IA (la clave de API nunca debe ir en el navegador) ni la implementación. Revisa los precios el día que cotices.

## Qué está simulado

- La empresa (Comercial Vértice Andina S.A.C.), las personas, los equipos y los tickets son **ficticios**.
- El asistente usa **reglas y palabras clave**, no IA.
- La consulta RENIEC, los avisos por WhatsApp, los adjuntos, la lectura de etiquetas con cámara y las lecturas de salud de los equipos (en producción las enviaría un agente instalado en la PC).
- Todo se guarda en el `localStorage` del navegador. No hay servidor.

## Datos de ejemplo

- 30 días de historia: unos 240 tickets y 185 casos resueltos por el asistente, 6 técnicos, 110 personas en 8 áreas, 129 equipos, 24 guías, mantenimientos e historial de cambios.
- **Hoy empieza en 0**: los datos se regeneran cada día y cuando cambia `SCHEMA` en `js/store.js`. «Ajustes → Reiniciar datos de ejemplo» los restaura a mano.

## Estructura

```
index.html            presentación
app.html              sistema
css/base.css          colores de marca, modo oscuro, botones
css/app.css           sistema
css/landing.css       presentación
js/icons.js           íconos e ilustraciones SVG dibujadas a mano
js/store.js           guardado y versión de esquema
js/seed.js            datos de ejemplo
js/triaje.js          cálculo de urgencia, plazos y asignación
js/ui.js              utilidades, medidor de urgencia, panel, avisos
js/tickets.js         tickets, cola, detalle, acta
js/asistente.js       asistente virtual
js/tablero.js         tablero de la jefatura
js/equipos.js         inventario y mi equipo
js/mantenimiento.js   mantenimientos
js/kb.js              guías
js/reportes.js        reportes y alertas
js/ajustes.js         ajustes
js/app.js             roles, navegación, tema y atajos
js/landing.js         interacción de la presentación
img/capturas/         capturas reales del sistema usadas en la presentación
```

Para verlo en local basta un servidor estático, por ejemplo `python -m http.server` dentro de esta carpeta. Al cambiar CSS o JS sube el `?v=` en `index.html` y `app.html` para que el navegador no use la versión guardada.

---

LifeSystem Solutions · WhatsApp +51 957 111 471
