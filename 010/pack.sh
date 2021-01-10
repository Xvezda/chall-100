#!/bin/bash


function _err() {
    >&2 echo "$0: error: $@"
}

function _usage() {
    >&2 echo "usage: $0 <image> <file>... <output>"
}

function _is_image() {
    if [[ -e "$1" ]]; then
        ( file "$1" | grep '[[:<:]]image[[:space:]]data[[:>:]]' )>/dev/null
        return ${PIPESTATUS[0]}
    fi
    return 1
}

function _main() {
    if [[ -z "$1" ]]; then
        _usage
        exit 1
    fi
    if (( $# < 3 )); then
        _err "at least 3 arguments required"
        _usage
        exit 1
    fi
    if ! _is_image "$1"; then
        _err "first argument must be an image file"
        _usage
        exit 1
    fi

    local output="${@: $#}"
    if [[ -e "$output" ]]; then
        err "output file '$output' already exists"
        exit 1
    fi
    local tmpfile=$(mktemp)

    # TODO: Why there is a difference between two zip files below?
    #       zip -r - ... > test.zip
    #       zip -r - ... >> test2.zip
    zip -q -r - ${@:2: $(( $#-2 ))} > $tmpfile
    cat "$1" "$tmpfile" > "$output"

    rm "$tmpfile"
    echo "file '$output' has been created"
}
_main $@
