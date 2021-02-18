#!/usr/bin/env bash
set -Eeuo pipefail
script_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd -P)

# shellcheck source=./util.sh
source "$script_dir/util.sh"

__usage() {
  cat <<EOF
Usage: build.sh [--help] [--debug] [--kms-key] [AWS_ACCOUNT] [AWS_REGION] [SRC_QUEUE_NAME] [DST_QUEUE_NAME] [CDK_COMMAND] [CDK_ARGS...]
EOF
  exit
}

__parse_params() {
  while :; do
    case "${1-}" in
    -h | --help) show_help=1 ;;
    -d | --debug) set -x ;;
    --no-color) NO_COLOR=1 ;;
    --kms-key)
      shift
      export SQS_MV_KMS_KEY_ID=$1
      ;;
    -?*) _die "${RED}Unknown option: '$1'.$NOFORMAT" ;;
    *) break ;;
    esac
    shift
  done

  [[ -n "${show_help-}" ]] && __usage

  [[ $# -lt 5 ]] && _die "${RED}Invalid number arguments, try \`--help\`.$NOFORMAT"

  export CDK_DEPLOY_ACCOUNT=$1; shift;
  export CDK_DEPLOY_REGION=$1; shift;
  export SQS_MV_SRC_QUEUE_NAME=$1; shift;
  export SQS_MV_DST_QUEUE_NAME=$1; shift;

  if type "git" >/dev/null; then
    local rev
    rev=$(git rev-parse --short HEAD)
    export GIT_SHORT_REV=$rev
  fi
  # _msg "${BLUE}
  # CDK_DEPLOY_ACCOUNT=$CDK_DEPLOY_ACCOUNT
  # CDK_DEPLOY_REGION=$CDK_DEPLOY_REGION
  # SQS_MV_KMS_KEY_ID=${SQS_MV_KMS_KEY_ID-}
  # SQS_MV_SRC_QUEUE_NAME=$SQS_MV_SRC_QUEUE_NAME
  # SQS_MV_DST_QUEUE_NAME=$SQS_MV_DST_QUEUE_NAME
  # CDK_COMMAND and CDK_ARGS=$*$NOFORMAT"

  npx cdk "$@"

  return 0
}

_main() {
  _setup_colors
  __parse_params "$@"
}

_main "$@"
