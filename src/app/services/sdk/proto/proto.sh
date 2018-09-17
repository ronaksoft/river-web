#!/usr/bin/env bash

# Path to this plugin
PROTOC_GEN_TS_PATH="../../../../../node_modules/ts-protoc-gen/bin/protoc-gen-ts"

IN_DIR="*.proto"

# Directory to write generated code to (.js and .d.ts files)
OUT_DIR="../messages"

protoc \
    --plugin="protoc-gen-ts=${PROTOC_GEN_TS_PATH}" \
    --js_out="import_style=commonjs,binary:${OUT_DIR}" \
    --ts_out="${OUT_DIR}" \
    ${IN_DIR}