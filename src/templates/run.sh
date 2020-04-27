#!/bin/bash
CONTAINER_ID=$(docker ps -a --filter name=generated_was --format "{{.ID}}")
if [ $CONTAINER_ID ]
then
	docker rm $CONTAINER_ID
fi
IMAGE_ID=$(docker images --filter reference=generated_was --format "{{.ID}}")
if [ $IMAGE_ID ]
then
	docker rmi $IMAGE_ID
fi
docker-compose up -d