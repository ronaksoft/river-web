#!/usr/bin/env bash

GOOS=js GOARCH=wasm go build -o test.wasm test2/*.go