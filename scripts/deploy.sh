#!/usr/bin/env bash
#
# Despliega el escritorio (src/ tal cual) a xp.luisaldrichguz.net.
#
# NO compila nada: esto es HTML, CSS y JavaScript sin build. Lo que hay en
# src/ es lo que se sirve, y por eso el script comprueba que src/index.html
# exista antes de tocar el servidor — un rsync --delete con el origen vacío
# borraría el sitio entero.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HOST="${VPS_HOST:-vps}"
SITIO="xp.luisaldrichguz.net"
ORIGEN="$ROOT/src"
BLOQUE="$ROOT/infra/$SITIO.caddy"

ssh -o BatchMode=yes -o ConnectTimeout=5 "$HOST" true 2>/dev/null || {
  echo "No se pudo conectar a '$HOST'. Revisa el bloque Host en ~/.ssh/config." >&2
  exit 1
}

for archivo in "$ORIGEN/index.html" "$BLOQUE"; do
  [ -f "$archivo" ] || { echo "Falta $archivo." >&2; exit 1; }
done

if [ -n "$(git -C "$ROOT" status --porcelain)" ]; then
  echo "⚠ Hay cambios sin commitear: se despliega el ÁRBOL, no el último commit." >&2
fi

# /srv es de root: la carpeta se crea con sudo una vez y se le pasa al usuario
# para que el rsync entre sin sudo. Correrlo dos veces no cambia nada.
echo "==> Subiendo src/ a $HOST:/srv/$SITIO"
ssh "$HOST" "sudo mkdir -p /srv/$SITIO && sudo chown \$(whoami) /srv/$SITIO"
rsync -az --delete "$ORIGEN/" "$HOST:/srv/$SITIO/"

# ⚠️ El Caddyfile se valida ENTERO, así que un bloque mal escrito aquí no tira
# sólo este sitio: tira el portafolio, arena, whools y threecraft con él. Por eso
# el validate va ANTES del reload y con marcha atrás — se guarda el bloque que
# hubiera y se repone si protesta.
echo "==> Instalando el bloque de Caddy y validando antes de recargar"
rsync -az "$BLOQUE" "$HOST:/tmp/xp.caddy.nuevo"
ssh "$HOST" bash -s <<'REMOTO'
set -euo pipefail
DESTINO=/etc/caddy/sites.d/xp.luisaldrichguz.net.caddy
sudo mkdir -p /etc/caddy/sites.d
if [ -f "$DESTINO" ]; then sudo cp "$DESTINO" /tmp/xp.caddy.previo; else rm -f /tmp/xp.caddy.previo; fi
sudo install -m 644 -o root -g root /tmp/xp.caddy.nuevo "$DESTINO"
rm -f /tmp/xp.caddy.nuevo
if ! salida=$(sudo caddy validate --config /etc/caddy/Caddyfile 2>&1); then
  echo "$salida" >&2
  if [ -f /tmp/xp.caddy.previo ]; then
    sudo install -m 644 -o root -g root /tmp/xp.caddy.previo "$DESTINO"
    echo "   Bloque anterior repuesto. Caddy NO se recargó." >&2
  else
    sudo rm -f "$DESTINO"
    echo "   Bloque retirado. Caddy NO se recargó." >&2
  fi
  exit 1
fi
sudo systemctl reload caddy
REMOTO

echo "==> Comprobando que responda por HTTPS"
# ⚠️ Hasta que el registro A de `xp` propague, Caddy no puede sacar el
# certificado y esto falla. No es un fallo del despliegue: los archivos ya
# están arriba y el sitio arranca solo en cuanto el DNS resuelva.
codigo=$(curl -s -o /dev/null -w '%{http_code}' --max-time 25 "https://$SITIO/" || echo 000)
if [ "$codigo" = "200" ]; then
  echo "==> Listo · https://$SITIO/"
else
  echo "==> Archivos subidos y Caddy recargado, pero https://$SITIO/ devuelve $codigo."
  echo "    Si el registro A de 'xp' es reciente, espera a que propague y vuelve a probar."
fi
