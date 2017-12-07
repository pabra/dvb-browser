#!/bin/bash

DIR="$(cd "$(dirname "$0")" && pwd -P)"
DIST_DIR=${DIR}/dist

GZIP=$(which pigz 2>/dev/null)
[ ! -x "$GZIP" ] && GZIP=$(which gzip 2>/dev/null)
[ ! -x "$GZIP" ] && echo 'no `pigz`/`gzip` found' && exit 1
TOUCH=$(which touch 2>/dev/null)
[ ! -x "$TOUCH" ] && echo 'no `touch` found' && exit 1

find $DIST_DIR -type f -print0 | while IFS= read -r -d $'\0' file; do
    ext="${file##*.}"
    case $ext in
        html|js|css|map|svg|ttf|eot)
            $GZIP -9 -c $file > ${file}.gz
            $TOUCH -r $file ${file}.gz
            ;;
    esac
done