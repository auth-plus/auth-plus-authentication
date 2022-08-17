#!/bin/bash

# Start minikube
minikube start

# Set docker env
eval $(minikube docker-env)

# Build image
docker build -t api:0.0.1 .

# Run in minikube
kubectl apply -f ./script/deployment.yml