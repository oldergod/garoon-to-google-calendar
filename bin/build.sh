#!/bin/bash
set -e
BASEDIR=$(cd $(dirname $0)/..; pwd)
cd $BASEDIR

for namespace in {background,options,contentScript};do
  echo Building g2gc/bundleJs/bundle${namespace^}.js
  rm -f g2gc/bundleJs/bundle${namespace^}.js
  node_modules/google-closure-library/closure/bin/build/closurebuilder.py \
    --namespace g2gc.${namespace} \
    --root node_modules/google-closure-library \
    --root g2gc/javascript \
    --output_mode script \
    --output_file g2gc/bundleJs/bundle${namespace^}.js
done
