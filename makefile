.PHONY: infra/up
infra/up:
	docker-compose up -d database cache cache-ui prometheus grafana elasticsearch logstash kibana jaeger zookeeper kafka kafdrop

.PHONY: infra/down
infra/down:
	docker-compose down

.PHONY: dev
dev:
	make infra/up
	HOST=localhost make migration/up
	docker-compose up -d api
	docker-compose exec api sh

.PHONY: test
test:
	make infra/up
	HOST=localhost make migration/up
	docker-compose up -d api
	docker-compose exec -T api npm ci
	docker-compose exec -T api npm test
	make clean/docker

.PHONY: clean/node
clean/node:
	rm -rf node_modules
	rm package-lock.json

.PHONY: clean/docker
clean/docker:
	make infra/down
	docker container prune -f
	docker volume prune -f
	docker image prune -f
	docker network prune -f
	rm -rf db/schema.sql
	rm -f db/schema.sql

.PHONY: clean/test
clean/test:
	sudo rm -rf coverage .nyc_output build

.PHONY: k8s/up
k8s/up:
	cp ./script/minikube.sh ./minikube.sh
	chmod +x ./minikube.sh
	bash ./minikube.sh
	minikube dashboard
	
.PHONY: k8s/down
k8s/down:
	minikube kubectl delete service api
	minikube stop
	rm ./minikube.sh

.PHONY: migration/up
migration/up:
	docker run -t --network=host -v "$(shell pwd)/db:/db" ghcr.io/amacneil/dbmate:1 --url postgres://root:db_password@$(HOST):5432/auth?sslmode=disable --wait --wait-timeout 60s --no-dump-schema up