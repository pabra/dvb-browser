#!/bin/bash

DIR="$(cd "$(dirname "$0")" && pwd -P)"
SYNC_SRC=${DIR}/dist/
SYNC_DST=/var/www/dvb/
SYNC_HOST=dvb.peppnet.de

rsync \
    -avP \
    --delete \
    --dry-run \
    "${SYNC_SRC}" \
    "${SYNC_HOST}:${SYNC_DST}"
