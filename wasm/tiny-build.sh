#!/usr/bin/env bash

GOOS=js GOARCH=wasm tinygo build --no-debug -target wasm -o ../public/bin/river.wasm src/main.go