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
    local headers=()
    while getopts "hH:Id:" opt; do
        case "$opt" in
            h)
                _usage
                exit
                break
                ;;
            H)
                headers+=("$OPTARG")
                ;;
            I)
                _set_option headers_only 1
                ;;
            d)
                local method="POST"
                local post_body="$OPTARG"
                ;;
        esac
    done
    shift $(( OPTIND - 1 ))
    if [[ -z "$1" ]]; then
        _usage
        exit 1
    fi
    _dbg "headers: ${headers[@]}"
    local url="$1"
    local res="$(_send_http "$url" "$method" "$post_body" "${headers[@]}")"
    if [[ -z "$(_get_option headers_only)" ]]; then
        echo "${res#*$EOH}"
    else
        echo "${res%%$EOH*}"
    fi
}
_main "$@"


