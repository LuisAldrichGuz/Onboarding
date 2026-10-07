/**
 * La calculadora. Estaba en el menú de inicio desde 2024 y no existía: le
 * dabas clic y no pasaba nada.
 *
 * ⚠️ **Nada de `eval`.** La forma corta de escribir esto es juntar la cadena y
 * evaluarla, y es exactamente la que convierte un teclado en un intérprete de
 * JavaScript. Aquí se guardan dos números y una operación, como la de verdad.
 *
 * ⚠️ **Y funciona con el teclado**, porque nadie usa una calculadora a base de
 * clics. Las teclas sólo se escuchan cuando la ventana tiene el foco dentro.
 */

const TECLAS = [
  ['CE', 'C', '←', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '−'],
  ['1', '2', '3', '+'],
  ['±', '0', ',', '='],
];

const OPERACIONES = {
  '+': (a, b) => a + b,
  '−': (a, b) => a - b,
  '×': (a, b) => a * b,
  '÷': (a, b) => (b === 0 ? null : a / b),
};

export function crearCalculadora() {
  const raiz = document.createElement('div');
  raiz.className = 'calc';
  raiz.tabIndex = 0;

  const pantalla = document.createElement('output');
  pantalla.className = 'calc-pantalla';
  pantalla.textContent = '0';
  raiz.append(pantalla);

  const teclado = document.createElement('div');
  teclado.className = 'calc-teclado';
  for (const fila of TECLAS) {
    for (const t of fila) {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = t;
      b.dataset.tecla = t;
      if (OPERACIONES[t] || t === '=') b.classList.add('calc-op');
      if (t === 'C' || t === 'CE' || t === '←') b.classList.add('calc-borrar');
      teclado.append(b);
    }
  }
  raiz.append(teclado);

  // `entrada` es lo que se está tecleando; `acumulado` y `pendiente` son el
  // número y la operación que esperan al siguiente `=`.
  let entrada = '0';
  let acumulado = null;
  let pendiente = null;
  let reiniciar = false;   // el próximo dígito empieza un número nuevo

  const mostrar = () => { pantalla.textContent = entrada; };

  function digito(d) {
    if (reiniciar || entrada === '0') { entrada = d; reiniciar = false; }
    else if (entrada.replace(/[-,]/g, '').length < 15) entrada += d;
    mostrar();
  }

  function coma() {
    if (reiniciar) { entrada = '0'; reiniciar = false; }
    if (!entrada.includes(',')) entrada += ',';
    mostrar();
  }

  const aNumero = s => Number(s.replace(',', '.'));

  /** Quince cifras y fuera: más allá, los `double` ya se inventan decimales. */
  function aTexto(n) {
    if (n === null || !Number.isFinite(n)) return 'No se puede dividir entre cero';
    return String(Number(n.toPrecision(15))).replace('.', ',');
  }

  function operar(op) {
    const valor = aNumero(entrada);
    if (pendiente && !reiniciar) {
      const r = OPERACIONES[pendiente](acumulado, valor);
      entrada = aTexto(r);
      acumulado = r;
    } else {
      acumulado = valor;
    }
    pendiente = op;
    reiniciar = true;
    mostrar();
  }

  function igual() {
    if (!pendiente) return;
    const r = OPERACIONES[pendiente](acumulado, aNumero(entrada));
    entrada = aTexto(r);
    acumulado = r === null ? 0 : r;
    pendiente = null;
    reiniciar = true;
    mostrar();
  }

  function pulsar(t) {
    if (/^[0-9]$/.test(t)) return digito(t);
    if (t === ',') return coma();
    if (OPERACIONES[t]) return operar(t);
    if (t === '=') return igual();
    if (t === 'C') { entrada = '0'; acumulado = null; pendiente = null; reiniciar = false; return mostrar(); }
    if (t === 'CE') { entrada = '0'; return mostrar(); }
    if (t === '←') { entrada = entrada.length > 1 ? entrada.slice(0, -1) : '0'; return mostrar(); }
    if (t === '±') { entrada = entrada.startsWith('-') ? entrada.slice(1) : `-${entrada}`; return mostrar(); }
  }

  teclado.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (b) { pulsar(b.dataset.tecla); raiz.focus(); }
  });

  const DEL_TECLADO = {
    '/': '÷', '*': '×', '-': '−', '+': '+', '=': '=', 'Enter': '=',
    '.': ',', ',': ',', 'Backspace': '←', 'Escape': 'C', 'Delete': 'CE',
  };

  raiz.addEventListener('keydown', e => {
    const t = /^[0-9]$/.test(e.key) ? e.key : DEL_TECLADO[e.key];
    if (!t) return;
    e.preventDefault();
    pulsar(t);
    const b = teclado.querySelector(`[data-tecla="${CSS.escape(t)}"]`);
    if (b) { b.classList.add('pulsada'); setTimeout(() => b.classList.remove('pulsada'), 90); }
  });

  return raiz;
}
