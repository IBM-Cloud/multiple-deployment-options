#!/bin/bash
cd service

if [ -f "image.env" ]; then
  echo 'Loading image name from image.env file.'
  source image.env
fi

if [ -z "$IMAGE_NAME" ]; then
  echo 'No Docker image specified.'
  exit 1
fi

################################################################
# Install dependencies
################################################################
echo 'Installing dependencies...'
sudo apt-get -qq update 1>/dev/null
sudo apt-get -qq install jq 1>/dev/null
sudo apt-get -qq install figlet 1>/dev/null

################################################################
# Deploy
################################################################
figlet 'Fibonacci Deployment'

# The cluster must be ready for us to continue
CLUSTER_STATE=$(bx cs workers $PIPELINE_KUBERNETES_CLUSTER_NAME | grep -m1 Ready | awk '{ print $6 }')
if [ "$CLUSTER_STATE" != "Ready" ]
then
  echo "Cluster is not in a Ready state (current state is $CLUSTER_STATE). Re-run this stage once the cluster is Ready."
  exit 1
fi

# Generate a tmp deployment file where the image name has been replaced by the actual image to use
echo "Using Docker image $IMAGE_NAME"
ESCAPED_IMAGE_NAME=$(echo $IMAGE_NAME | sed 's/\//\\\//g')
cat fibonacci-deployment.yml | sed 's/registry.ng.bluemix.net\/<namespace>\/fibonacci:latest/'$ESCAPED_IMAGE_NAME'/g' > tmp-fibonacci-deployment.yml

echo -e 'Deleting previous version of Fibonacci service...'
kubectl delete --ignore-not-found=true -f tmp-fibonacci-deployment.yml

echo -e 'Deploying Fibonacci service...'
kubectl create -f tmp-fibonacci-deployment.yml

IP_ADDR=$(bx cs workers $PIPELINE_KUBERNETES_CLUSTER_NAME | grep -m1 Ready | awk '{ print $2 }')
if [ -z $IP_ADDR ]; then
  echo "$PIPELINE_KUBERNETES_CLUSTER_NAME not created or workers not ready"
  exit 1
fi

PORT=$(kubectl get services | grep fibonacci-service | sed 's/.*://g' | sed 's/\/.*//g')

echo "Fibonacci service available at http://$IP_ADDR:$PORT"
