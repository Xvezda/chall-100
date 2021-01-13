#!/bin/bash

DAY="$(git log --pretty='format:%s' --grep='^Add day' \
    | cut -d ' ' -f 3 \
    | xargs -I{} echo {}+1 \
    | bc | head -n 1)"
PAD_SIZE=3
PADDED="$(printf "%0${PAD_SIZE}d" $DAY)"

cd -- $(git rev-parse --show-toplevel)
if [[ ! -e "$PADDED" ]]; then
    >&2 echo "challenge for today not found"
    exit 1
fi

git add $PADDED
git commit -m "Add day $DAY"
