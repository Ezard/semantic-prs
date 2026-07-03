#!/bin/bash

set -e

npm install

npx tsc

echo "import { main } from './dist/index.js'; export { main };" > index.js

rm -rf node_modules
npm install --production
