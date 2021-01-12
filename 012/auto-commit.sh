#!/bin/bash

git log --pretty='format:%s' --grep='^Add day' \
    | cut -d ' ' -f 3 \
    | xargs -I{} echo {}+1 \
    | bc | head -n 1 \
    | xargs -I{} echo 'Add day {}'

