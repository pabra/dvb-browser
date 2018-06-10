#!/bin/bash

DIR="$(cd "$(dirname "$0")" && pwd -P)"
DIST_DIR=${DIR}/dist

GZIP=$(command -v pigz)
[ ! -x "$GZIP" ] && GZIP=$(command -v gzip)
[ ! -x "$GZIP" ] && echo "no 'pigz'/'gzip' found" && exit 1
TOUCH=$(command -v touch)
[ ! -x "$TOUCH" ] && echo "no 'touch' found" && exit 1
WC=$(command -v wc)
[ ! -x "$WC" ] && echo "no 'wc' found" && exit 1

find "$DIST_DIR" -type f -print0 | while IFS= read -r -d $'\0' file; do
    ext="${file##*.}"
    case $ext in
        html|js|css|map|svg|ttf|eot|json|ico|webapp)
            if [ "$($WC -c < "$file")" -gt 512 ]; then
                $GZIP -9 -c "$file" > "${file}.gz"
                $TOUCH -r "$file" "${file}.gz"
            fi
            ;;
    esac
done
