#!/usr/bin/env bash

GIT_CONF_PATH="$(git rev-parse --show-toplevel)/.git/config"


function _to_valid_alias_name() {
    local ALIAS_NAME="$1"
    ALIAS_NAME="${ALIAS_NAME//[^[:alpha:]]/}"
    echo "$ALIAS_NAME"
}

function _escape_shell_script() {
    sed -e '/^#.*/d' -e '/^$/d' \
        -e 's/\([^;]\)\([[:space:]]\)*$/\1;\2/' \
        -e 's/\([^\\]\)"/\1\\"/g' \
        -e 's/$/ \\/' $1
}

function _alias_template() {
    local ALIAS_NAME="$1" ALIAS_BODY="$2"
    cat <<EOF
$ALIAS_NAME = "!f() { \\
$ALIAS_BODY
}; f"
EOF
}

function _main() {
    if [ -z "$1" ]; then
        >&2 echo "usage: $0 <shell-script> [alias-name] [out-file]"
        return 1
    fi
    local SHELL_SCRIPT="$1"
          ALIAS_NAME="$(_to_valid_alias_name ${2:-${1%%.*}})" \
          OUT_FILE="$3"

    OUTPUT="$(_alias_template "$ALIAS_NAME" "$(_escape_shell_script "$1")")"
    if ! grep '^\[alias\]' $GIT_CONF_PATH; then
        echo "[alias]"
    fi
    echo "${OUTPUT//$'\n'/$'\n\t'}"
}

# Append
_main $@  # >> $GIT_CONF_PATH

