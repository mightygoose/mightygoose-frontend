#!/bin/sh

SERVER=$1

if [[ $SERVER == "" ]]
then
  echo "Server agument is required"
  exit 0
fi

echo "image will be deployed on $SERVER"

echo "\n\nlogging in to github containers registry"
echo $CR_PAT | docker login ghcr.io -u USERNAME --password-stdin

echo "\n\nbuilding the image"
docker buildx build --platform linux/x86_64  --tag ghcr.io/mightygoose/mightygoose-frontend:latest .

echo "\n\npushing the image to repositiry"
docker push ghcr.io/mightygoose/mightygoose-frontend:latest

echo "\n\ndeploying on dokku"
ssh $SERVER "dokku git:from-image mightygoose-frontend ghcr.io/mightygoose/mightygoose-frontend:latest"
