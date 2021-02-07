#!/usr/bin/env bash

if [[ $# -ge 2 ]]; then
    export CDK_DEPLOY_ACCOUNT=$1; shift;
    export CDK_DEPLOY_REGION=$1; shift;
    export SQS_MV_KMS_KEY_ID=$1; shift;
    export SQS_MV_SRC_QUEUE_NAME=$1; shift;
    export SQS_MV_DST_QUEUE_NAME=$1; shift;
    # echo "$CDK_DEPLOY_ACCOUNT, $CDK_DEPLOY_REGION, $SQS_MV_KMS_KEY_ID, $SQS_MV_SRC_QUEUE_NAME, $SQS_MV_DST_QUEUE_NAME, $*"

    npx cdk deploy "$@"
    exit $?
else
    echo 1>&2 "Provide AWS account and region as first two args."
    echo 1>&2 "Additional args are passed through to cdk deploy."
    exit 1
fi
