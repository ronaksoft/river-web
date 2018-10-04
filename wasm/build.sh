#!/usr/bin/env bash

GOOS=js GOARCH=wasm go build -o ../public/bin/river.wasm test2/*.go