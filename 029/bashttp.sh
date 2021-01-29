#!/bin/bash

source util.sh
source httplib.sh


OPTION_PREFIX="option_"


function _set_option() {
    # declare -g ${OPTION_PREFIX}$1 $2
    # Use let for backward compatibility
    let "${OPTION_PREFIX}$1=$2"
}

function _get_option() {
    local option_name="${OPTION_PREFIX}$1"
    echo "${!option_name}"
}

function _usage() {
    _err "usage: $0 [OPTIONS] <URL>"
}

function _main() {
    local args=$(getopt hH:Id: "$*")
    if (( $? != 0 )); then
        _usage
        exit 1
    fi
    set -- $args
    _dbg "\$@: $@"
    local headers=()
    for i; do  # ``If `in WORDS ...;' is not present, then `in "$@"' is assumed.''
        case "$i" in
            -h)
                shift
                _usage
                exit
                break
                ;;
            -H)
                headers+=("$2")
                shift; shift
                ;;
            -I)
                _set_option headers_only 1
                shift
                ;;
            -d)
                local method="POST"
                local post_body="$2"
                shift; shift
                ;;
            --)
                shift
                break
                ;;
        esac
    done
    if [[ -z "$1" ]]; then
        _usage
        exit 1
    fi
    local url="$1"
    local res="$(_send_http "$url" "$method" "${headers[@]}" "$post_body")"
    if [[ -z "$(_get_option headers_only)" ]]; then
        echo "${res#*$EOH}"
    else
        echo "${res%%$EOH*}"
    fi
}
_main "$@"


