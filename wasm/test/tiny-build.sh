#!/usr/bin/env bash

GOOS=js GOARCH=wasm tinygo build -o test.wasm -target wasm main.go