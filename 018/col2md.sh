#!/bin/bash


function _col2md() {
    local awkprog="$(cat <<'EOF'
{ print $0 }
NR == 1 {
    printf "|";
    split($0, arr, /\|/);
    for (i = 2; i < length(arr); i++) {
        for (j = length(arr[i]); j; j--) {
            printf "-";
        }
        printf "|";
    }
    print "";
}
EOF
)"
    sed -e 's/[[:space:]][[:space:]]\([^[:space:]]\)/ \| \1/g' \
        -e 's/^/\| /' \
        -e 's/$/ \|/' \
        | awk "$awkprog"
}

function _main() {
    if [[ -n "$1" ]]; then
        cat "$1" | _col2md
        return
    fi
    cat | _col2md
}
_main $@
