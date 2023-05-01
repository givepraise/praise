#!/bin/sh

set -eu

# Initialize env.js, replace placeholders with environment variables
envsubst < "env.js" > "env.js.tmp" && mv "env.js.tmp" "env.js"
