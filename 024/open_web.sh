#!/bin/bash


function _remote_to_http() {
    local sedcmd='s'
    sedcmd+='|^git@\([[:alnum:]-]\{3,\}\.[[:alpha:]]\{2,\}\):\(.*\)$'
    sedcmd+='|http://\1/\2|'
    git remote get-url $1 | sed "$sedcmd"
}


function _open_web() {
    python -m webbrowser "$1"
}


function _install_script() {
    local alias_name="$1"
    local script_path="$2"
    git config alias.$1 "!f() { chmod +x $2; $2; }; f"
    echo "script $2 installed at git alias.$1"
}


function _echoerr() {
	>&2 echo "$@"
}


function _usage() {
    _echoerr "usage: $0 [command]"
	_echoerr "  commands:"
	_echoerr "    help"
	_echoerr "    install"
}


function _main() {
    case "$1" in
        help)
            _usage
            exit 1
            ;;
        install)
            _install_script open-web "${BASH_SOURCE}"
            ;;
        *)
            _open_web "$(_remote_to_http origin)"
            ;;
    esac
}
_main $@

