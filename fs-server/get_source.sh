#!/bin/sh

cd /shared-git/
echo git fetch $REPO_URL $GIT_BRANCH:$SRC_DIR
git fetch $REPO_URL $GIT_BRANCH:$SRC_DIR
cd ..

echo git clone --branch $SRC_DIR /shared-git/ /source/$SRC_DIR
git clone --branch $SRC_DIR /shared-git/ /source/$SRC_DIR
