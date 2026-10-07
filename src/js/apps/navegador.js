/**
 * La ventana del navegador — el único Internet Explorer que no te va a dar
 * problemas.
 *
 * ⚠️ **No lleva un iframe del portafolio, y no por pereza.** La versión de 2024
 * metía `https://luisaldrichguz.com` en un `<iframe>`; ese dominio ya no existe,
 * y el que lo sustituye (`luisaldrichguz.net`) manda
 * `X-Frame-Options: SAMEORIGIN` y `frame-ancestors 'self'`, así que se niega a
 * cargar dentro de otro subdominio. Aflojar esa cabecera sería cambiar
 * seguridad real por un adorno. Lo que hace esta ventana es lo que hacía el IE:
 * tiene una barra de direcciones y te lleva al sitio, en una pestaña nueva.
 */

const FAVORITOS = [
  ['https://luisaldrichguz.net', 'Mi portafolio', 'La página de inicio es un juego 3D jugable.'],
  ['https://arena.luisaldrichguz.net', 'Three Arena', 'Un motor de arena shooter que lee los datos de Quake 3.'],
  ['https://threecraft.luisaldrichguz.net', 'ThreeCraft.js', 'Minecraft desde cero en Three.js, sin motor.'],
  ['https://github.com/LuisAldrichGuz', 'GitHub', 'El código que está público.'],
];

export function crearNavegador() {
  const raiz = document.createElement('div');
  raiz.className = 'ie';

  const barra = document.createElement('form');
  barra.className = 'ie-barra';
  const campo = document.createElement('input');
  campo.type = 'url';
  campo.value = 'https://luisaldrichguz.net';
  campo.setAttribute('aria-label', 'Dirección');
  const ir = document.createElement('button');
  ir.type = 'submit';
  ir.textContent = 'Ir';
  barra.append(campo, ir);

  const pagina = document.createElement('div');
  pagina.className = 'ie-pagina';

  const titulo = document.createElement('h3');
  titulo.textContent = 'Favoritos';
  pagina.append(titulo);

  const lista = document.createElement('ul');
  for (const [url, nombre, que] of FAVORITOS) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = nombre;
    const p = document.createElement('p');
    p.textContent = que;
    li.append(a, p);
    lista.append(li);
  }
  pagina.append(lista);

  const nota = document.createElement('p');
  nota.className = 'ie-nota';
  nota.textContent =
    'Los sitios se abren en una pestaña nueva: el portafolio se niega a cargar dentro de un marco ajeno, y hace bien.';
  pagina.append(nota);

  barra.addEventListener('submit', e => {
    e.preventDefault();
    let destino = campo.value.trim();
    if (!destino) return;
    // ⚠️ Sólo http(s). Sin esto, escribir `javascript:` en la barra y pulsar Ir
    // ejecutaría eso al abrir la pestaña.
    if (!/^https?:\/\//i.test(destino)) destino = `https://${destino}`;
    try {
      const u = new URL(destino);
      if (u.protocol !== 'http:' && u.protocol !== 'https:') return;
      window.open(u.href, '_blank', 'noopener');
    } catch { /* dirección sin sentido: no se hace nada */ }
  });

  raiz.append(barra, pagina);
  return raiz;
}
