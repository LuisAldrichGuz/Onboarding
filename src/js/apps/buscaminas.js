/**
 * Buscaminas, con las tres reglas que lo hacen el de Windows y no una rejilla
 * con bombas:
 *
 * 1. **La primera casilla nunca es mina.** Las minas se reparten DESPUÉS del
 *    primer clic, evitando esa casilla y sus ocho vecinas. Perder en el primer
 *    clic no es dificultad, es una moneda al aire.
 * 2. **Los ceros se abren en cadena.** Destapar una casilla sin minas alrededor
 *    destapa a sus vecinas, y así hasta topar con números.
 * 3. **La bandera bloquea.** Una casilla marcada no se destapa por accidente.
 *
 * Y el acorde de siempre: clic en un número que ya tiene sus banderas puestas
 * destapa el resto de sus vecinas de golpe.
 */

const NIVELES = {
  principiante: { ancho: 9, alto: 9, minas: 10 },
  intermedio: { ancho: 16, alto: 16, minas: 40 },
  experto: { ancho: 30, alto: 16, minas: 99 },
};

/** Los colores de los números son los de Windows, y no es nostalgia: el 1 y el
 *  2 se distinguen por color antes que por forma cuando vas rápido. */
const COLORES = ['', '#0000ff', '#008000', '#ff0000', '#000080', '#800000', '#008080', '#000000', '#808080'];

export function crearBuscaminas() {
  const raiz = document.createElement('div');
  raiz.className = 'mina-app';
  raiz.innerHTML = `
    <div class="mina-barra">
      <select class="mina-nivel" aria-label="Dificultad">
        <option value="principiante">Principiante · 9×9 · 10 minas</option>
        <option value="intermedio">Intermedio · 16×16 · 40 minas</option>
        <option value="experto">Experto · 30×16 · 99 minas</option>
      </select>
    </div>
    <div class="mina-marcador">
      <output class="mina-cuenta" aria-label="Minas restantes">010</output>
      <button class="mina-cara" type="button" aria-label="Partida nueva">🙂</button>
      <output class="mina-tiempo" aria-label="Tiempo">000</output>
    </div>
    <div class="mina-rejilla" role="grid"></div>`;

  const selNivel = raiz.querySelector('.mina-nivel');
  const elCuenta = raiz.querySelector('.mina-cuenta');
  const elTiempo = raiz.querySelector('.mina-tiempo');
  const elCara = raiz.querySelector('.mina-cara');
  const rejilla = raiz.querySelector('.mina-rejilla');

  let cfg, celdas, sembrado, terminado, banderas, destapadas, segundos, cronometro;

  const tresCifras = n => String(Math.max(0, Math.min(999, n))).padStart(3, '0');

  function nueva() {
    cfg = NIVELES[selNivel.value];
    sembrado = false;
    terminado = false;
    banderas = 0;
    destapadas = 0;
    segundos = 0;
    clearInterval(cronometro);
    elTiempo.textContent = '000';
    elCuenta.textContent = tresCifras(cfg.minas);
    elCara.textContent = '🙂';

    celdas = Array.from({ length: cfg.ancho * cfg.alto }, () => ({
      mina: false, abierta: false, bandera: false, vecinas: 0,
    }));

    rejilla.style.setProperty('--cols', cfg.ancho);
    rejilla.replaceChildren();
    celdas.forEach((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'mina-celda';
      b.dataset.i = String(i);
      rejilla.append(b);
    });
  }

  /** Reparte las minas evitando la casilla pulsada y su vecindario. */
  function sembrar(seguro) {
    const prohibidas = new Set([seguro, ...vecinas(seguro)]);
    let puestas = 0;
    while (puestas < cfg.minas) {
      const i = Math.floor(Math.random() * celdas.length);
      if (celdas[i].mina || prohibidas.has(i)) continue;
      celdas[i].mina = true;
      puestas++;
    }
    celdas.forEach((c, i) => { c.vecinas = vecinas(i).filter(j => celdas[j].mina).length; });
    sembrado = true;
    cronometro = setInterval(() => {
      segundos++;
      elTiempo.textContent = tresCifras(segundos);
    }, 1000);
  }

  function vecinas(i) {
    const x = i % cfg.ancho, y = Math.floor(i / cfg.ancho);
    const fuera = [];
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= cfg.ancho || ny >= cfg.alto) continue;
        fuera.push(ny * cfg.ancho + nx);
      }
    }
    return fuera;
  }

  /**
   * Destapar. La cadena de ceros va con una pila propia y no por recursión:
   * en experto, un cero grande encadena cientos de casillas y la recursión se
   * come la pila de llamadas.
   */
  function destapar(inicio) {
    const pila = [inicio];
    while (pila.length) {
      const i = pila.pop();
      const c = celdas[i];
      if (c.abierta || c.bandera) continue;
      c.abierta = true;
      destapadas++;
      if (c.vecinas === 0 && !c.mina) pila.push(...vecinas(i));
    }
  }

  function acorde(i) {
    const c = celdas[i];
    if (!c.abierta || c.vecinas === 0) return;
    const alrededor = vecinas(i);
    if (alrededor.filter(j => celdas[j].bandera).length !== c.vecinas) return;
    for (const j of alrededor) {
      if (celdas[j].bandera || celdas[j].abierta) continue;
      if (celdas[j].mina) return perder(j);
      destapar(j);
    }
    pintar();
    comprobarVictoria();
  }

  function perder(culpable) {
    terminado = true;
    clearInterval(cronometro);
    elCara.textContent = '😵';
    celdas.forEach(c => { if (c.mina) c.abierta = true; });
    celdas[culpable].culpable = true;
    pintar();
  }

  function comprobarVictoria() {
    if (terminado || destapadas !== celdas.length - cfg.minas) return;
    terminado = true;
    clearInterval(cronometro);
    elCara.textContent = '😎';
    celdas.forEach(c => { if (c.mina && !c.bandera) { c.bandera = true; banderas++; } });
    elCuenta.textContent = tresCifras(cfg.minas - banderas);
    pintar();
  }

  function pintar() {
    celdas.forEach((c, i) => {
      const b = rejilla.children[i];
      b.className = 'mina-celda';
      b.textContent = '';
      b.style.color = '';
      if (c.bandera && !c.abierta) { b.textContent = '🚩'; b.classList.add('marcada'); return; }
      if (!c.abierta) return;
      b.classList.add('abierta');
      if (c.mina) {
        b.textContent = '💣';
        if (c.culpable) b.classList.add('boom');
      } else if (c.vecinas > 0) {
        b.textContent = String(c.vecinas);
        b.style.color = COLORES[c.vecinas];
      }
    });
  }

  rejilla.addEventListener('click', e => {
    const b = e.target.closest('.mina-celda');
    if (!b || terminado) return;
    const i = Number(b.dataset.i);
    if (celdas[i].abierta) return acorde(i);
    if (celdas[i].bandera) return;
    if (!sembrado) sembrar(i);
    if (celdas[i].mina) return perder(i);
    destapar(i);
    pintar();
    comprobarVictoria();
  });

  // ⚠️ El menú del navegador se cancela SIEMPRE dentro de la rejilla, no sólo
  // cuando el clic cae en una casilla: si no, el hueco entre casillas abre el
  // menú contextual a media partida.
  rejilla.addEventListener('contextmenu', e => {
    e.preventDefault();
    const b = e.target.closest('.mina-celda');
    if (!b || terminado) return;
    const c = celdas[Number(b.dataset.i)];
    if (c.abierta) return;
    c.bandera = !c.bandera;
    banderas += c.bandera ? 1 : -1;
    elCuenta.textContent = tresCifras(cfg.minas - banderas);
    pintar();
  });

  elCara.onclick = nueva;
  selNivel.onchange = nueva;
  nueva();
  return raiz;
}
