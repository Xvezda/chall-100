#!/bin/bash

if type python >/dev/null 2>&1; then
    python -m SimpleHTTPServer
elif type python3 >/dev/null 2>&1; then
    python3 -m http.server
fi

