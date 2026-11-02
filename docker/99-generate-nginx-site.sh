#!/bin/sh
set -eu

if [ -n "${API_GATEWAY_URL:-}" ]; then
  envsubst '${API_GATEWAY_URL}' \
    < /etc/nginx/site-templates/default.conf.template \
    > /etc/nginx/conf.d/default.conf
else
  cp /etc/nginx/site-templates/default.static.conf \
    /etc/nginx/conf.d/default.conf
fi
