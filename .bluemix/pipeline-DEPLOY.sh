#!/bin/bash


################################################################
# And the web app
################################################################

# Push app
cd service
if ! cf app $CF_APP; then
  cf push $CF_APP
else
  OLD_CF_APP=${CF_APP}-OLD-$(date +"%s")
  rollback() {
    set +e
    if cf app $OLD_CF_APP; then
      cf logs $CF_APP --recent
      cf delete $CF_APP -f
      cf rename $OLD_CF_APP $CF_APP
    fi
    exit 1
  }
  set -e
  trap rollback ERR
  cf rename $CF_APP $OLD_CF_APP
  cf push $CF_APP
  cf delete $OLD_CF_APP -f
fi
# Export app name and URL for use in later Pipeline jobs
export CF_APP_NAME="$CF_APP"
export APP_URL=http://$(cf app $CF_APP_NAME | grep urls: | awk '{print $2}')
# View logs
#cf logs "${CF_APP}" --recent
