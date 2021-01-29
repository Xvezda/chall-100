#!/bin/bash


CR=$'\r'
LF=$'\n'
CRLF="${CR}${LF}"
EOH="${CRLF}${CRLF}"


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
    # _send_http(url, method='GET', post_body='', *headers)
    local url="$1"
    if [[ -n $2 ]]; then
        local method="$(echo "$2" | tr '[[:lower:]]' '[[:upper:]]')"
    else
        local method="GET"
    fi
    shift 2

    if [[ $method == "POST" ]]; then
        local body="$1"
        local body_len="${#body}"
    else
        local body=""
    fi
    shift

    local headers=()
    while [[ "$1" =~ [[:alnum:]-]*':'.*  ]]; do
        headers+=("$1")
        shift
    done

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
    _dbg "headers: ${headers[@]}"

    local request=''
    request+="$method / HTTP/1.0${CRLF}"
    request+="Host: ${hostname}${CRLF}"
    [[ -n "$body_len" ]] && request+="Content-Length: ${body_len}${CRLF}"

    for header in "${headers[@]}"; do
        request+="${header}${CRLF}"
    done
    # request+="Connection: close${CRLF}"
    request+=$CRLF

    if [[ -n "$body" ]]; then
        request+="$body"
    fi

    # Request
    _send_tcp "$hostname" "$port" "$request"
}


