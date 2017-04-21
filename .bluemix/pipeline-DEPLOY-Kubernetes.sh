#!/bin/bash
cd service

if [ -z "$BLUEMIX_API_KEY" ]; then
  echo 'No Bluemix API key specified in the pipeline. Skipping Kubernetes deployment.'
  exit 0
fi

################################################################
# Install dependencies
################################################################
echo 'Installing dependencies...'
sudo apt-get -qq update 1>/dev/null
sudo apt-get -qq install jq 1>/dev/null
sudo apt-get -qq install figlet 1>/dev/null

figlet -f small 'Bluemix CLI'

wget --quiet --output-document=/tmp/Bluemix_CLI_amd64.tar.gz  http://public.dhe.ibm.com/cloud/bluemix/cli/bluemix-cli/latest/Bluemix_CLI_amd64.tar.gz
tar -xf /tmp/Bluemix_CLI_amd64.tar.gz --directory=/tmp

# Create bx alias
echo "#!/bin/sh" >/tmp/Bluemix_CLI/bin/bx
echo "/tmp/Bluemix_CLI/bin/bluemix \"\$@\" " >>/tmp/Bluemix_CLI/bin/bx
chmod +x /tmp/Bluemix_CLI/bin/*

export PATH="/tmp/Bluemix_CLI/bin:$PATH"

figlet -f small 'Container Service'
bx plugin install container-service -r Bluemix

figlet -f small 'kubectl'
wget --quiet --output-document=/tmp/Bluemix_CLI/bin/kubectl  https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl
chmod +x /tmp/Bluemix_CLI/bin/kubectl

bx --version
bx plugin list

figlet 'Logging in Bluemix'

echo "bx login -a $CF_TARGET_URL"
bx login -a "$CF_TARGET_URL" --apikey "$BLUEMIX_API_KEY" -o "$CF_ORG" -s "$CF_SPACE"
if [ $? -ne 0 ]; then
  echo "Failed to authenticate to Bluemix"
  exit 1
fi

# Init container clusters
echo "bx cs init"
bx cs init
if [ $? -ne 0 ]; then
  echo "Failed to initialize to Bluemix Container Service"
  exit 1
fi

################################################################
# Deploy
################################################################
#!/bin/bash
# echo "Fibonacci Application"
# IP_ADDR=$(bx cs workers $CLUSTER_NAME | grep deployed | awk '{ print $2 }')
# if [ -z $IP_ADDR ]; then
#   echo "$CLUSTER_NAME not created or workers not ready"
#   exit 1
# fi
#
# echo -e "Configuring vars"
# exp=$(bx cs cluster-config $CLUSTER_NAME | grep export)
# if [ $? -ne 0 ]; then
#   echo "Cluster $CLUSTER_NAME not created or not ready."
#   exit 1
# fi
# eval "$exp"
#
# echo -e "Downloading fibonacci yml"
# curl --silent "https://raw.githubusercontent.com/IBM-Bluemix/multiple-deployment-options/dev/service/fibonacci-deployment.yml" > fibonacci-deployment.yml
# sed -i '130i\ \ type: NodePort' fibonacci-deployment.yml #For OSX: brew install gnu-sed; replace sed references with gsed
#
# echo -e "Deleting previous version of guestbook if it exists"
# kubectl delete --ignore-not-found=true   -f fibonacci-deployment.yml
#
# echo -e "Creating pods"
# kubectl create -f fibonacci-deployment.yml
#
# #PORT=$(kubectl get services | grep frontend | sed 's/.*://g' | sed 's/\/.*//g')
# PORT=30080
#
# echo ""
# echo "View Kubernetes fibonacci-deployment at http://$IP_ADDR:$PORT"
