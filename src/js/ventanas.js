/**
 * El gestor de ventanas: abrir, cerrar, arrastrar, redimensionar, minimizar,
 * maximizar y decidir quién va delante.
 *
 * Es lo único que sabe de ventanas. Una aplicación le pasa un título, un icono
 * y el nodo con su contenido, y a cambio no se entera de nada de esto.
 */

const BARRA = 40;          // alto de la barra de tareas, en px
const CASCADA = 26;        // lo que se desplaza cada ventana nueva
let zMax = 10;
let abiertas = 0;

/** Las ventanas vivas, por id de aplicación. */
export const ventanas = new Map();

/** A quién avisar cuando cambia algo que la barra de tareas tiene que pintar. */
let alCambiar = () => {};
export function observarVentanas(fn) { alCambiar = fn; }

/**
 * Abre la ventana de una aplicación, o la trae al frente si ya estaba.
 *
 * ⚠️ **El contenido se construye UNA vez.** `app.montar()` se llama en la
 * primera apertura y su resultado se guarda: cerrar y volver a abrir el
 * buscaminas conserva la partida, que es lo que hace cualquier escritorio. Si
 * una app quiere empezar de cero, lo hace en su propio botón.
 */
export function abrir(app) {
  const existente = ventanas.get(app.id);
  if (existente) {
    existente.minimizada = false;
    existente.nodo.hidden = false;
    alFrente(existente);
    return existente;
  }

  const nodo = document.createElement('section');
  nodo.className = 'ventana';
  nodo.setAttribute('role', 'dialog');
  nodo.setAttribute('aria-label', app.titulo);
  // ⚠️ La plantilla es FIJA y el título entra por `textContent`. Interpolarlo
  // aquí dentro haría que el nombre de una app pudiera inyectar etiquetas; hoy
  // el catálogo lo escribimos nosotros, pero una plantilla con huecos es una
  // invitación a que mañana venga de fuera.
  nodo.innerHTML = `
    <header class="barra-titulo">
      <svg aria-hidden="true"><use/></svg>
      <h2></h2>
      <div class="botones">
        <button class="minimizar" type="button" aria-label="Minimizar">_</button>
        <button class="maximizar" type="button" aria-label="Maximizar">□</button>
        <button class="cerrar"    type="button" aria-label="Cerrar">✕</button>
      </div>
    </header>
    <div class="cuerpo"></div>
    <div class="agarre" aria-hidden="true"></div>`;

  nodo.querySelector('.barra-titulo h2').textContent = app.titulo;
  nodo.querySelector('.barra-titulo use').setAttribute('href', `#${app.icono}`);

  const cuerpo = nodo.querySelector('.cuerpo');
  cuerpo.append(app.montar());

  // Dónde cae. En cascada, pero sin salirse nunca por abajo ni por la derecha.
  const ancho = Math.min(app.ancho ?? 560, innerWidth - 24);
  const alto = Math.min(app.alto ?? 400, innerHeight - BARRA - 24);
  const salto = (abiertas++ % 6) * CASCADA;
  nodo.style.width = `${ancho}px`;
  nodo.style.height = `${alto}px`;
  // ⚠️ La cascada arranca pasada la columna de iconos (102 px), no en el borde.
  // Empezando en 40 la primera ventana caía justo encima de ellos, y como el CV
  // se abre solo, lo primero que veías era un escritorio sin iconos: parecía que
  // no había nada más que mirar.
  nodo.style.left = `${Math.max(8, Math.min(150 + salto, innerWidth - ancho - 8))}px`;
  nodo.style.top = `${Math.max(8, Math.min(30 + salto, innerHeight - BARRA - alto - 8))}px`;

  document.body.append(nodo);

  const v = { id: app.id, titulo: app.titulo, icono: app.icono, nodo, minimizada: false };
  ventanas.set(app.id, v);

  nodo.querySelector('.cerrar').onclick = () => cerrar(v);
  nodo.querySelector('.minimizar').onclick = () => minimizar(v);
  nodo.querySelector('.maximizar').onclick = () => alternarMaximo(v);
  nodo.addEventListener('mousedown', () => alFrente(v));
  nodo.addEventListener('touchstart', () => alFrente(v), { passive: true });

  const titulo = nodo.querySelector('.barra-titulo');
  titulo.addEventListener('dblclick', () => alternarMaximo(v));
  arrastrable(nodo, titulo);
  redimensionable(nodo, nodo.querySelector('.agarre'));

  alFrente(v);
  return v;
}

export function cerrar(v) {
  v.nodo.remove();
  ventanas.delete(v.id);
  alCambiar();
}

export function minimizar(v) {
  v.minimizada = true;
  v.nodo.hidden = true;
  v.nodo.classList.remove('activa');
  alCambiar();
}

/** El botón de la barra de tareas: restaura, o minimiza si ya estaba delante. */
export function alternar(v) {
  if (v.minimizada) { v.minimizada = false; v.nodo.hidden = false; alFrente(v); }
  else if (v.nodo.classList.contains('activa')) minimizar(v);
  else alFrente(v);
}

export function alFrente(v) {
  for (const otra of ventanas.values()) otra.nodo.classList.remove('activa');
  v.nodo.classList.add('activa');
  v.nodo.style.zIndex = String(++zMax);
  alCambiar();
}

function alternarMaximo(v) {
  v.nodo.classList.toggle('maxima');
  alFrente(v);
}

/**
 * Arrastrar por la barra de título.
 *
 * ⚠️ **Se escucha en `window` y no en la ventana.** Si el ratón se mueve más
 * rápido de lo que el navegador reparte eventos, el puntero se sale de la caja
 * y los `mousemove` dejan de llegar: la ventana se quedaba clavada a medio
 * camino hasta que volvías a entrar en ella.
 *
 * ⚠️ **Y no se deja subir por encima del borde de arriba.** Una ventana cuya
 * barra de título se va fuera de la pantalla no se puede volver a agarrar.
 */
function arrastrable(nodo, tirador) {
  let dx = 0, dy = 0, activo = false;

  const empezar = (x, y) => {
    if (nodo.classList.contains('maxima')) return;
    activo = true;
    dx = x - nodo.offsetLeft;
    dy = y - nodo.offsetTop;
    document.body.classList.add('arrastrando');
  };

  const mover = (x, y) => {
    if (!activo) return;
    const ancho = nodo.offsetWidth;
    // Se permite sacarla por los lados dejando siempre un asa visible.
    nodo.style.left = `${Math.min(Math.max(x - dx, 40 - ancho), innerWidth - 40)}px`;
    nodo.style.top = `${Math.min(Math.max(y - dy, 0), innerHeight - BARRA - 29)}px`;
  };

  const soltar = () => { activo = false; document.body.classList.remove('arrastrando'); };

  tirador.addEventListener('mousedown', e => { e.preventDefault(); empezar(e.clientX, e.clientY); });
  window.addEventListener('mousemove', e => mover(e.clientX, e.clientY));
  window.addEventListener('mouseup', soltar);

  tirador.addEventListener('touchstart', e => empezar(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
  window.addEventListener('touchmove', e => {
    if (activo) { e.preventDefault(); mover(e.touches[0].clientX, e.touches[0].clientY); }
  }, { passive: false });
  window.addEventListener('touchend', soltar);
}

function redimensionable(nodo, agarre) {
  let x0 = 0, y0 = 0, w0 = 0, h0 = 0, activo = false;

  agarre.addEventListener('mousedown', e => {
    e.preventDefault();
    e.stopPropagation();
    activo = true;
    x0 = e.clientX; y0 = e.clientY;
    w0 = nodo.offsetWidth; h0 = nodo.offsetHeight;
    document.body.classList.add('redimensionando', 'arrastrando');
  });

  window.addEventListener('mousemove', e => {
    if (!activo) return;
    nodo.style.width = `${Math.max(240, w0 + e.clientX - x0)}px`;
    nodo.style.height = `${Math.max(140, h0 + e.clientY - y0)}px`;
  });

  window.addEventListener('mouseup', () => {
    activo = false;
    document.body.classList.remove('redimensionando', 'arrastrando');
  });
}
