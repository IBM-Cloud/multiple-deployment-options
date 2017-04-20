#!/bin/bash
cd service

################################################################
# install_bx.sh
################################################################
#!/bin/bash

echo "Download Bluemix CLI"
wget --quiet --output-document=/tmp/Bluemix_CLI_amd64.tar.gz  http://public.dhe.ibm.com/cloud/bluemix/cli/bluemix-cli/latest/Bluemix_CLI_amd64.tar.gz
tar -xf /tmp/Bluemix_CLI_amd64.tar.gz --directory=/tmp

# Create bx alias
echo "#!/bin/sh" >/tmp/Bluemix_CLI/bin/bx
echo "/tmp/Bluemix_CLI/bin/bluemix \"\$@\" " >>/tmp/Bluemix_CLI/bin/bx
chmod +x /tmp/Bluemix_CLI/bin/*

export PATH="/tmp/Bluemix_CLI/bin:$PATH"

# Install Armada CS plugin
echo "Install the Bluemix container-service plugin"
bx plugin install container-service -r Bluemix

echo "Install kubectl"
wget --quiet --output-document=/tmp/Bluemix_CLI/bin/kubectl  https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl
chmod +x /tmp/Bluemix_CLI/bin/kubectl

if [ -n "$DEBUG" ]; then
  bx --version
  bx plugin list
fi


################################################################
# bx_login.sh
################################################################
#!/bin/sh

if [ -z $CF_ORG ]; then
  CF_ORG="$BLUEMIX_ORG"
fi
if [ -z $CF_SPACE ]; then
  CF_SPACE="$BLUEMIX_SPACE"
fi


if [ -z "$BLUEMIX_USER" ] || [ -z "$BLUEMIX_PASSWORD" ] || [ -z "$BLUEMIX_ACCOUNT" ]; then
  echo "Define all required environment variables and rerun the stage."
  exit 1
fi
echo "Deploy pods"

echo "bx login -a $CF_TARGET_URL"
bx login -a "$CF_TARGET_URL" -u "$BLUEMIX_USER" -p "$BLUEMIX_PASSWORD" -c "$BLUEMIX_ACCOUNT" -o "$CF_ORG" -s "$CF_SPACE"
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
echo "Fibonacci Application"
IP_ADDR=$(bx cs workers $CLUSTER_NAME | grep deployed | awk '{ print $2 }')
if [ -z $IP_ADDR ]; then
  echo "$CLUSTER_NAME not created or workers not ready"
  exit 1
fi

echo -e "Configuring vars"
exp=$(bx cs cluster-config $CLUSTER_NAME | grep export)
if [ $? -ne 0 ]; then
  echo "Cluster $CLUSTER_NAME not created or not ready."
  exit 1
fi
eval "$exp"

echo -e "Downloading fibonacci yml"
curl --silent "https://raw.githubusercontent.com/IBM-Bluemix/multiple-deployment-options/dev/service/fibonacci-deployment.yml" > fibonacci-deployment.yml
sed -i '130i\ \ type: NodePort' fibonacci-deployment.yml #For OSX: brew install gnu-sed; replace sed references with gsed

echo -e "Deleting previous version of guestbook if it exists"
kubectl delete --ignore-not-found=true   -f fibonacci-deployment.yml

echo -e "Creating pods"
kubectl create -f fibonacci-deployment.yml

#PORT=$(kubectl get services | grep frontend | sed 's/.*://g' | sed 's/\/.*//g')
PORT=30080

echo ""
echo "View Kubernetes fibonacci-deployment at http://$IP_ADDR:$PORT"
