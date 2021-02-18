#!/usr/bin/env bash

# Internal: Print message to stderr and exit.
#
# $1 - Message to log prior to exiting.
# $2 - Exit code (default: 1)
#
# Returns nothing.
_die() {
  local msg=$1
  local code=${2-1}
  _msg "$msg"
  exit "$code"
}

# Internal: Print logs/messages to stderr. For script output, print to stdout
# with echo.
#
# $1- - Message to log.
#
# Returns nothing.
_msg() {
  echo >&2 -e "${1-}"
}

# Internal: Enable use of colors in `msg`, don't use with `printf` or `echo`.
#
# Returns nothing.
_setup_colors() {
  if [[ -t 2 ]] && [[ -z "${NO_COLOR-}" ]] && [[ "${TERM-}" != "dumb" ]]; then
    NOFORMAT='\033[0m' RED='\033[0;31m' GREEN='\033[0;32m' ORANGE='\033[0;33m' BLUE='\033[0;34m' PURPLE='\033[0;35m' CYAN='\033[0;36m' YELLOW='\033[1;33m'
  else
    export NOFORMAT='' RED='' GREEN='' ORANGE='' BLUE='' PURPLE='' CYAN='' YELLOW=''
  fi
}
