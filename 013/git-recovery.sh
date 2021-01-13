#!/bin/bash

select SEL in 'show recent commits (reflog)' 'integrity check'; do
    case "$REPLY" in
        1)
            git log -g --pretty=oneline
            ;;
        2)
            git fsck --full | grep '^dangling commit'
            ;;
    esac

    printf 'please type commit hash to recover: '
    read commit
    git cat-file -p "$commit" || exit 1

    printf 'enter branch name to use: '
    read branch

    git branch "$branch" "$commit"
    break
done
