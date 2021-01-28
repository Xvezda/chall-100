#!/bin/bash


OPTION_PREFIX="option_"

CR=$'\r'
LF=$'\n'
CRLF="${CR}${LF}"
EOH="${CRLF}${CRLF}"


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
    if [[ -z "$DEBUG" ]] || (( ! $DEBUG )); then
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
        local body_len="${#body}"
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

    local request=''
    request+="$method / HTTP/1.0${CRLF}"
    request+="Host: ${hostname}${CRLF}"
    [[ -n "$body_len" ]] && request+="Content-Length: ${body_len}${CRLF}"
    # request+="Connection: close${CRLF}"
    request+=$CRLF

    if [[ -n "$body" ]]; then
        request+="$body"
    fi

    # Request
    _send_tcp "$hostname" "$port" "$request"
}

function _main() {
    local args=$(getopt hId: $*)
    if (( $? != 0 )); then
        _usage
        exit 1
    fi
    set -- $args
    _dbg "\$@: $@"
    for i; do  # ``If `in WORDS ...;' is not present, then `in "$@"' is assumed.''
        case "$i" in
            -h)
                shift
                _usage
                exit
                break
                ;;
            -I)
                _set_option headers_only 1
                shift
                ;;
            -d)
                local method="POST"
                local post_body="$2"
                shift
                shift
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
    local res="$(_send_http "$url" "$method" "$post_body")"
    if [[ -z "$(_get_option headers_only)" ]]; then
        echo "${res#*$EOH}"
    else
        echo "${res%%$EOH*}"
    fi
}
_main $@


