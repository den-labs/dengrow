#!/bin/bash

echo "Stopping PostgreSQL service..."
sudo service postgresql stop

echo "Stopping and removing all Docker containers..."
if [ "$(docker ps -q)" ]; then
    docker stop $(docker ps -q)
fi

if [ "$(docker ps -aq)" ]; then
    docker rm $(docker ps -aq)
fi

echo "Removing Docker network..."
if docker network inspect dengrow.devnet >/dev/null 2>&1; then
    docker network rm dengrow.devnet
fi

echo "Devnet environment stopped successfully!"
