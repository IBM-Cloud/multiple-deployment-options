#!/bin/bash
cd service

export FULL_IMAGE_NAME=${REGISTRY_URL}/${IMAGE_NAME}
echo "Using Docker image ${FULL_IMAGE_NAME}"
docker build -t ${FULL_IMAGE_NAME} .

echo "Generating Kubernetes deployment file in artifact directory"

mkdir $ARCHIVE_DIR/service
echo "IMAGE_NAME=${FULL_IMAGE_NAME}" > $ARCHIVE_DIR/service/image.env
copy fibonacci-deployment.yml $ARCHIVE_DIR/service/
