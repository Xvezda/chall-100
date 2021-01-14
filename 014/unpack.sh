#!/bin/bash


ZIP_MAGIC='504b0304'
JPG_MAGIC='ffd8ff'
PNG_MAGIC='89504e470d0a1a0a'

function _usage() {
    >&2 echo "usage: $0 <file>"
}

function _get_ext() {
    if [[ $1 == $JPG_MAGIC* ]]; then
        echo "jpg"
    elif [[ $1 == $PNG_MAGIC* ]]; then
        echo "png"
    else  # I haven't seen using gif for this purpose
        # If unknown, just "bin"
        echo "bin"
    fi
}

function _hex() {
    xxd -p "$1" | tr -d '\n'
}

function _pick_img() {
    local filename="$1"

    local hex="$(_hex "$filename")"
    local ext="$(_get_ext "$hex")"

    echo "$hex" | sed -n "1,/${ZIP_MAGIC}/p" | xxd -p -r - "${filename}.${ext}"
}

function _pick_zip() {
    _hex "$1" | grep -o "${ZIP_MAGIC}.*" | xxd -p -r - "$1.zip"
}

function _main() {
    if [[ -z "$1" ]]; then
        _usage
        exit 1
    fi
    select _ in 'extract' 'split'; do
        case "$REPLY" in
            1)
                # Just unzip it
                unzip "$1"
                ;;
            2)
                # Get thumbnail
                _pick_img "$1"

                # Get hidden files
                _pick_zip "$1"
                ;;
        esac
        break
    done
}
_main $@
