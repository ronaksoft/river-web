#!/usr/bin/env bash

GOOS=js GOARCH=wasm tinygo build -ldflags="-s -w" -o test.wasm -target wasm main.go