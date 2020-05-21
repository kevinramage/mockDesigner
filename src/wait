#!/bin/bash
TEST=$(docker ps -f name=$1 -f status=running --format "{{.ID}}")
while [ -z $TEST ]; do
  sleep 1
  TEST=$(docker ps -f name=$1 -f status=running --format "{{.ID}}")
done
echo "Container: $TEST"
docker ps -a
LOGS=$(docker logs $TEST | grep "server started on" | wc -l)
while [ $LOGS -eq 0 ]; do
  sleep 1
  LOGS=$(docker logs $TEST | grep "server started on" | wc -l)
done
docker logs $TEST