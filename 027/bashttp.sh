#!/bin/bash


_DEBUG=0
OPTION_PREFIX="option_"

CRLF=$'\r'$'\n'


function _set_option() {
    # declare -g ${OPTION_PREFIX}$1 $2
    # Use let for backward compatibility
    let "${OPTION_PREFIX}$1=$2"
}

function _get_option() {
    local option_name="${OPTION_PREFIX}$1"
    echo "${!option_name}"
}

function _err() {
    >&2 echo "$@"
}

function _dbg() {
    if [[ -z "$_DEBUG" ]] || (( ! $_DEBUG )); then
        return
    fi
    _err "$@"
}

function _usage() {
    _err "usage: $0 [OPTIONS] <URL>"
}

function _get_ip_by_domain() {
    dig "$1" +short | tail -n1
}

function _send_tcp() {
    local domain="$1"
    local port="$2"
    local payload="$3"

    local dev="/dev/tcp/$(_get_ip_by_domain "$domain")/$port"
    _dbg "dev: $dev"

    exec 4<>$dev

    # Send
    printf -- '%s' "$payload" >&4
    # Response
    cat <&4
}

function _send_http() {
    local url="$1"
    if [[ -n $2 ]]; then
        local method="$(echo "$2" | tr '[[:lower:]]' '[[:upper:]]')"
    else
        local method="GET"
    fi
    if [[ -n $3 ]]; then
        local body="$3"
    else
        local body=""
    fi
    if [[ "$url" != 'http://'* ]]; then
        _err "wrong http url '$url'"
        exit 1
    fi

    : "${url:7}"
    local host="${_%%/*}"
    local hostname="${host%:*}"
    : "${host##*:}"
    local port="${_:-80}"

    _dbg "host: $host"
    _dbg "hostname: $hostname"
    _dbg "port: $port"

    local header=''
    header+="$method / HTTP/1.0${CRLF}"
    header+="Host: ${hostname}${CRLF}"
    header+="Connection: close${CRLF}"
    header+=$CRLF

    # _dbg "header: $header"

    # Request
    _send_tcp "$hostname" "$port" "$header"
}

function _main() {
    local args=$(getopt hI: $*)
    if (( $? != 0 )); then
        _usage
        exit 1
    fi
    set -- $args
    for i; do  # ``If `in WORDS ...;' is not present, then `in "$@"' is assumed.''
        case "$i" in
            -h)
                _usage
                exit
                break
                ;;
            -I)
                _set_option headers_only 1
                shift
                break
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
    local res="$(_send_http "$url")"
    if [[ -z "$(_get_option headers_only)" ]]; then
        echo "${res#*$'\r\n\r\n'}"
    else
        echo "${res%%$'\r\n\r\n'*}"
    fi
}
_main $@


