#!/usr/bin/env bash

GOOS=js GOARCH=wasm tinygo build -ldflags="-s -w" -o river.wasm -target wasm src/flat/main.go