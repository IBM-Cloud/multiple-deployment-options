#!/bin/bash
cd service

export FULL_IMAGE_NAME=${REGISTRY_URL}/${IMAGE_NAME}:latest
echo "Using Docker image ${FULL_IMAGE_NAME}"
docker build -t ${FULL_IMAGE_NAME} .

echo "Preparing archive for Kubernetes deployment..."

mkdir $ARCHIVE_DIR/.bluemix
cp ../.bluemix/pipeline-DEPLOY-Kubernetes.sh $ARCHIVE_DIR/.bluemix/

mkdir $ARCHIVE_DIR/service
echo "IMAGE_NAME=${FULL_IMAGE_NAME}" > $ARCHIVE_DIR/service/image.env
cp fibonacci-deployment.yml $ARCHIVE_DIR/service/
