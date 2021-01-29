#!/bin/bash


function _err() {
    >&2 echo "$@"
}

function _dbg() {
    if [[ -z "$DEBUG" ]] || (( ! $DEBUG )); then
        return
    fi
    _err "$@"
}

function _hex() {
    xxd -p
}

function _unhex() {
    xxd -r -p
}
