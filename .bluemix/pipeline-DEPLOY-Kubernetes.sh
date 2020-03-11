#!/bin/bash
set -e

cd service

if [ -z "$IMAGE_URL" ]; then
  echo 'No Docker image specified.'
  exit 1
fi

if [ -z "$TARGET_NAMESPACE" ]; then
  export TARGET_NAMESPACE=default
fi
echo "TARGET_NAMESPACE=$TARGET_NAMESPACE"

################################################################
# Deploy
################################################################
# The cluster must be ready for us to continue
CLUSTER_STATE=$(ibmcloud ks workers $PIPELINE_KUBERNETES_CLUSTER_NAME | grep -m1 Ready | awk '{ print $6 }')
if (ibmcloud ks workers $PIPELINE_KUBERNETES_CLUSTER_NAME --json | grep -iq "\"status\": \"Ready\""); then
  echo "Cluster is ready"
else
  echo "Could not find a worker node in a Ready state in the cluster."
  exit 1
fi

echo "Deleting previous version of Fibonacci service..."
kubectl delete --namespace $TARGET_NAMESPACE -f fibonacci-deployment.yml || true

echo "Deploying Fibonacci service..."
cat fibonacci-deployment.yml | \
  IMAGE_URL=$IMAGE_URL \
  envsubst | \
  kubectl apply --namespace $TARGET_NAMESPACE -f - || exit 1

IP_ADDR=$(ibmcloud ks workers $PIPELINE_KUBERNETES_CLUSTER_NAME --json | jq -r '[.[] | select(.status=="Ready")][0].publicIP')
if [ -z $IP_ADDR ]; then
  echo "Could not find a worker in a Ready state with a public IP"
  exit 1
fi

PORT=$(kubectl get services --namespace $TARGET_NAMESPACE | grep fibonacci-service | sed 's/.*://g' | sed 's/\/.*//g')

echo "Fibonacci service available at http://$IP_ADDR:$PORT"
