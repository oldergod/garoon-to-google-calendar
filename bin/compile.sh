#!/bin/bash
set -e
BASEDIR=$(cd $(dirname $0)/..; pwd)
cd $BASEDIR

for namespace in {background,options,contentScript};do
  echo Compiling g2gc/bundleJs/bundle${namespace^}.js
  rm -f g2gc/bundleJs/bundle${namespace^}.min.js
  java -jar node_modules/google-closure-compiler/compiler.jar \
    --js g2gc/bundleJs/bundle${namespace^}.js \
    --js_output_file g2gc/bundleJs/bundle${namespace^}.min.js \
    --compilation_level="ADVANCED_OPTIMIZATIONS" \
    --formatting="PRETTY_PRINT" \
    --externs="g2gc/externs/chrome_extensions.js" \
    --externs="g2gc/externs/es6-promise.js" \
    --externs="g2gc/externs/gapi.js" \
    --warning_level="VERBOSE" \
    --jscomp_error="accessControls" \
    --jscomp_error="ambiguousFunctionDecl" \
    --jscomp_error="checkEventfulObjectDisposal" \
    --jscomp_error="checkRegExp" \
    --jscomp_error="checkStructDictInheritance" \
    --jscomp_error="checkTypes" \
    --jscomp_error="checkVars" \
    --jscomp_error="conformanceViolations" \
    --jscomp_error="const" \
    --jscomp_error="constantProperty" \
    --jscomp_error="deprecated" \
    --jscomp_error="duplicateMessage" \
    --jscomp_error="es3" \
    --jscomp_error="es5Strict" \
    --jscomp_error="externsValidation" \
    --jscomp_error="fileoverviewTags" \
    --jscomp_error="globalThis" \
    --jscomp_error="inferredConstCheck" \
    --jscomp_error="internetExplorerChecks" \
    --jscomp_error="invalidCasts" \
    --jscomp_error="misplacedTypeAnnotation" \
    --jscomp_error="missingGetCssName" \
    --jscomp_error="missingProperties" \
    --jscomp_error="missingProvide" \
    --jscomp_error="missingRequire" \
    --jscomp_error="missingReturn" \
    --jscomp_error="newCheckTypes" \
    --jscomp_error="nonStandardJsDocs" \
    --jscomp_error="suspiciousCode" \
    --jscomp_error="strictModuleDepCheck" \
    --jscomp_error="typeInvalidation" \
    --jscomp_error="undefinedNames" \
    --jscomp_error="undefinedVars" \
    --jscomp_warning="unknownDefines" \
    --jscomp_error="uselessCode" \
    --jscomp_error="useOfGoogBase" \
    --jscomp_error="visibility"
done
