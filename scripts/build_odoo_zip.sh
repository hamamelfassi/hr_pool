#!/bin/sh
set -eu

exec "$(dirname "$0")/build_module_zip.sh" hr_pool
