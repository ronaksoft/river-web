#!/usr/bin/env bash

GOOS=js GOARCH=wasm tinygo build -o river.wasm -target wasm flat/main.go