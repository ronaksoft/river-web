#!/usr/bin/env bash

GOOS=js GOARCH=wasm go build -ldflags="-s -w" -o ../public/bin/river.wasm src/*.go