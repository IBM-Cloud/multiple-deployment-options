#!/bin/bash
cd service

################################################################
# Install dependencies
################################################################
echo 'Installing nvm (Node.js Version Manager)...'
npm config delete prefix
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.2/install.sh | bash > /dev/null 2>&1
. ~/.nvm/nvm.sh

echo 'Installing Node.js 6.9.1...'
nvm install 6.9.1 1>/dev/null
npm install --progress false --loglevel error 1>/dev/null

################################################################
# OpenWhisk artifacts
################################################################
bx login -a "$CF_TARGET_URL" --apikey "$PIPELINE_BLUEMIX_API_KEY" -o "$CF_ORG" -s "$CF_SPACE"
bx plugin install Cloud-Functions -r Bluemix -f
bx cloud-functions list

# Deploy the actions
echo "Uninstall"
node deploy.js --uninstall
echo "Install"
node deploy.js --install

OPENWHISK_API_HOST=$(bx wsk property get --apihost | awk '{print $4}')
echo "Fibonacci service available at https://$OPENWHISK_API_HOST/api/v1/web/${CF_ORG}_${CF_SPACE}/default/fibonacci"
