/**
 * El CV. Dos idiomas, y el que se abre primero depende del navegador de quien
 * entra: un reclutador que tiene el equipo en inglés no debería tener que
 * buscar el botón.
 *
 * ⚠️ **El PDF va en un `<iframe>` y no en un `<embed>`.** `embed` lo gobierna
 * `object-src` en la CSP, que está en 'self' y bastaría — pero en iOS no pinta
 * nada y deja un hueco blanco sin decir por qué. El iframe cae al visor del
 * navegador en todos.
 */

const IDIOMAS = {
  es: { archivo: './documents/LuisAldrichGuz-ESP.pdf', etiqueta: 'Español' },
  en: { archivo: './documents/LuisAldrichGuz-ENG.pdf', etiqueta: 'English' },
};

export function crearVisorCv() {
  const raiz = document.createElement('div');
  raiz.className = 'cv';

  const barra = document.createElement('div');
  barra.className = 'cv-barra';

  const marco = document.createElement('iframe');
  marco.className = 'cv-marco';
  marco.title = 'Currículum de Luis Aldrich Guzmán';

  const inicial = navigator.language?.toLowerCase().startsWith('en') ? 'en' : 'es';

  const botones = {};
  for (const [codigo, { archivo, etiqueta }] of Object.entries(IDIOMAS)) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = etiqueta;
    b.onclick = () => elegir(codigo);
    botones[codigo] = b;
    barra.append(b);
  }

  const bajar = document.createElement('a');
  bajar.className = 'cv-bajar';
  bajar.download = '';
  bajar.textContent = 'Descargar';
  barra.append(bajar);

  function elegir(codigo) {
    marco.src = IDIOMAS[codigo].archivo;
    bajar.href = IDIOMAS[codigo].archivo;
    for (const [c, b] of Object.entries(botones)) b.classList.toggle('activo', c === codigo);
  }

  elegir(inicial);
  raiz.append(barra, marco);
  return raiz;
}
