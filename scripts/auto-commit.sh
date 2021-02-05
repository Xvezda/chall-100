#!/bin/bash

DAY="$(git log --pretty='format:%s' --grep='^Add day' \
    | cut -d ' ' -f 3 \
    | xargs -I{} echo {}+1 \
    | bc | head -n 1)"
PADSIZ=3
PADDED="$(printf "%0${PADSIZ}d" $DAY)"

cd -- $(git rev-parse --show-toplevel)
if [[ ! -e "$PADDED" ]]; then
    >&2 echo "challenge for today not found"
    exit 1
elif [[ ! -e "$PADDED/README.md" ]]; then
    >&2 echo "you have to write README.md for challenge"
    exit 1
fi

git diff --staged --exit-code --quiet
STAGED=$?

if (( ! $STAGED )); then
    git add $PADDED
fi
git commit -m "Add day $DAY"

