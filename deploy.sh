#!/bin/sh

SERVER=$1
TAG=$2

if [[ $SERVER == "" ]]
then
  echo "Server agument is required"
  exit 0
fi

if [[ $TAG == "" ]]
then
  TAG=$(git rev-parse HEAD)
fi

echo "Using tag $TAG"

echo "image will be deployed on $SERVER"

echo "\n\nlogging in to github containers registry"
echo $CR_PAT | docker login ghcr.io -u USERNAME --password-stdin

echo "\n\nbuilding the image"
docker buildx build --platform linux/x86_64  --tag ghcr.io/mightygoose/mightygoose-frontend:$TAG .

echo "\n\npushing the image to repositiry"
docker push ghcr.io/mightygoose/mightygoose-frontend:$TAG

echo "\n\ndeploying on dokku"
ssh $SERVER "docker pull ghcr.io/mightygoose/mightygoose-frontend:$TAG && dokku git:from-image mightygoose-frontend ghcr.io/mightygoose/mightygoose-frontend:$TAG"
