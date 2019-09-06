#!/usr/bin/env bash

GOOS=js GOARCH=wasm /Users/hamidrezakk/go/bin/tinygo build -ldflags="-s -w" -o river.wasm -target wasm flat/main.go