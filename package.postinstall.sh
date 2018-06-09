#!/usr/bin/env bash
set -e -u -o pipefail

if [[ ! -d '.mason' ]]; then
    mkdir .mason
    curl -sSfL https://github.com/mapbox/mason/archive/3696359.tar.gz \
        | tar --gunzip --extract --strip-components=1 --directory=.mason
fi

.mason/mason install osmium-tool 5196c3c
ln -f -s "$(.mason/mason prefix osmium-tool 5196c3c)/bin/osmium" bin/
