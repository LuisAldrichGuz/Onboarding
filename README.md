# Escritorio XP — el portafolio de 2024

**Un escritorio de Windows XP que corre entero en el navegador.**
→ **[xp.luisaldrichguz.net](https://xp.luisaldrichguz.net)**

Lo escribí en 2024 como portafolio, siendo *Microsoft Learn Student Ambassador*,
cuando ya me gustaba más hacer juguetes que páginas. El de hoy
([luisaldrichguz.net](https://luisaldrichguz.net)) es un juego 3D, así que al
menos soy coherente.

## Qué hay dentro

Ventanas de verdad: se arrastran por la barra de título, se redimensionan por
la esquina, se minimizan, se maximizan (o doble clic en la barra) y se apilan
según a cuál le hiciste clic. La barra de tareas lleva una entrada por ventana
abierta y el reloj va en hora.

| Aplicación | Qué es |
|---|---|
| **Currículum** | Mi CV en PDF, en español y en inglés. Abre en el idioma del navegador. |
| **Buscaminas** | Completo: la primera casilla nunca es mina, los ceros se abren en cadena y el acorde de siempre — clic en un número que ya tiene sus banderas destapa el resto. Tres dificultades. |
| **Calculadora** | Con teclado. Sin `eval`: guarda dos números y una operación, como la de verdad. |
| **Internet Explorer** | Barra de direcciones y favoritos. Abre en pestaña nueva, no en un marco: mi portafolio manda `frame-ancestors 'self'` y hace bien. |
| **Bloc de notas** | El léeme, dentro del propio escritorio. |

## Cómo está hecho

HTML, CSS y JavaScript a pelo. **Sin framework, sin paso de compilación y sin
una sola dependencia externa**: ni un CDN, ni una fuente de Google, ni una
imagen enlazada de otro sitio. Los iconos son SVG en línea y el fondo es una
foto de dominio compartido servida desde aquí (ver **Licencia**), no la de
Microsoft.

```
src/
  index.html        la estructura y el juego de iconos SVG
  css/
    escritorio.css  fondo, iconos, barra de tareas, menú de inicio
    ventanas.css    la carcasa de una ventana
    apps.css        lo de dentro de cada aplicación
  js/
    escritorio.js   el catálogo de apps y todo lo que lo rodea
    ventanas.js     el gestor de ventanas, y lo único que sabe de ventanas
    apps/           una por archivo
infra/              su bloque de Caddy
scripts/deploy.sh   subir src/ al servidor
```

Una aplicación nueva se da de alta en `APLICACIONES` (en `escritorio.js`) y
aparece sola en los tres sitios: icono, menú de inicio y barra de tareas.

## Qué se arregló en 2026

La versión de 2024 dependía de **cinco sitios ajenos** y dos ya se habían
caído. El botón de inicio llevaba meses enseñando un icono roto y nadie lo
sabía.

| Estaba | Está |
|---|---|
| Iconos desde el CDN de Font Awesome | SVG en línea |
| Fondo enlazado del blog de un tercero (foto con copyright de Microsoft) | Una foto libre, servida desde aquí |
| Banderita del botón de inicio desde Wikipedia — **devolvía 400** | SVG, 700 bytes |
| Avatar desde el CDN de Steam | Una imagen de este repositorio |
| Paint dentro de un iframe a `jspaint.app` | Fuera: era de otro, no mío |
| Ventana con un iframe a `luisaldrichguz.com` — **dominio muerto** | Un IE con barra de direcciones que abre en pestaña nueva |
| «Calculadora» en el menú **sin ventana detrás** | La calculadora, escrita |
| Todo medido en `vw`: barra de 64 px en un monitor grande, reloj de 11 px en un portátil | `px` y `rem`, y una barra que mide lo que mide |
| Sin `Content-Security-Policy` | Todo en `'self'`, sin una sola excepción |

## Correrlo

No hace falta nada: es estático.

```sh
python3 -m http.server --directory src 8080
```

⚠️ Con `file://` no arranca: `js/escritorio.js` es un módulo ES y el navegador
los bloquea fuera de `http(s)`.

## Desplegar

```sh
./scripts/deploy.sh
```

Sube `src/` a `/srv/xp.luisaldrichguz.net` e instala su bloque de Caddy. Valida
el Caddyfile **entero** antes de recargar y repone el bloque anterior si
protesta: un bloque mal escrito no tira sólo este sitio, tira los otros cuatro
de la VPS con él.

## Licencia

**El fondo** es [«Oberon (AU), Hills — 2019 — 1851»](https://commons.wikimedia.org/wiki/File:Oberon_(AU),_Hills_--_2019_--_1851.jpg)
de Dietmar Rabich (Wikimedia Commons), **CC BY-SA 4.0**. Está recortado,
espejado y con el verde subido, así que `src/img/fondo.webp` va bajo esa misma
licencia. **No** es la foto «Bliss» de Windows XP, que tiene copyright de
Microsoft — la versión de 2024 la traía enlazada del blog de un tercero.

El resto del código es mío y se puede usar. Windows, Windows XP y el nombre Microsoft son
marcas de Microsoft Corporation: esto es un homenaje, no un producto suyo ni
está asociado con ellos.
