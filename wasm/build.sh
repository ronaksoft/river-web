#!/usr/bin/env bash

GOOS=js GOARCH=wasm go build -o ../public/bin/test.wasm test2/*.go