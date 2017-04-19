#!/bin/bash
cd service

################################################################
# And the web app
################################################################

# Push app
. ./kubernetes-scripts/install_bx.sh
  ./kubernetes-scripts/bx_login.sh
  ./kubernetes-scripts/deploy.sh
