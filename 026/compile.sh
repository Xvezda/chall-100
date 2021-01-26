#!/bin/bash


function _echoerr() {
    >&2 echo "$@"
}

function _usage() {
    _echoerr "usage: $0 <INC_MD_FILE> -o <OUTPUT>"
}

function _includes() {
    local basefile="$1"
    local dirname="$(dirname "$basefile")"
    local basename="$(basename "$basefile")"

    local match='<\!--\#include\s*"[^"]*"-->'
    local sedcmd="$(grep -n "$match" "$basefile" \
        | tr '"' ':' \
        | cut -d ':' -f 1,3 \
        | tr ':' "$IFS" \
        | while read n file; do
            printf '%s\n' "${n}r $dirname/$file"
            printf '%s\n' "${n}d"
        done)"
    sed "$sedcmd" "$basefile"
}

function _main() {
    if [[ -z "$1" ]]; then
        _usage
        exit 1
    fi
    local filename="$1"
    _includes "$filename"
}
_main $@
