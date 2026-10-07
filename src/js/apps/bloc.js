/**
 * El bloc de notas, con el texto que explica qué es esto. Es el «léeme» del
 * escritorio: quien llegue sin contexto abre esto y lo entiende.
 */

const TEXTO = `== LuisAldrichGuz — Escritorio ==================================

Esto es un escritorio de Windows XP que corre entero en el navegador.
Lo escribí en 2021 como portafolio, cuando ya me gustaba más hacer
juguetes que páginas. El de hoy vive en luisaldrichguz.net y es un
juego 3D, así que al menos soy coherente.

-- Lo que puedes hacer -------------------------------------------

  * Arrastrar las ventanas por su barra de título.
  * Redimensionarlas por la esquina de abajo a la derecha.
  * Minimizar, maximizar (o doble clic en la barra) y cerrar.
  * Cambiar de ventana desde la barra de tareas.
  * Jugar al buscaminas. Clic derecho para poner bandera, y clic en
    un número que ya tiene sus banderas para destapar el resto.
  * Usar la calculadora con el teclado.
  * Leer mi CV, en español o en inglés.

-- Cómo está hecho -----------------------------------------------

  HTML, CSS y JavaScript a pelo. Sin React, sin Vue, sin jQuery,
  sin paso de compilación y SIN UNA SOLA DEPENDENCIA EXTERNA: ni un
  CDN, ni una fuente de Google, ni una imagen enlazada de otro sitio.
  El fondo es un SVG dibujado a mano aquí dentro.

  La versión de 2021 sí tenía cuatro: los iconos venían de Font
  Awesome, el fondo del blog de un tercero, la banderita del botón
  de inicio de Wikipedia y el avatar de Steam. Dos de las cuatro se
  habían caído para 2026, y el botón de inicio llevaba meses
  enseñando un icono roto. Por eso ya no hay ninguna.

-- El fondo --------------------------------------------------------

  La foto es «Oberon (AU), Hills -- 2019 -- 1851» de Dietmar Rabich,
  de Wikimedia Commons, bajo CC BY-SA 4.0. La recorté, la espejé y le
  subí el verde, así que esta versión va con la misma licencia.

  No es la foto de Windows XP: esa tiene copyright de Microsoft y la
  anterior estaba enlazada desde el blog de un tercero.

-- Dónde está el código ------------------------------------------

  github.com/LuisAldrichGuz/Onboarding

                                        Luis Aldrich Guzmán
                                        luisaldrichguz.net
`;

export function crearBloc() {
  const area = document.createElement('textarea');
  area.className = 'bloc';
  area.value = TEXTO;
  area.spellcheck = false;
  area.setAttribute('aria-label', 'Léeme');
  return area;
}
