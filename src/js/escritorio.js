/**
 * El escritorio: el catálogo de aplicaciones y todo lo que lo rodea — los
 * iconos, el menú de inicio, la barra de tareas, el reloj y el apagado.
 *
 * ⚠️ **`APLICACIONES` es la única lista.** Los iconos del escritorio, las
 * entradas del menú de inicio y los botones de la barra de tareas se pintan
 * desde aquí. En la versión de 2024 el menú estaba escrito a mano en el HTML y
 * las ventanas también: por eso «Calculadora» llevaba dos años en el menú sin
 * que existiera la ventana — nadie pudo verlo porque no había un sitio donde
 * las dos cosas tuvieran que coincidir.
 */
import { abrir, alternar, ventanas, observarVentanas } from './ventanas.js';
import { crearBuscaminas } from './apps/buscaminas.js';
import { crearCalculadora } from './apps/calculadora.js';
import { crearNavegador } from './apps/navegador.js';
import { crearBloc } from './apps/bloc.js';
import { crearVisorCv } from './apps/visor-pdf.js';

const APLICACIONES = [
  { id: 'cv', titulo: 'Currículum de Luis Aldrich', icono: 'i-pdf', montar: crearVisorCv, ancho: 760, alto: 620 },
  { id: 'minas', titulo: 'Buscaminas', icono: 'i-mina', montar: crearBuscaminas, ancho: 340, alto: 430 },
  { id: 'calc', titulo: 'Calculadora', icono: 'i-calc', montar: crearCalculadora, ancho: 260, alto: 330 },
  { id: 'ie', titulo: 'Internet Explorer', icono: 'i-ie', montar: crearNavegador, ancho: 620, alto: 480 },
  { id: 'bloc', titulo: 'Léeme.txt — Bloc de notas', icono: 'i-bloc', montar: crearBloc, ancho: 620, alto: 520 },
];

const porId = new Map(APLICACIONES.map(a => [a.id, a]));

// ─────────────── Iconos del escritorio ───────────────

const escritorio = document.getElementById('escritorio');

for (const app of APLICACIONES) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'icono';
  b.dataset.app = app.id;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', `#${app.icono}`);
  svg.append(use);
  const nombre = document.createElement('span');
  // El nombre corto: el del icono no tiene por qué ser el de la barra de título.
  nombre.textContent = app.titulo.split(' — ')[0];
  b.append(svg, nombre);
  escritorio.append(b);
}

/**
 * ⚠️ **Doble clic para abrir, como en XP — pero un solo toque en táctil.**
 * `dblclick` no llega en un teléfono, así que ahí el escritorio quedaba muerto:
 * los iconos se seleccionaban y no abrían nada.
 */
const tactil = matchMedia('(hover: none)').matches;
escritorio.addEventListener(tactil ? 'click' : 'dblclick', e => {
  const icono = e.target.closest('.icono');
  if (icono) abrir(porId.get(icono.dataset.app));
});

escritorio.addEventListener('click', e => {
  const icono = e.target.closest('.icono');
  for (const otro of escritorio.children) otro.classList.toggle('seleccionado', otro === icono);
});

// ─────────────── Menú de inicio ───────────────

const menu = document.getElementById('menu');
const botonInicio = document.getElementById('inicio');
const listaApps = document.getElementById('menu-apps');

for (const app of APLICACIONES) {
  const li = document.createElement('li');
  const b = document.createElement('button');
  b.type = 'button';
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', `#${app.icono}`);
  svg.append(use);
  b.append(svg, document.createTextNode(app.titulo.split(' — ')[0]));
  b.onclick = () => { abrir(app); cerrarMenu(); };
  li.append(b);
  listaApps.append(li);
}

function abrirMenu() {
  menu.classList.remove('oculto');
  botonInicio.setAttribute('aria-expanded', 'true');
}

function cerrarMenu() {
  menu.classList.add('oculto');
  botonInicio.setAttribute('aria-expanded', 'false');
}

botonInicio.addEventListener('click', e => {
  e.stopPropagation();
  menu.classList.contains('oculto') ? abrirMenu() : cerrarMenu();
});

// Un clic fuera lo cierra. ⚠️ El listener va en `document` y comprueba el
// objetivo: colgarlo del escritorio dejaba el menú abierto al pulsar una
// ventana, que es justo cuando más estorba.
document.addEventListener('click', e => {
  if (!menu.contains(e.target) && e.target !== botonInicio) cerrarMenu();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrarMenu(); });

// ─────────────── Barra de tareas ───────────────

const tareas = document.getElementById('tareas');

observarVentanas(() => {
  tareas.replaceChildren();
  for (const v of ventanas.values()) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'tarea';
    if (!v.minimizada && v.nodo.classList.contains('activa')) b.classList.add('activa');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', `#${v.icono}`);
    svg.append(use);
    const texto = document.createElement('span');
    texto.textContent = v.titulo;
    b.append(svg, texto);
    b.title = v.titulo;
    b.onclick = () => alternar(v);
    tareas.append(b);
  }
});

// ─────────────── Reloj ───────────────

const reloj = document.getElementById('reloj');

function pintarHora() {
  reloj.textContent = new Date().toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' });
}

// ⚠️ Se vuelve a programar cada minuto EN PUNTO, no con un `setInterval` de
// 60 000 ms: el intervalo se desfasa y acaba cambiando el minuto varios
// segundos tarde, que en un reloj se nota.
function programarReloj() {
  pintarHora();
  setTimeout(programarReloj, 60_000 - (Date.now() % 60_000));
}
programarReloj();

// ─────────────── Apagar ───────────────

const apagado = document.getElementById('apagado');
document.getElementById('apagar').onclick = () => { apagado.hidden = false; cerrarMenu(); };
document.getElementById('encender').onclick = () => { apagado.hidden = true; };

// ─────────────── Lo primero que se ve ───────────────

// El CV abierto de salida: quien entra desde un currículum o una oferta viene
// a eso, y que el escritorio salga vacío le haría buscarlo.
abrir(porId.get('cv'));
