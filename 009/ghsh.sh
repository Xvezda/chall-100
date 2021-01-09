#!/usr/bin/env bash



if ! type curl >/dev/null 2>&1; then
    echo "$0: error: cannot find curl!"
    exit 1
fi

function _help() {
    cat <<-EOF
    commands:
        cd
        exit
EOF
}

function _is_contains() {
    if [ -z "$1" -o -z "$2" ]; then
        return 1
    fi
    [ "${1#*$2*}" != "$1" ]
    return $?
}

PROG_="ghsh"
CWD_='/'

API_BASE_="https://api.github.com"
API_RAW_BASE_="https://raw.githubusercontent.com"
CURL_ARGS="-s -H 'Accept: application/vnd.github.v3+json'"

function _readline() {
    printf '%s %s> ' "$PROG_" "$CWD_"
    read -r line
}

function _main() {
    while _readline; do
        local args
        args=($line)

        local -a files
        local res
        case "${args[0]}" in
            cd)
                local repo="${args[1]}"
                if ! _is_contains "$repo" '/'; then
                    >&2 echo "$0: error: repository name must contains slash"
                    continue
                fi
                DEF_BRANCH_="$(curl -f $CURL_ARGS "$API_BASE_/repos/$repo" | grep '"default_branch"' | cut -d'"' -f4)"
                if [ $? -eq 0 ]; then
                    CWD_=$repo
                fi
                ;;
            ls)
                if [ "$CWD_" == "/" ]; then
                    >&2 echo "$0: error: cannot read root path"
                    continue
                fi
                res="$(curl $CURL_ARGS "$API_BASE_/repos/$CWD_/contents")"
                if [ -z "${args[2]}"]; then  # no option args
                    files=($(echo "$res" | grep '"name"' | cut -d'"' -f4))

                    # filter hidden files
                    # https://stackoverflow.com/a/15692004
                    local -a visible_files=($(printf '%s\n' "${files[@]}" | grep '^[^.]'))
                    echo "${visible_files[*]}"
                fi
                ;;
            cat)
                curl $CURL_ARGS "$API_RAW_BASE_/$CWD_/$DEF_BRANCH_/${args[1]}"
                ;;
            help)
                _help
                ;;
            q|exit)
                exit
                ;;
            *)
                >&2 echo "$0: error: command '$1' not exists!"
                ;;
        esac
    done
}
_main $@

